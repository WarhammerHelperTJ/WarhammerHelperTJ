// Opponent target panel (store.target + store.targets presets). Shared by the Game and Attack views.
// renderTargetPanel(container) fills the container from the store once; the host view repaints it on store changes.
import { h } from '../dom.js';
import { get, update } from '../store.js';
import { loadFactions, loadFaction } from '../data.js';

// "Fill from a datasheet": faction list and picked faction are view state; data.js caches the JSON.
const pick = { factions: null, faction: '', data: null, unit: '' };

/** Datasheet -> target fields: the bodyguard's (largest group's) profile, smallest unit size, invuln, FNP, all keywords. */
export function targetFromDatasheet(d) {
  const main = [...d.defaultLoadout].sort((a, b) => b.max - a.max)[0];
  const m = d.models.find((x) => x.name === main?.model) ?? d.models[0];
  const fnp = /Feel No Pain (\d)\+/.exec((d.coreAbilities ?? []).join(' '));
  return {
    name: d.name, T: m.T, Sv: Math.min(7, m.Sv ?? 7), W: m.W, InSv: d.invuln ?? null, fnp: fnp ? +fnp[1] : null,
    models: d.points[0]?.sizes[0]?.models ?? d.defaultLoadout.reduce((n, g) => n + g.min, 0),
    keywords: d.keywords.map((k) => k.toUpperCase()),
  };
}

function datasheetPicker(container) {
  if (!pick.factions) {
    loadFactions().then((f) => { pick.factions = f; if (container.isConnected) renderTargetPanel(container); }).catch(() => {});
    return null;
  }
  const choose = (id) => {
    pick.faction = id; pick.data = null; pick.unit = '';
    if (id) loadFaction(id).then((f) => { if (pick.faction === id) pick.data = f; if (container.isConnected) renderTargetPanel(container); });
    renderTargetPanel(container);
  };
  const sheets = pick.data ? [...pick.data.datasheets].sort((a, b) => a.name.localeCompare(b.name)) : [];
  return h('div', { class: 'row tp-pick' },
    h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Faction'),
      h('select', { 'data-k': 'tp-faction', onchange: (e) => choose(e.target.value) },
        h('option', { value: '' }, 'Pick a faction…'),
        pick.factions.map((f) => h('option', { value: f.id, selected: f.id === pick.faction }, f.name)))),
    pick.faction ? h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Unit'),
      h('select', { 'data-k': 'tp-unit', disabled: !pick.data, onchange: (e) => {
        const d = sheets.find((x) => x.id === e.target.value);
        pick.unit = e.target.value;
        if (d) update((s) => { s.target = { ...s.target, ...targetFromDatasheet(d) }; });
      } }, h('option', { value: '' }, pick.data ? 'Pick a unit…' : 'Loading…'),
        sheets.map((d) => h('option', { value: d.id, selected: d.id === pick.unit }, d.name)))) : null);
}

const KEYWORDS = ['INFANTRY', 'MONSTER', 'VEHICLE', 'CHARACTER', 'FLY', 'PSYKER', 'MOUNTED', 'TITANIC'];
const TOGGLES = [['cover', 'In cover'], ['halfRange', 'Within half range'], ['onObjective', 'Within range of an objective'], ['hidden', 'Hidden']];

const set = (fn) => update((s) => { fn(s.target); });
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

// Labelled stepper; the middle is a numeric input so big values can be typed.
function stepper(key, label, value, lo, hi, suffix = '') {
  const put = (n) => set((t) => { t[key] = clamp(Number.isFinite(n) ? Math.round(n) : value, lo, hi); });
  return h('div', { class: 'tp-num' },
    h('label', { class: 'muted', for: `tp-${key}` }, label),
    h('div', { class: 'stepper' },
      h('button', { type: 'button', 'data-k': `tp-${key}-dec`, 'aria-label': `${label} down`, disabled: value <= lo, onclick: () => put(value - 1) }, '−'),
      h('input', { id: `tp-${key}`, 'data-k': `tp-${key}`, type: 'text', inputmode: 'numeric', value: `${value}${suffix}`,
        onchange: (e) => put(parseInt(e.target.value, 10)) }),
      h('button', { type: 'button', 'data-k': `tp-${key}-inc`, 'aria-label': `${label} up`, disabled: value >= hi, onclick: () => put(value + 1) }, '+')));
}

