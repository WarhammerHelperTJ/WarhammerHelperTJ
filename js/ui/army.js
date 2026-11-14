// Army builder: roster list + roster editor (source 2.1). Rebuilds the view on every store change.
import { h, openSheet } from '../dom.js';
import { openDatasheet } from './datasheet.js';
import { get, update, subscribe } from '../store.js';
import { loadCore, loadFaction, loadFactions, loadExampleRoster, datasheetById, detachmentById, enhancementById, abilityByName } from '../data.js';
import { encodeRoster } from '../share.js';
import { MODES, unitPoints, rosterTotal, dpUsed, dpAllowed, dpOk, defaultGroups, canAttach, enhancementAllowed, newUnit, rosterFromTemplate, uid, tierFor, copyNumber } from '../roster.js';

let root, unsub, core, factions = [];
const loaded = new Map();                       // faction id -> faction data
const ui = { open: null, picking: false, query: '', detOpen: false }; // view-only state, not persisted

// A store change fired by blur (text commit) must not rebuild the DOM under a pressed pointer, or the tap is lost.
let down = false, pending = false;
addEventListener('pointerdown', () => { down = true; }, true);
for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => {
  down = false;
  if (pending) { pending = false; setTimeout(paint); }
}, true);
// Deferred a tick so a Tab/blur commit repaints after focus has moved, and that new focus is restored.
let queued = false;
const schedule = () => {
  if (down) { pending = true; return; }
  if (!queued) { queued = true; setTimeout(() => { queued = false; paint(); }); }
};

export async function render(r) {
  root = r;
  unsub?.();
  unsub = subscribe(schedule);
  root.append(h('p', { class: 'muted' }, 'Loading…'));
  try {
    [core, factions] = await Promise.all([loadCore(), loadFactions()]);
    await Promise.all(factions.map(f => loadFaction(f.id).then(d => loaded.set(f.id, d))));
  } catch (e) {
    root.replaceChildren(h('p', { class: 'crit' }, `Could not load data: ${e.message}`));
    return;
  }
  paint();
}

