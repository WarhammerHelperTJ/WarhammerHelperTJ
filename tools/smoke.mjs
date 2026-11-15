// Browser smoke test: opens every tab for every faction in headless Chrome/Edge and fails on page errors or a stuck
// "Loading…". No dependencies: Chrome DevTools Protocol over Node's built-in WebSocket. `npm run smoke`.
// Browser: $CHROME_PATH, else the usual Chrome/Edge install paths.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PORT = 5199, DEBUG = 9333, BASE = `http://localhost:${PORT}/index.html`;
const BROWSERS = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].filter(Boolean);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const exe = BROWSERS.find((p) => existsSync(p));
if (!exe) { console.error('No Chrome/Edge found; set CHROME_PATH.'); process.exit(2); }

const server = spawn(process.execPath, ['tools/serve.mjs'], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
const profile = mkdtempSync(join(tmpdir(), 'smoke-'));
const browser = spawn(exe, ['--headless=new', `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
const cleanup = () => { browser.kill(); server.kill(); try { rmSync(profile, { recursive: true, force: true }); } catch { /* locked */ } };

async function connect() {
  for (let i = 0; i < 50; i++) {
    try {
      const page = (await (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json()).find((t) => t.type === 'page');
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(200);
  }
  throw new Error('browser did not start');
}

const errors = [], failures = [];
let ws, id = 0;
const pending = new Map();
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id;
  pending.set(n, { resolve, reject });
  ws.send(JSON.stringify({ id: n, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
  return r.result.value;
};

// Builds one roster per faction (all units, all detachments) plus the example rosters; returns their ids.
const SEED = `(async () => {
  const D = await import('/js/data.js'), R = await import('/js/roster.js'), S = await import('/js/store.js');
  const rosters = [];
  for (const f of await D.loadFactions()) {
    const fac = await D.loadFaction(f.id);
    rosters.push({ id: R.uid(), name: f.name + ' (all units)', faction: f.id, mode: 'custom', limit: 0,
      detachments: fac.detachments.map((d) => d.id), units: fac.datasheets.map((d) => R.newUnit(d)) });
    try { rosters.push(R.rosterFromTemplate(await D.loadExampleRoster(f.id), fac)); } catch { /* no example */ }
  }
  S.update((s) => { s.rosters = rosters; s.game = null; s.games = []; });
  return rosters.map((r) => [r.id, r.name]);
})()`;
const START = (rid, phase) => `(async () => {
  const D = await import('/js/data.js'), G = await import('/js/game.js'), S = await import('/js/store.js');
  const r = S.get().rosters.find((x) => x.id === '${rid}');
  const g = G.newGame(r, await D.loadFaction(r.faction), 'me');
  S.update((s) => { s.activeRosterId = r.id; s.game = { ...g, phase: '${phase}' }; });
})()`;

async function visit(label, hash, after) {
  const before = errors.length;
  await evaluate(`location.hash = '${hash}'`);
  await sleep(700);
  if (after) { await evaluate(after); await sleep(400); }
  const text = await evaluate(`document.querySelector('#view')?.innerText ?? ''`);
  const problems = errors.slice(before);
  if (/^Loading…|Could not load/m.test(text)) problems.push(`stuck: ${text.slice(0, 80).replace(/\n/g, ' ')}`);
  if (!text.trim()) problems.push('empty view');
  console.log(`${problems.length ? 'FAIL' : 'ok  '} ${label}`);
  for (const p of problems) { console.log(`       ${p}`); failures.push(`${label}: ${p}`); }
}

try {
  ws = new WebSocket(await connect());
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { const p = pending.get(msg.id); pending.delete(msg.id); msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result); return; }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description?.split('\n')[0] ?? msg.params.exceptionDetails.text);
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') errors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Page.navigate', { url: `${BASE}#/army` });
  await sleep(1500);
  const rosters = await evaluate(SEED);
  for (const [rid, name] of rosters) {
    await evaluate(START(rid, 'command'));
    await visit(`${name} · Army`, '#/army');
    await visit(`${name} · Game`, '#/game');
    await visit(`${name} · Game score setup`, '#/game', `document.querySelector('[data-k="pane-score"]')?.click()`);
    await visit(`${name} · Game scoring started`, '#/game', `document.querySelector('[data-k="sc-start"]')?.click()`);
    // every round, both turns, Command and Fight (the scoring windows), incl. entering Tactical cards
    for (const round of [1, 2, 5]) for (const turn of ['me', 'opp']) for (const phase of ['command', 'fight']) {
      await visit(`${name} · Score round ${round} ${turn} ${phase}`, '#/game', `(async () => {
        const S = await import('/js/store.js');
        S.update((s) => { Object.assign(s.game, { round: ${round}, turn: '${turn}', phase: '${phase}' }); });
        await new Promise((r) => setTimeout(r, 300));
        const add = document.querySelector('[data-k="sc-add"]');
        if (add) { add.value = add.options[1]?.value ?? ''; add.dispatchEvent(new Event('change')); }
        await new Promise((r) => setTimeout(r, 300));
        document.querySelector('.score-line:not([disabled])')?.click();
      })()`);
    }
    for (const phase of ['command', 'movement', 'shooting', 'charge', 'fight']) {
      await evaluate(START(rid, phase));
      await visit(`${name} · Attack (${phase})`, '#/attack');
    }
    await visit(`${name} · Attack target editor`, '#/attack', `document.querySelector('[data-k="atk-tp-toggle"]')?.click()`);
    await evaluate(`location.hash = '#/army'`);
  }
} catch (e) {
  failures.push(String(e.stack ?? e));
  console.error(e);
} finally {
  ws?.close();
  cleanup();
}
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nall tabs ok');
process.exit(failures.length ? 1 : 0);