// Segmented choice of "None" or a N+ roll.
function rollSeg(key, label, value, rolls) {
  return h('div', { class: 'stack tp-seg' },
    h('span', { class: 'muted', id: `tp-${key}-l` }, label),
    h('div', { class: 'seg', role: 'group', 'aria-labelledby': `tp-${key}-l` },
      [null, ...rolls].map((r) => h('button', { type: 'button', 'data-k': `tp-${key}-${r}`, 'aria-pressed': String(value === r),
        onclick: () => set((t) => { t[key] = r; }) }, r == null ? 'None' : `${r}+`))));
}

const pill = (k, label, on, fn) => h('button', { type: 'button', class: 'pill', 'data-k': k, 'aria-pressed': String(on), onclick: fn }, label);

export function renderTargetPanel(container) {
  const { target: t, targets } = get();
  const kw = new Set(t.keywords ?? []);
  const save = () => {
    const name = t.name.trim() || `Target ${targets.length + 1}`;
    update((s) => {
      s.target.name = name;
      s.targets = [...s.targets.filter((p) => p.name !== name), structuredClone(s.target)];
    });
  };
  const picked = targets.find((p) => p.name === t.name);
  container.replaceChildren(h('section', { class: 'card stack target-panel', 'aria-labelledby': 'tp-title' },
    h('h2', { id: 'tp-title' }, 'Target'),
    datasheetPicker(container),
    h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Name'),
      h('input', { 'data-k': 'tp-name', value: t.name, placeholder: 'Opponent unit', onchange: (e) => set((x) => { x.name = e.target.value.trim(); }) })),
    h('div', { class: 'tp-grid' },
      stepper('T', 'Toughness', t.T, 1, 20),
      stepper('Sv', 'Save', t.Sv, 2, 7, '+'),
      stepper('W', 'Wounds per model', t.W, 1, 40),
      stepper('models', 'Models', t.models, 1, 40)),
    rollSeg('InSv', 'Invulnerable save', t.InSv, [2, 3, 4, 5, 6]),
    rollSeg('fnp', 'Feel No Pain', t.fnp, [4, 5, 6]),
    h('div', { class: 'stack' }, h('span', { class: 'muted' }, 'Keywords'),
      h('div', { class: 'row' }, KEYWORDS.map((k) => pill(`tp-kw-${k}`, k, kw.has(k),
        () => set((x) => { x.keywords = kw.has(k) ? x.keywords.filter((y) => y !== k) : [...(x.keywords ?? []), k]; }))))),
    h('div', { class: 'row' }, TOGGLES.map(([k, label]) => pill(`tp-${k}`, label, !!t[k], () => set((x) => { x[k] = !x[k]; })))),
    h('div', { class: 'stack tp-presets' },
      targets.length ? h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Presets'),
        h('select', { 'data-k': 'tp-preset', onchange: (e) => {
          const p = targets.find((x) => x.name === e.target.value);
          if (p) update((s) => { s.target = structuredClone(p); });
        } }, h('option', { value: '' }, 'Pick a preset…'),
          targets.map((p) => h('option', { value: p.name, selected: p === picked }, p.name)))) : null,
      h('div', { class: 'row' },
        h('button', { type: 'button', class: 'btn', 'data-k': 'tp-save', onclick: save }, picked ? 'Update preset' : 'Save preset'),
        picked ? h('button', { type: 'button', class: 'btn danger', 'data-k': 'tp-del', onclick: () => {
          if (confirm(`Delete preset "${picked.name}"?`)) update((s) => { s.targets = s.targets.filter((p) => p.name !== picked.name); });
        } }, 'Delete preset') : null))));
}
