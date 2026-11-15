// docs/source/<faction>-11e.md -> data/core/*.json (Part A of the core file), data/<faction>/{datasheets,detachments}.json (SPEC "Data model").
// Re-runnable. Prints counts, and every Part B/C line no rule consumed (target: none).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseWeaponAbilities, KNOWN_ABILITIES } from '../js/engine/parse.js';

const ROOT = new URL('../', import.meta.url);
// keyword: faction keyword added to every datasheet (null: the source's Keywords line already ends with it)
const FACTIONS = [
  { id: 'orks', file: 'orks-11e.md', keyword: 'ORKS', core: true },
  { id: 'emperors-children', file: 'emperors-children-11e.md', keyword: null },
];
let L, used, issues, FACTION_KW;
const FORCE_DISPOSITIONS = ['Take and Hold', 'Disruption', 'Purge the Foe', 'Priority Assets', 'Reconnaissance'];

// ---------- missions (docs/source/missions-11e.md) -> data/core/missions.json ----------
const ROUNDS = {
  'ANY BATTLE ROUND': [1, 5], 'FIRST BATTLE ROUND': [1, 1], 'FIRST AND SECOND BATTLE ROUND': [1, 2],
  'SECOND BATTLE ROUND ONWARDS': [2, 5], 'SECOND TO FOURTH BATTLE ROUND': [2, 4], 'SECOND AND THIRD BATTLE ROUND': [2, 3],
  'FOURTH BATTLE ROUND ONWARDS': [4, 5], 'FIFTH BATTLE ROUND': [5, 5], 'END OF THE BATTLE': null,
};
// timing = when a line can score; round5 = its timing in the fifth battle round
const TIMINGS = {
  'End of your turn.': { timing: 'yourTurnEnd' },
  'End of your Command phase.': { timing: 'yourCommand' },
  'End of your Command phase (or the end of your turn in the fifth battle round).': { timing: 'yourCommand', round5: 'yourTurnEnd' },
  'End of a turn.': { timing: 'anyTurnEnd' },
  'End of your opponent’s turn.': { timing: 'oppTurnEnd' },
  // in round 5 the opponent's turn ends before or with the round, so this is always the end of their turn
  'End of your opponent’s turn or the end of the fifth battle round (whichever comes first).': { timing: 'oppTurnEnd' },
};
function missionCards() {
  const M = readFileSync(new URL('docs/source/missions-11e.md', ROOT), 'utf8').split(/\r?\n/);
  const start = M.findIndex(s => s.startsWith('# PART M'));
  if (start < 0) throw new Error('missions-11e.md: PART M not found');
  const primaries = [], secondaries = [], bad = [];
  let card = null, block = null, when = null;
  for (const s of M.slice(start + 1)) {
    let m;
    if (!s.trim()) continue;
    if ((m = /^## PRIMARY: (.+) — (.+) vs (.+)$/.exec(s))) {
      primaries.push(card = { id: kebab(m[1]), name: m[1], forceDisposition: m[2], opponent: m[3], intro: [], blocks: [], text: s.slice(3) });
      block = null;
    } else if ((m = /^## SECONDARY: (.+?)( \(Fixed\))?$/.exec(s))) {
      secondaries.push(card = { id: kebab(m[1]), name: m[1], fixed: !!m[2], intro: [], blocks: [], text: s.slice(3) });
      block = null;
    } else if (!card) bad.push(s);
    else {
      card.text += `\n${s}`;
      if ((m = /^### (.+)$/.exec(s))) {
        if (!(m[1] in ROUNDS)) bad.push(s);
        card.blocks.push(block = { header: m[1], rounds: ROUNDS[m[1]], endOfBattle: ROUNDS[m[1]] === null, lines: [] });
        when = null;
      } else if ((m = /^WHEN: (.+)$/.exec(s))) {
        if (!TIMINGS[m[1]]) bad.push(s);
        when = { when: m[1], ...TIMINGS[m[1]] };
      } else if ((m = /^• (OR )?(.+?) — (.+)$/.exec(s)) && block) {
        const vp = m[2];
        const num = (re) => { const x = re.exec(vp); return x ? +x[1] : null; };
        const line = { ...(when ?? {}), or: !!m[1], cumulative: /CUMULATIVE/.test(vp), vp: num(/^\+?(\d+)VP/),
          fixed: num(/(\d+)VP FIXED/), tactical: num(/(\d+)VP TACTICAL/), upTo: num(/UP TO (\d+)VP/), label: vp, text: m[3] };
        if (line.vp == null) bad.push(s);
        block.lines.push(line);
      } else card.intro.push(s);   // WHEN DRAWN, actions, notes, card-wide rules
    }
  }
  if (primaries.length !== 25) bad.push(`expected 25 primaries, got ${primaries.length}`);
  for (const a of FORCE_DISPOSITIONS) for (const b of FORCE_DISPOSITIONS) {
    if (primaries.filter(p => p.forceDisposition === a && p.opponent === b).length !== 1) bad.push(`no single primary for ${a} vs ${b}`);
  }
  if (bad.length) throw new Error(`missions-11e.md:\n  ${bad.join('\n  ')}`);
  return { forceDispositions: FORCE_DISPOSITIONS, primaries, secondaries };
}

const kebab = s => s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const find = (pred, from = 0) => L.findIndex((s, i) => i >= from && pred(s));
const list = s => s.split(',').map(x => x.trim()).filter(Boolean);
const append = (a, b) => (a ? `${a}\n${b}` : b);

let A3, A4, B, C;

// ---------- shared pieces ----------
function table(i) {
  const cells = s => s.trim().slice(1, -1).split('|').map(c => c.trim());
  const header = cells(L[i]);
  used.add(i).add(i + 1); // header + |---| row
  const rows = [];
  let j = i + 2;
  for (; j < L.length && L[j].startsWith('|'); j++) { used.add(j); rows.push(cells(L[j])); }
  return { header, rows, end: j };
}

function weapon(row, header, where) {
  const c = Object.fromEntries(header.map((h, k) => [h, row[k]]));
  const type = 'BS' in c ? 'ranged' : 'melee';
  const num = (v, f) => {
    if (/^-?\d+$/.test(v)) return Number(v);
    issues.nonNumeric.push(`${where}: ${c.Weapon} ${f}=${v}`);
    return v;
  };
  const skill = c.BS ?? c.WS;
  const cut = c.Weapon.indexOf(' - ');
  const unknown = [];
  const w = {
    id: kebab(c.Weapon),
    name: cut < 0 ? c.Weapon : c.Weapon.slice(0, cut),
    profile: cut < 0 ? null : c.Weapon.slice(cut + 3),
    type,
    range: type === 'ranged' ? c.Range : null,
    A: c.A,
    skill: skill === '-' ? null : /^\d\+$/.test(skill) ? parseInt(skill, 10) : num(skill, 'skill'),
    S: num(c.S, 'S'),
    AP: num(c.AP, 'AP'),
    D: c.D,
    keywordsText: c.Keywords,
    abilities: parseWeaponAbilities(c.Keywords, unknown),
  };
  if (typeof w.AP === 'number' && w.AP > 0) issues.notes.push(`${where}: ${c.Weapon} has positive AP ${w.AP}`);
  if (unknown.length) issues.unknownTokens.push(`${where}: ${c.Weapon}: ${unknown.join(' ')}`);
  return w;
}

function stratagem(header, body, detachment) {
  const parts = header.split(' — ');
  const m = /^\[(Your|Opponent's|Either) turn, (.+)\]$/.exec(parts.pop());
  if (!m || parts.length !== (detachment ? 3 : 2)) throw new Error(`stratagem header: ${header}`);
  if (detachment && parts[2] !== detachment.name) issues.notes.push(`stratagem ${parts[0]} names detachment "${parts[2]}" inside ${detachment.name}`);
  const name = parts[0].replace(/\s*\(also called [^)]*\)/, ''); // alias stays in `text`
  const f = { when: null, target: null, effect: null, restrictions: null };
  let key = null;
  for (const line of body) {
    for (const seg of line.split(/ (?=(?:WHEN|TARGET|EFFECT|RESTRICTIONS): )/)) {
      const lm = /^(WHEN|TARGET|EFFECT|RESTRICTIONS): (.*)$/.exec(seg);
      if (lm) { key = lm[1].toLowerCase(); f[key] = lm[2]; }
      else if (key) f[key] = append(f[key], seg);
      else issues.notes.push(`stratagem ${name}: text before any label: ${seg}`);
    }
  }
  return {
    id: kebab(name),
    name,
    cp: parseInt(parts[1], 10),
    detachment: detachment ? detachment.id : null,
    turn: { your: 'your', "opponent's": 'opponent', either: 'either' }[m[1].toLowerCase()],
    phases: /^any/i.test(m[2]) ? ['any'] : m[2].toLowerCase().split('/').map(p => p.trim()),
    ...f,
    text: [header, ...body].join('\n'),
  };
}

// ---------- Part A3: ability table ----------
function coreAbilities() {
  const t = table(find(s => s.startsWith('| Ability |'), A3));
  const out = [];
  for (const [cell, text] of t.rows) {
    for (const part of cell.split(' / ')) {
      const name = part.replace(/\s*\(.*?\)/g, '').replace(/[[\]]/g, '').replace(/-X\b/, '')
        .replace(/(\s[XY]\+?)+$/, '').trim().toUpperCase();
      if (!out.some(a => a.name === name)) out.push({ name, text });
    }
  }
  const names = out.map(a => a.name);
  for (const n of names) if (!KNOWN_ABILITIES.includes(n)) issues.notes.push(`A3 ability ${n} missing from parse.js KNOWN_ABILITIES`);
  for (const n of KNOWN_ABILITIES) if (!names.includes(n)) issues.notes.push(`parse.js ability ${n} not in A3`);
  return out;
}

// ---------- Part A4: core stratagems ----------
function coreStratagems() {
  const out = [];
  let cur = null;
  for (let j = find(s => s === '### Core stratagems', A4) + 1; j < B; j++) {
    const s = L[j];
    if (s.startsWith('#### ')) out.push(cur = { header: s.slice(5), body: [] });
    else if (s.trim() && cur) cur.body.push(s);
  }
  return out.map(x => stratagem(x.header, x.body, null));
}

// ---------- Part B ----------
const ENH = /^• (.+?) (\d+) pts — (.*)$/;
function partB() {
  const armyRules = [], detachments = [];
  let mode = null, cur = null, det = null;
  for (let j = B + 1; j < C; j++) {
    const s = L[j];
    let m;
    if (!s.trim()) { used.add(j); continue; }
    if (mode === null && !s.startsWith('## ')) { used.add(j); issues.intro.push(`${j + 1}: ${s}`); continue; }
    used.add(j);
    if (s === '## Army Rules') mode = 'army';
    else if ((m = /^## (.+) \((\d+) DP\)$/.exec(s))) {
      det = { id: kebab(m[1]), name: m[1], dp: +m[2], forceDispositions: [], rule: null, enhancements: [], stratagems: [] };
      detachments.push(det);
      mode = 'det'; cur = null;
    } else if (mode === 'army' && s.startsWith('### ')) {
      const name = s.slice(4);
      armyRules.push(cur = { id: kebab(name), name, text: '' });
    } else if (det && mode === 'det' && (m = /^Force Disposition: (.+)$/.exec(s))) {
      det.forceDispositions = m[1].split(';').map(x => x.trim());
      for (const fd of det.forceDispositions) if (!FORCE_DISPOSITIONS.includes(fd)) issues.notes.push(`${det.name}: unknown Force Disposition ${fd}`);
    } else if (det && (m = /^### Detachment Rule: (.+)$/.exec(s))) {
      det.rule = cur = { name: m[1], text: '' };
      mode = 'rule';
    } else if (det && s === '### Enhancements') { mode = 'enh'; cur = null; }
    else if (det && s === '### Stratagems') { mode = 'strat'; cur = null; }
    else if (mode === 'strat' && s.startsWith('#### ')) det.stratagems.push(cur = { header: s.slice(5), body: [] });
    else if (mode === 'strat' && cur) cur.body.push(s);
    else if (mode === 'enh' && (m = ENH.exec(s))) {
      const upgrade = /\(Upgrade\)/.test(m[1]);
      const name = m[1].replace(/\s*\(Upgrade\)/, '');
      const r = /^(.*?\bonly(?: \([^)]*\))?)\.\s*(.*)$/.exec(m[3]);
      if (!r) issues.notes.push(`enhancement ${name}: no "… only." restriction found`);
      det.enhancements.push(cur = {
        id: kebab(name), name, pts: +m[2],
        restriction: r ? r[1] : null, text: r ? r[2] : m[3], upgrade, weapons: [],
      });
    } else if (mode === 'enh' && cur && s.startsWith('|')) {
      const t = table(j);
      cur.weapons.push(...t.rows.map(r => weapon(r, t.header, `enhancement ${cur.name}`)));
      j = t.end - 1;
    } else if (cur && (mode === 'army' || mode === 'rule' || mode === 'enh')) cur.text = append(cur.text, s);
    else used.delete(j);
  }
  for (const d of detachments) d.stratagems = d.stratagems.map(x => stratagem(x.header, x.body, d));
  return { armyRules, detachments };
}

// ---------- Part C ----------
const ABIL = /^([^•|:][^:]*?)(?: \(([^)]*)\))?: (.+)$/;
const ability = m => ({ id: kebab(m[1]), name: m[1], tag: m[2] ?? null, text: m[3] });
const ROLES = [['CHARACTER', 'Characters'], ['BATTLELINE', 'Battleline'], ['INFANTRY', 'Infantry'], ['MOUNTED', 'Mounted'],
  ['VEHICLE', 'Vehicles'], ['MONSTER', 'Monsters'], ['FORTIFICATION', 'Fortifications']];

function points(s, where) {
  const tiers = [];
  let tier = null;
  const re = /(\d+)(?:st|nd|rd|th)(?:[–-]\d+(?:st|nd|rd|th))?\+?\s+units?\)?:(?:\s*(\d+) pts)?|(\d+) models?: (\d+)(?: pts)?/g;
  const rest = s.replace(re, (_, copy, solo, models, pts) => {
    if (copy) {
      tiers.push(tier = { fromCopy: +copy, sizes: [] });
      // shortcut: "1st–2nd unit: 100 pts" has no model count; every such unit in the source is a single model
      if (solo) tier.sizes.push({ models: 1, pts: +solo });
    } else {
      if (!tier) tiers.push(tier = { fromCopy: 1, sizes: [] });
      tier.sizes.push({ models: +models, pts: +pts });
    }
    return '';
  });
  if (rest.replace(/Points|pts|[\s():·.]/g, '') || !tiers.length) issues.notes.push(`${where}: points line not fully parsed: ${s}`);
  return tiers;
}

function model(r, where) {
  const n = v => (/^\d+$/.test(v) ? +v : null);
  const plus = v => (/^\d+\+$/.test(v) ? parseInt(v, 10) : null);
  const m = { name: r[0], M: r[1], T: n(r[2]), Sv: plus(r[3]), W: n(r[4]), Ld: plus(r[5]), OC: n(r[6]) };
  for (const k of ['T', 'Sv', 'W', 'Ld']) if (m[k] === null) issues.nonNumeric.push(`${where}: model ${r[0]} ${k}=${r}`);
  if (m.OC === null && r[6] !== '-') issues.nonNumeric.push(`${where}: model ${r[0]} OC=${r[6]}`);
  return m;
}

function loadout(d) {
  const comp = d.composition;
  const mName = n => d.models.find(m => m.name.toLowerCase() === n.toLowerCase())?.name
    ?? (d.models.length === 1 ? d.models[0].name : null);
  const wList = txt => txt.split(/;\s*/).flatMap(x => {
    const m = /^(\d+) (.+)$/.exec(x.trim());
    if (!m) throw new Error(`cannot read "${x}"`);
    const w = d.weapons.find(w => w.name.toLowerCase() === m[2].toLowerCase());
    if (!w) throw new Error(`no weapon "${m[2]}"`);
    return Array(+m[1]).fill(w.name); // "2 Dual Supa-shoota" -> name twice
  });
  const size = (a, b) => ({ min: +a, max: b ? +b : +a });
  if (/(?:^|\. )(?:Every|The) [^:.]+: /.test(comp)) {
    // "1-2 Nob models; 9-18 Boy models. Every Nob: 1 A; 1 B. Every Boy: …"
    const [first, ...rest] = comp.replace(/\.$/, '').split(/\.\s+/);
    const groups = first.split(/;\s*/).map(g => {
      const m = /^(\d+)(?:-(\d+))? (.+?) models?$/.exec(g);
      const model = m && mName(m[3]);
      if (!model) throw new Error(`group "${g}"`);
      return { model, ...size(m[1], m[2]), weapons: [] };
    });
    for (const sn of rest) {
      const m = /^(?:Every|The) (.+?): (.+)$/.exec(sn);
      if (!m) throw new Error(`sentence "${sn}"`);
      const targets = m[1].toLowerCase() === 'model' ? groups : groups.filter(g => g.model === mName(m[1]));
      if (!targets.length) throw new Error(`no group for "${m[1]}"`);
      const ws = wList(m[2]);
      for (const g of targets) g.weapons.push(...ws);
    }
    if (groups.some(g => !g.weapons.length)) throw new Error('group without weapons');
    return groups;
  }
  // "1 X model, equipped with: 1 A; 1 B." (or "1 X model.")
  const m = /^(\d+)(?:-(\d+))? (.+?)(?: models?)?(?:, equipped with: ([^.]+))?\.(?:\s|$)/.exec(comp);
  const model = m && mName(m[3]);
  if (!model) throw new Error('unrecognised composition');
  return [{ model, ...size(m[1], m[2]), weapons: m[4] ? wList(m[4]) : [] }];
}

function datasheet(i, end) {
  const name = L[i].slice(4).trim();
  used.add(i);
  const d = {
    id: kebab(name), name, source: null, keywords: [], role: 'Other', models: [], invuln: null, weapons: [],
    wargearOptions: [], coreAbilities: [], armyRules: [], abilities: [], composition: '', defaultLoadout: [],
    points: [], leads: [], supports: [],
  };
  let inAbilities = false;
  for (let j = i + 1; j < end; j++) {
    const s = L[j];
    let m;
    if (!s.trim()) { used.add(j); continue; }
    if (inAbilities && !/^(Unit composition|Points|Leads|Supports)\b/.test(s)) {
      used.add(j);
      if (!/^[•|]/.test(s) && (m = ABIL.exec(s))) d.abilities.push(ability(m));
      else if (d.abilities.length) d.abilities.at(-1).text += `\n${s}`; // bullets/tables under an ability
      else used.delete(j);
      continue;
    }
    inAbilities = false;
    used.add(j);
    if ((m = /^Source: (.+?) · Keywords: (.+)$/.exec(s))) {
      d.source = m[1];
      d.keywords = [...(FACTION_KW ? [FACTION_KW] : []), ...m[2].split(';').map(k => k.trim()).filter(Boolean)];
    } else if (s.startsWith('|')) {
      const t = table(j);
      j = t.end - 1;
      if (t.header.join('|') === 'Model|M|T|Sv|W|Ld|OC') d.models.push(...t.rows.map(r => model(r, name)));
      else if (t.header[0] === 'Weapon') d.weapons.push(...t.rows.map(r => weapon(r, t.header, name)));
      else for (let k = t.end - t.rows.length - 2; k < t.end; k++) used.delete(k);
    } else if ((m = /^Invulnerable save: (\d+)\+$/.exec(s))) d.invuln = +m[1];
    else if (s === 'Ranged:' || s === 'Melee:' || s === 'No weapons.') { /* table header says the type */ }
    else if (s === 'Wargear options:') {
      while (L[j + 1]?.startsWith('• ')) { used.add(++j); d.wargearOptions.push(L[j].slice(2)); }
    } else if ((m = /^Core abilities: (.+)$/.exec(s))) d.coreAbilities = list(m[1]);
    else if ((m = /^Army rules: (.+)$/.exec(s))) d.armyRules = list(m[1]);
    else if (s === 'Abilities:') inAbilities = true;
    else if ((m = /^Unit composition: (.+)$/.exec(s))) d.composition = m[1];
    else if (/^Points\b/.test(s)) d.points = points(s, name);
    else if ((m = /^Leads: (.+)$/.exec(s))) d.leads = list(m[1]);
    else if ((m = /^Supports: (.+)$/.exec(s))) d.supports = list(m[1]);
    else if ((m = ABIL.exec(s))) d.abilities.push(ability(m)); // any other "Label: text" line
    else used.delete(j);
  }
  // same name in the ranged and the melee table (e.g. Grabba Dragga): keep the ranged id, suffix the melee one
  const seen = new Set();
  for (const w of d.weapons) {
    if (seen.has(w.id)) { w.id += `-${w.type}`; issues.notes.push(`${name}: duplicate weapon id, melee profile renamed ${w.id}`); }
    seen.add(w.id);
  }
  d.role = ROLES.find(([k]) => d.keywords.includes(k))?.[1] ?? 'Other';
  for (const k of ['source', 'composition']) if (!d[k]) issues.notes.push(`${name}: no ${k}`);
  if (!d.models.length || !d.points.length) issues.notes.push(`${name}: no models or points`);
  try { d.defaultLoadout = loadout(d); }
  catch (e) { issues.emptyLoadout.push(`${name}: ${e.message}`); }
  return d;
}

function partC() {
  const heads = [];
  for (let j = C + 1; j < L.length; j++) if (L[j].startsWith('### ')) heads.push(j);
  for (let j = C + 1; j < heads[0]; j++) {
    used.add(j);
    if (L[j].trim()) issues.intro.push(`${j + 1}: ${L[j]}`);
  }
  return heads.map((h, k) => datasheet(h, heads[k + 1] ?? L.length));
}

// ---------- run ----------
const write = (path, data) => {
  const url = new URL(path, ROOT);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, `${JSON.stringify(data, null, 2)}\n`);
};
const show = (label, xs) => { console.log(`${label}: ${xs.length}`); for (const x of xs) console.log(`  ${x}`); };

const missions = missionCards();
write('data/core/missions.json', missions);
console.log(`== missions: ${missions.primaries.length} primaries, ${missions.secondaries.length} secondaries (${missions.secondaries.filter(s => s.fixed).length} fixed)`);

let core = [];
for (const f of [...FACTIONS].sort((a, b) => !!b.core - !!a.core)) { // core file first: its stratagem ids are checked against every faction
  L = readFileSync(new URL(`docs/source/${f.file}`, ROOT), 'utf8').split(/\r?\n/);
  used = new Set();
  issues = { unknownTokens: [], nonNumeric: [], emptyLoadout: [], notes: [], intro: [] };
  FACTION_KW = f.keyword;
  A3 = find(s => s.startsWith('## A3.'));
  A4 = find(s => s.startsWith('## A4.'));
  B = find(s => s.startsWith('# PART B'));
  C = find(s => s.startsWith('# PART C'));
  if ([B, C].includes(-1) || (f.core && [A3, A4].includes(-1))) throw new Error(`${f.file}: source section headings not found`);
  used.add(B).add(C);
  let abilities;
  if (f.core) {
    abilities = coreAbilities();
    core = coreStratagems();
    write('data/core/abilities.json', abilities);
    write('data/core/stratagems.json', core);
  }
  const faction = partB();
  const datasheets = partC();

  const ids = new Map();
  for (const s of [...core, ...faction.detachments.flatMap(d => d.stratagems)]) {
    if (ids.has(s.id)) issues.notes.push(`duplicate stratagem id ${s.id}`);
    ids.set(s.id, s);
  }
  write(`data/${f.id}/detachments.json`, faction);
  write(`data/${f.id}/datasheets.json`, datasheets);

  const unconsumed = [];
  for (let j = B; j < L.length; j++) if (L[j].trim() && !used.has(j)) unconsumed.push(`${j + 1}: ${L[j]}`);

  const enh = faction.detachments.flatMap(d => d.enhancements);
  console.log(`== ${f.id}: datasheets ${datasheets.length}, weapons ${datasheets.reduce((n, d) => n + d.weapons.length, 0)}` +
    ` (+${enh.reduce((n, e) => n + e.weapons.length, 0)} on enhancements), detachments ${faction.detachments.length},` +
    ` army rules ${faction.armyRules.length}, stratagems ${core.length} core + ${ids.size - core.length} detachment,` +
    ` enhancements ${enh.length}${abilities ? `, abilities ${abilities.length}` : ''}`);
  show('unconsumed Part B/C lines', unconsumed);
  show('unknown weapon ability tokens', issues.unknownTokens);
  show('non-numeric values', issues.nonNumeric);
  show('empty defaultLoadout', issues.emptyLoadout);
  show('notes', issues.notes);
  show('skipped part intro lines', issues.intro);
}