function paint() {
  if (!location.hash.startsWith('#/army')) { unsub?.(); unsub = null; return; } // view was left
  const st = get();
  const roster = st.rosters.find(x => x.id === st.activeRosterId);
  const fac = roster && loaded.get(roster.faction);
  const focusKey = document.activeElement?.dataset?.k;
  const y = scrollY;
  root.replaceChildren(...(roster && fac ? editor(roster, fac) : rosterList(st)).filter(Boolean));
  if (focusKey) root.querySelector(`[data-k="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
  scrollTo(0, y);
}

const edit = fn => update(s => { fn(s.rosters.find(x => x.id === s.activeRosterId), s); });
const sheetBtn = (label, title, text, cls = 'btn rule') =>
  h('button', { type: 'button', class: cls, onclick: () => openSheet(title, text) }, label);
const field = (label, control) => h('label', { class: 'field' }, h('span', { class: 'muted' }, label), control);

// ---------- roster list ----------

function rosterList(st) {
  const newRoster = () => {
    const f = factions[0].id, id = uid();
    update(s => {
      s.rosters.push({ id, name: `Roster ${s.rosters.length + 1}`, faction: f, mode: 'strike', limit: MODES.strike.limit, detachments: [], units: [] });
      s.activeRosterId = id;
    });
  };
  const example = async () => {
    try {
      const fac = loaded.get(factions[0].id);
      const r = rosterFromTemplate(await loadExampleRoster(fac.id), fac);
      update(s => { s.rosters.push(r); s.activeRosterId = r.id; });
    } catch (e) { openSheet('No example roster', String(e.message)); }
  };
  return [
    h('h1', null, 'Army'),
    st.rosters.length ? null : h('p', { class: 'muted' }, 'No rosters yet.'),
    ...st.rosters.map(r => {
      const fac = loaded.get(r.faction);
      const pts = fac ? rosterTotal(r, fac) : '?';
      return h('div', { class: 'card row roster-item' },
        h('button', { type: 'button', class: 'btn grow', onclick: () => update(s => { s.activeRosterId = r.id; }) },
          h('strong', null, r.name), h('span', { class: 'muted' }, ` · ${pts}${r.limit ? ` / ${r.limit}` : ''} pts`)),
        h('button', { type: 'button', class: 'btn', 'aria-label': `Delete ${r.name}`, onclick: () => {
          if (confirm(`Delete roster "${r.name}"?`)) update(s => {
            s.rosters = s.rosters.filter(x => x.id !== r.id);
            if (s.activeRosterId === r.id) s.activeRosterId = null;
          });
        } }, 'Delete'));
    }),
    h('div', { class: 'stack' },
      h('button', { type: 'button', class: 'btn primary', onclick: newRoster }, 'New roster'),
      h('button', { type: 'button', class: 'btn', onclick: example }, 'Load example roster')),
  ];
}

// ---------- roster editor ----------

function editor(roster, fac) {
  const total = rosterTotal(roster, fac);
  const over = roster.limit ? total - roster.limit : 0;
  const ds = u => datasheetById(fac, u.datasheetId);
  const top = roster.units.filter(u => !u.attachedTo || !roster.units.some(b => b.uid === u.attachedTo));

  const bar = h('div', { class: 'army-bar' },
    h('button', { type: 'button', class: 'btn', onclick: () => update(s => { s.activeRosterId = null; }) }, '‹ Rosters'),
    h('div', { class: 'army-total', role: 'status' },
      h('span', { class: 'big' + (over > 0 ? ' crit' : '') }, total),
      h('span', { class: 'muted' }, roster.limit ? ` / ${roster.limit} pts` : ' pts'),
      over > 0 ? h('div', { class: 'crit' }, `over by ${over}`) : null));

  return [
    bar,
    settingsCard(roster),
    detachmentCard(roster, fac),
    h('h2', null, `Units (${roster.units.length})`),
    ...top.map(u => unitCard(roster, u, fac, ds,
      roster.units.filter(c => c.attachedTo === u.uid).map(c => unitCard(roster, c, fac, ds, [], u)))),
    ui.picking ? picker(fac) : h('button', { type: 'button', class: 'btn primary', onclick: () => { ui.picking = true; ui.query = ''; paint(); root.querySelector('[data-k="search"]')?.focus(); } }, 'Add unit'),
  ];
}

// Link that adds a copy of this roster on any device that opens it (the roster rides in the "#" part of the URL).
async function shareRoster(roster) {
  const url = `${location.origin}${location.pathname}#/import/${await encodeRoster(roster)}`;
  const input = h('input', { type: 'text', readonly: true, value: url, 'aria-label': 'Roster link', onfocus: e => e.target.select() });
  const status = h('p', { class: 'muted small', 'aria-live': 'polite' }, 'Open this link on another device to add a copy of the roster there.');
  openSheet(`Share "${roster.name}"`, h('div', { class: 'stack' }, input, status,
    h('button', { type: 'button', class: 'btn primary', onclick: async () => {
      try { await navigator.clipboard.writeText(url); status.textContent = 'Link copied.'; }
      catch { input.select(); status.textContent = 'Copy the selected link.'; }
    } }, 'Copy link'),
    navigator.share ? h('button', { type: 'button', class: 'btn', onclick: () => navigator.share({ title: roster.name, url }).catch(() => {}) }, 'Share…') : null));
}

function settingsCard(roster) {
  return h('div', { class: 'card stack' },
    field('Roster name', h('input', { 'data-k': 'name', value: roster.name,
      onchange: e => edit(r => { r.name = e.target.value.trim() || r.name; }) })),
    h('button', { type: 'button', class: 'btn', 'data-k': 'share', onclick: () => shareRoster(roster) }, 'Share roster link'),
    field('Faction', h('select', { 'data-k': 'faction', onchange: e => {
      if (roster.units.length && !confirm('Changing faction removes all units and detachments.')) { e.target.value = roster.faction; return; }
      edit(r => { r.faction = e.target.value; r.units = []; r.detachments = []; });
    } }, factions.map(f => h('option', { value: f.id, selected: f.id === roster.faction }, f.name)))),
    h('div', { class: 'seg', role: 'group', 'aria-label': 'Battle size' },
      Object.entries(MODES).map(([id, m]) => h('button', { type: 'button', 'aria-pressed': String(roster.mode === id),
        onclick: () => edit(r => { r.mode = id; if (m.limit) r.limit = m.limit; }) }, m.label))),
    roster.mode === 'custom'
      ? field('Points limit', h('input', { 'data-k': 'limit', type: 'number', inputmode: 'numeric', min: '0', step: '5', value: roster.limit ?? '',
          onchange: e => edit(r => { r.limit = e.target.value === '' ? null : Math.max(0, Number(e.target.value)); }) }))
      : h('p', { class: 'muted' }, `${MODES[roster.mode].limit.toLocaleString('en')} pts · ${MODES[roster.mode].dp} DP`));
}

function detachmentCard(roster, fac) {
  const showAll = ui.detOpen || !roster.detachments.length; // collapsed to the chosen ones once any is picked
  const used = dpUsed(roster, fac.detachments), allowed = dpAllowed(roster.mode), ok = dpOk(roster, fac.detachments);
  return h('div', { class: 'card stack' },
    h('div', { class: 'row spread' }, h('h2', null, 'Detachments'),
      h('span', { class: ok ? 'muted' : 'crit' }, `${used}${allowed === Infinity ? '' : ` / ${allowed}`} DP${ok ? '' : ' — over budget'}`)),
    ...fac.detachments.filter(d => showAll || roster.detachments.includes(d.id)).map(d => {
      const on = roster.detachments.includes(d.id);
      return h('div', { class: 'row spread' },
        sheetBtn(d.name, d.name, `${d.rule.name}\n\n${d.rule.text}`, 'btn link'),
        h('button', { type: 'button', class: 'pill', 'aria-pressed': String(on), 'aria-label': `${d.name}, ${d.dp} DP`,
          onclick: () => edit(r => {
            if (on) {
              r.detachments = r.detachments.filter(x => x !== d.id);
              const gone = new Set(d.enhancements.map(e => e.id));
              for (const u of r.units) if (gone.has(u.enhancement)) u.enhancement = null;
            } else r.detachments.push(d.id);
          }) }, `${d.dp} DP`));
    }),
    roster.detachments.length ? h('button', { type: 'button', class: 'btn link', 'aria-expanded': String(ui.detOpen),
      onclick: () => { ui.detOpen = !ui.detOpen; paint(); } }, ui.detOpen ? 'Done' : 'Change detachments') : null);
}

function picker(fac) {
  const list = h('div', { class: 'stack' });
  const fill = () => {
    const q = ui.query.trim().toLowerCase();
    const roles = new Map();
    for (const d of fac.datasheets) if (!q || d.name.toLowerCase().includes(q)) {
      if (!roles.has(d.role)) roles.set(d.role, []);
      roles.get(d.role).push(d);
    }
    list.replaceChildren(...(roles.size ? [...roles].flatMap(([role, ds]) => [
      h('h3', null, role),
      ...ds.map(d => h('button', { type: 'button', class: 'btn pick', onclick: () => {
        const u = newUnit(d);
        ui.picking = false; ui.open = u.uid;
        edit(r => { r.units.push(u); });
      } }, h('span', null, d.name),
        d.source !== 'Codex' ? h('span', { class: 'chip badge' }, d.source) : null,
        h('span', { class: 'muted' }, `${d.points[0]?.sizes[0]?.pts ?? '?'} pts`))),
    ]) : [h('p', { class: 'muted' }, 'No match.')]));
  };
  fill();
  return h('div', { class: 'card stack' },
    h('div', { class: 'row spread' }, h('h2', null, 'Add unit'),
      h('button', { type: 'button', class: 'btn', onclick: () => { ui.picking = false; paint(); } }, 'Close')),
    field('Search', h('input', { 'data-k': 'search', type: 'search', value: ui.query,
      oninput: e => { ui.query = e.target.value; fill(); } })),
    list);
}

// ---------- unit card ----------

function unitCard(roster, u, fac, dsOf, nested, bodyguard) {
  const d = dsOf(u);
  if (!d) return h('div', { class: 'card crit' }, `Unknown datasheet ${u.datasheetId}`,
    h('button', { type: 'button', class: 'btn', onclick: () => removeUnit(u.uid) }, 'Remove'));
  const pts = unitPoints(roster, u, fac.datasheets);
  const enh = enhancementById(fac, u.enhancement);
  const role = bodyguard ? canAttach(d, dsOf(bodyguard)) : null;
  const open = ui.open === u.uid;
  const mod = fn => edit(r => fn(r.units.find(x => x.uid === u.uid), r));

  const head = h('button', { type: 'button', class: 'unit-head', 'aria-expanded': String(open),
    onclick: () => { ui.open = open ? null : u.uid; paint(); } },
    h('span', { class: 'muted' }, `${u.size} model${u.size === 1 ? '' : 's'}`),
    h('span', { class: 'unit-pts' }, `${pts + (enh?.pts ?? 0)} pts`),
    h('span', { class: 'row' },
      d.source !== 'Codex' ? h('span', { class: 'chip badge' }, d.source) : null,
      role ? h('span', { class: 'chip' }, role === 'leader' ? 'Leader' : 'Support') : null,
      u.warlord ? h('span', { class: 'chip' }, 'Warlord') : null,
      enh ? h('span', { class: 'chip' }, enh.name) : null,
      typeof u.ptsOverride === 'number' ? h('span', { class: 'chip' }, 'manual pts') : null));

  return h('div', { class: 'card unit' + (bodyguard ? ' attached' : '') },
    h('button', { type: 'button', class: 'btn link unit-name', onclick: () => openDatasheet([d]) }, d.name),
    head,
    open ? unitDetails(roster, u, d, fac, dsOf, mod, pts, enh) : null,
    nested.length ? h('div', { class: 'stack nested' }, nested) : null);
}

function removeUnit(id) {
  if (ui.open === id) ui.open = null;
  edit(r => {
    r.units = r.units.filter(x => x.uid !== id);
    for (const x of r.units) if (x.attachedTo === id) x.attachedTo = null;
  });
}

function unitDetails(roster, u, d, fac, dsOf, mod, pts, enh) {
  const k = s => `${s}-${u.uid}`;
  const isChar = d.keywords.includes('CHARACTER');
  const ordinal = copyNumber(roster, u);
  const tier = tierFor(d, ordinal);
  const out = [];

  // size + points
  out.push(h('div', { class: 'row' },
    field('Unit size', h('select', { 'data-k': k('size'), onchange: e => mod(x => { x.size = Number(e.target.value); x.groups = defaultGroups(d, x.size); }) },
      (tier?.sizes ?? [{ models: u.size, pts }]).map(s => h('option', { value: s.models, selected: s.models === u.size }, `${s.models} — ${s.pts} pts`)))),
    field('Points (manual)', h('input', { 'data-k': k('pts'), type: 'number', inputmode: 'numeric', min: '0', class: 'pts-input',
      placeholder: String(unitPoints(roster, { ...u, ptsOverride: null }, fac.datasheets)), value: u.ptsOverride ?? '',
      onchange: e => mod(x => { x.ptsOverride = e.target.value === '' ? null : Math.max(0, Number(e.target.value)); }) }))));
  if (ordinal > 1 && d.points.length > 1) out.push(h('p', { class: 'muted small' }, `Copy ${ordinal} of this datasheet: priced from the "${tier.fromCopy}+ unit" row.`));

  out.push(loadoutEditor(u, d, mod));

  // attach to a bodyguard
  if (d.leads.length || d.supports.length) {
    const options = roster.units.filter(b => b !== u && !b.attachedTo && dsOf(b)).flatMap(b => {
      const role = canAttach(d, dsOf(b));
      const taken = role && roster.units.some(c => c !== u && c.attachedTo === b.uid && canAttach(dsOf(c), dsOf(b)) === role);
      return role ? [h('option', { value: b.uid, selected: u.attachedTo === b.uid, disabled: taken },
        `${dsOf(b).name} (${role})${taken ? ' — slot taken' : ''}`)] : [];
    });
    out.push(field(d.leads.length ? `Leads: ${d.leads.join(', ')}` : `Supports: ${d.supports.join(', ')}`,
      h('select', { 'data-k': k('attach'), onchange: e => mod(x => { x.attachedTo = e.target.value || null; }) },
        h('option', { value: '' }, 'Not attached'), options)));
  }

  // enhancement
  const pool = roster.detachments.map(id => detachmentById(fac, id)).filter(Boolean).flatMap(x => x.enhancements);
  const takenEnh = new Set(roster.units.filter(x => x !== u).map(x => x.enhancement));
  const enhOptions = pool.map(e => {
    const allowed = enhancementAllowed(e, d), used = takenEnh.has(e.id);
    return { e, ok: allowed && !used, label: `${e.name} (+${e.pts})${used ? ' — taken' : allowed ? '' : ' — not eligible'}` };
  });
  if (enh || enhOptions.some(o => o.ok)) {
    out.push(field('Enhancement', h('select', { 'data-k': k('enh'), onchange: e => mod(x => { x.enhancement = e.target.value || null; x.enhancementWeapon = null; }) },
      h('option', { value: '' }, 'None'),
      enhOptions.map(o => h('option', { value: o.e.id, selected: o.e.id === u.enhancement, disabled: !o.ok && o.e.id !== u.enhancement }, o.label)))));
    if (enh) out.push(h('div', { class: 'row' },
      sheetBtn(enh.name, enh.name, enhText(enh)), h('span', { class: 'muted small' }, enh.restriction)));
    // "select one melee weapon equipped by the bearer" (effects with chosenWeapon)
    if (enh && (fac.effects ?? []).some(x => x.chosenWeapon && x.source.split(':')[1] === enh.id)) {
      const melee = [...new Set(d.weapons.filter(w => w.type === 'melee').map(w => w.name))];
      out.push(field(`${enh.name}: weapon`, h('select', { 'data-k': k('enhw'), onchange: e => mod(x => { x.enhancementWeapon = e.target.value || null; }) },
        h('option', { value: '' }, 'Choose a melee weapon'),
        melee.map(n => h('option', { value: n, selected: n === u.enhancementWeapon }, n)))));
    }
  }

  if (isChar) out.push(h('button', { type: 'button', class: 'pill', 'aria-pressed': String(!!u.warlord),
    onclick: () => edit(r => { const was = u.warlord; for (const x of r.units) x.warlord = false; r.units.find(x => x.uid === u.uid).warlord = !was; }) }, 'Warlord'));

  // rules text
  const rules = [
    ...d.abilities.map(a => sheetBtn(a.name, a.name, a.tag ? `${a.tag}\n\n${a.text}` : a.text)),
    ...d.coreAbilities.map(n => {
      const a = abilityByName(core, n.replace(/\s+(D?\d+\S*|\d+\+)$/, ''));
      return a ? sheetBtn(n, n, a.text) : h('span', { class: 'chip' }, n);
    }),
    ...d.armyRules.map(n => {
      const a = fac.armyRules.find(x => x.name === n);
      return a ? sheetBtn(n, n, a.text) : h('span', { class: 'chip' }, n);
    }),
    sheetBtn('Composition', `${d.name}: composition`, d.composition),
  ];
  out.push(h('div', { class: 'row' }, rules));
  out.push(h('button', { type: 'button', class: 'btn danger', onclick: () => removeUnit(u.uid) }, `Remove ${d.name}`));
  return h('div', { class: 'stack unit-body' }, out);
}

const enhText = e => [e.restriction, e.text, ...e.weapons.map(w =>
  `${w.name}${w.profile ? ` – ${w.profile}` : ''}: ${w.range} A${w.A} ${w.skill == null ? 'N/A' : w.skill + '+'} S${w.S} AP${w.AP} D${w.D} ${w.keywordsText}`)].join('\n\n');

function loadoutEditor(u, d, mod) {
  const names = [...new Set(d.weapons.map(w => w.name))];
  const sum = u.groups.reduce((s, g) => s + g.count, 0);
  const setG = (i, fn) => mod(x => fn(x.groups[i], x));
  return h('div', { class: 'stack loadout' },
    h('h3', null, 'Wargear'),
    d.wargearOptions.length ? h('ul', { class: 'wargear-text muted' }, d.wargearOptions.map(t => h('li', null, t))) : null,
    ...u.groups.map((g, i) => h('div', { class: 'group stack' },
      h('div', { class: 'row spread' },
        h('strong', null, g.model),
        h('div', { class: 'stepper' },
          h('button', { type: 'button', 'data-k': `dec-${u.uid}-${i}`, 'aria-label': `Fewer ${g.model}`, disabled: g.count <= 1, onclick: () => setG(i, gr => { gr.count--; }) }, '−'),
          h('output', null, g.count),
          h('button', { type: 'button', 'data-k': `inc-${u.uid}-${i}`, 'aria-label': `More ${g.model}`, onclick: () => setG(i, gr => { gr.count++; }) }, '+'))),
      h('div', { class: 'row' }, g.weapons.map((w, wi) => h('span', { class: 'weapon' },
        h('button', { type: 'button', class: 'btn link', onclick: () => weaponSheet(d, w) }, w),
        h('button', { type: 'button', class: 'btn x', 'aria-label': `Remove ${w}`, onclick: () => setG(i, gr => { gr.weapons.splice(wi, 1); }) }, '✕')))),
      h('div', { class: 'row' },
        h('select', { 'aria-label': `Add weapon to ${g.model}`, 'data-k': `addw-${u.uid}-${i}`, onchange: e => setG(i, gr => { gr.weapons.push(e.target.value); }) },
          h('option', { value: '' }, '+ weapon…'),
          names.filter(n => !g.weapons.includes(n)).map(n => h('option', { value: n }, n))),
        g.count > 1 ? h('button', { type: 'button', class: 'btn', onclick: () => mod(x => {
          x.groups[i].count--; x.groups.splice(i + 1, 0, { ...structuredClone(x.groups[i]), count: 1 });
        }) }, 'Split 1 off') : null,
        u.groups.length > 1 ? h('button', { type: 'button', class: 'btn', onclick: () => mod(x => { x.groups.splice(i, 1); }) }, 'Remove group') : null))),
    sum !== u.size ? h('p', { class: 'crit', role: 'status' }, `⚠ Groups have ${sum} models, the unit has ${u.size}.`) : null,
    h('button', { type: 'button', class: 'btn', onclick: () => mod(x => { x.groups = defaultGroups(d, x.size); }) }, 'Reset to default loadout'));
}

function weaponSheet(d, name) {
  const profiles = d.weapons.filter(w => w.name === name);
  if (!profiles.length) { openSheet(name, 'Not on this datasheet.'); return; }
  const cols = ['Range', 'A', profiles[0].type === 'melee' ? 'WS' : 'BS', 'S', 'AP', 'D'];
  const cells = w => [w.range, w.A, w.skill == null ? 'N/A' : `${w.skill}+`, w.S, w.AP, w.D];
  const body = h('div', { class: 'stack' },
    h('table', { class: 'stats' },
      h('thead', null, h('tr', null, h('th', null, ''), cols.map(c => h('th', null, c)))),
      h('tbody', null, profiles.map(w => h('tr', null, h('th', null, w.profile ?? (w.type === 'melee' ? 'Melee' : 'Ranged')), cells(w).map(c => h('td', null, c)))))),
    profiles.map(w => h('div', null, profiles.length > 1 ? h('strong', null, `${w.profile}: `) : null, w.keywordsText)));
  openSheet(name, body);
}
