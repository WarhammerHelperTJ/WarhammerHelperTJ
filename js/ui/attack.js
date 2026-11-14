// Attack screen (source 2.3): unit -> Shoot/Fight -> weapons per model group -> target -> one dice card per group of identical attacks.
import { h, openSheet } from '../dom.js';
import { get, update, subscribe } from '../store.js';
import { loadCore, loadFaction, abilityByName, stratagemById, detachmentById, enhancementById, armyRuleById } from '../data.js';
import { combatUnits, phaseKey, unitStart } from '../game.js';
import { availableStratagems } from '../engine/stratagems.js';
import { effectsForUnit } from '../engine/collect.js';
import { computeAttack, followAlong, summarize } from '../engine/attack.js';
import { roll } from '../engine/dice.js';
import { weaponChoices, buildGroups, effectsWithBearers } from '../attack-setup.js';
import { renderTargetPanel } from './target.js';
import { useStrat, undoStrat, stratWhen } from './strat-actions.js';

let root, unsub, core;
const loaded = new Map();
// View state, not persisted. sel: `${uid}|${type}` -> weaponChoices selection; manual: `${round}-${turn}|${uid}` -> [source];
// fa: card title -> follow-along inputs, cleared when the weapon selection changes.
const ui = { uid: null, type: {}, sel: {}, manual: {}, overwatch: {}, targetOpen: false, fa: {}, faSig: null };

// Same guard as the Game view: a blur commit must not rebuild the DOM under a pressed pointer.
let down = false, pending = false, queued = false;
addEventListener('pointerdown', () => { down = true; }, true);
for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => {
  down = false;
  if (pending) { pending = false; setTimeout(paint); }
}, true);
const schedule = () => {
  if (down) { pending = true; return; }
  if (!queued) { queued = true; setTimeout(() => { queued = false; paint(); }); }
};
const local = (fn) => { fn(); schedule(); };

export async function render(r) {
  root = r;
  unsub?.();
  unsub = subscribe(schedule);
  root.append(h('p', { class: 'muted' }, 'Loading…'));
  try {
    core = await loadCore();
    await Promise.all([...new Set(get().rosters.map((x) => x.faction))].map((id) => loadFaction(id).then((f) => loaded.set(id, f))));
  } catch (e) {
    root.replaceChildren(h('p', { class: 'crit' }, `Could not load data: ${e.message}`));
    return;
  }
  paint();
}

function paint() {
  if (!root || !location.hash.startsWith('#/attack')) { unsub?.(); unsub = null; return; }
  const focusKey = document.activeElement?.dataset?.k;
  const y = scrollY;
  root.replaceChildren(...view(get()).flat(Infinity).filter(Boolean));
  if (focusKey) root.querySelector(`[data-k="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
  scrollTo(0, y);
}

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const one = (x) => x.toFixed(1);
const dice = (n, what) => `${n} ${what} ${n === 1 ? "die" : "dice"}`;
const up = (s) => String(s).toUpperCase();
const displayName = (w) => (w.profile ? `${w.name} - ${w.profile}` : w.name);

function view(st) {
  const g = st.game;
  const roster = g && st.rosters.find((x) => x.id === g.rosterId);
  const fac = roster && loaded.get(roster.faction);
  const title = h('h1', null, 'Attack');
  if (!g) return [title, h('p', null, 'Start a game to attack with your units. ', h('a', { href: '#/game' }, 'Go to Game'))];
  if (!fac) return [title, h('p', { class: 'crit' }, 'The roster of this game no longer exists. '), h('a', { href: '#/game' }, 'Go to Game')];
  const cus = combatUnits(roster, fac);
  if (!cus.length) return [title, h('p', null, 'This roster has no units. ', h('a', { href: '#/army' }, 'Go to Army'))];

  const cu = cus.find((u) => u.uid === ui.uid) ?? cus[0];
  const key = phaseKey(g);
  const type = ui.type[key] ?? (g.phase === 'fight' ? 'melee' : 'ranged');
  const state = g.units[cu.uid] ?? unitStart(cu, fac);
  const sheets = cu.members.map((m) => fac.datasheets.find((d) => d.id === m.datasheetId)).filter(Boolean);
  const selKey = `${cu.uid}|${type}`;
  const sel = (ui.sel[selKey] ??= {});
  const choices = weaponChoices(cu, fac, type, sel, state.models);
  const groups = buildGroups(choices);

  const effects = effectsWithBearers(effectsForUnit(fac, { datasheetIds: cu.datasheetIds, detachmentIds: roster.detachments,
    enhancementIds: cu.enhancementIds, armyDatasheetIds: roster.units.map((u) => u.datasheetId) }), cu);
  const manualFx = [...new Map(effects.filter((e) => e.manual && (!e.attack || e.attack === 'any' || e.attack === type)
    && (!e.when?.unitHas || e.when.unitHas.some((k) => cu.keywords.includes(up(k))))).map((e) => [e.source, e])).values()];
  const turnKey = `${g.round}-${g.turn}|${cu.uid}`;
  const manualOn = ui.manual[turnKey] ?? [];
  // "stratagem:<id>" switches on when that stratagem is used on this unit; "stratagem:<id>:<option>" is a toggle (one of its options)
  const stratId = (e) => { const [kind, id, opt] = e.source.split(':'); return kind === 'stratagem' && !opt ? id : null; };
  const stratOn = (id) => g.used?.[id] === key && g.usedBy?.[id] === cu.uid;
  const enabled = manualFx.filter((e) => (stratId(e) ? stratOn(stratId(e)) : manualOn.includes(e.source))).map((e) => e.source);

  const showOverwatch = g.turn === 'opp' && g.phase === 'movement' && type === 'ranged';
  const ctx = { phase: g.phase, turn: g.turn, riledUp: !!state.riled, charged: !!state.charged, advanced: !!state.advanced,
    stationary: !!state.stationary, attached: cu.members.length > 1, modelCount: state.models,
    allMonsterVehicle: sheets.length > 0 && sheets.every((d) => d.keywords.some((k) => ['MONSTER', 'VEHICLE'].includes(up(k)))),
    overwatch: showOverwatch && !!ui.overwatch[key], enabled };
  const result = computeAttack({ type, groups, target: st.target, ctx, effects, unitKeywords: cu.keywords });

  const sig = JSON.stringify([cu.uid, type, groups.map((x) => [displayName(x.weapon), x.models, x.modelName])]);
  if (sig !== ui.faSig) { ui.faSig = sig; ui.fa = {}; }

  const env = { st, g, fac, cu, cus, key, type, state, sheets, choices, effects, groups, result };
  const follow = st.settings.attackMode === 'follow';
  return [
    h('div', { class: 'row spread' }, title,
      seg('atk-mode', 'Mode', [['math', 'Math'], ['follow', 'Follow-along']], follow ? 'follow' : 'math',
        (v) => update((s) => { s.settings = { ...s.settings, attackMode: v }; }))),
    unitCard(env, sel, selKey),
    targetCard(st.target),
    manualFx.length ? stratCard(env, manualFx, manualOn, turnKey, stratId, stratOn) : null,
    contextCard(env, showOverwatch),
    groups.length ? result.cards.map((c, i) => attackCard(env, c, i, follow))
      : h('p', { class: 'muted' }, type === 'melee' ? 'No melee weapon to fight with.' : 'No ranged weapon selected.'),
    result.cards.length ? totalCard(result.cards, st.target) : null,
    result.cards.length ? compareCard(st, (t) => computeAttack({ type, groups, target: t, ctx, effects, unitKeywords: cu.keywords }).cards) : null,
    afterCard(env),
  ];
}

// ---------- whole unit + compare targets ----------

const pct = (p) => (p > 0.995 ? '>99%' : p < 0.005 ? (p > 0 ? '<1%' : '0%') : `${Math.round(p * 100)}%`);

function totalCard(cards, t) {
  const s = summarize(cards, t);
  return h('section', { class: 'card stack', 'aria-label': 'Whole unit' },
    h('h2', null, 'Whole unit'),
    h('p', { class: 'atk-expected' }, `~${one(s.hits)} hits · ~${one(s.wounds)} wounds · ~${one(s.unsaved)} unsaved · ~${one(s.damage)} damage`),
    h('p', { class: 'atk-total' }, h('strong', null, `~${one(s.kills)} of ${plural(t.models ?? 1, 'model')} killed`),
      ` · wipe chance ${pct(s.wipe)}`),
    cards.length > 1 ? h('p', { class: 'muted small' }, 'Weapon groups resolved one after another; damage still does not spill over between models.') : null);
}

// Same attack against every saved target preset; tap one to make it the target.
function compareCard(st, cardsFor) {
  const presets = st.targets ?? [];
  if (!presets.length) return h('p', { class: 'muted small' }, 'Save target presets in the target editor to compare targets here.');
  const rows = presets.map((t) => ({ t, s: summarize(cardsFor(t), t) })).sort((a, b) => b.s.wipe - a.s.wipe || b.s.kills / (b.t.models || 1) - a.s.kills / (a.t.models || 1));
  return h('section', { class: 'card stack', 'aria-label': 'Compare targets' },
    h('h2', null, 'Compare targets'),
    rows.map(({ t, s }) => h('button', { type: 'button', class: 'btn pick', 'data-k': `atk-cmp-${t.name}`, 'aria-pressed': String(t.name === st.target.name),
      onclick: () => update((x) => { x.target = structuredClone(t); }) },
      h('span', null, h('strong', null, t.name), h('span', { class: 'muted small' }, ` T${t.T} Sv${t.Sv}+ W${t.W}`)),
      h('span', null, `~${one(s.kills)}/${t.models} · wipe ${pct(s.wipe)}`))));
}

// ---------- small components ----------

function seg(k, label, options, value, onPick) {
  return h('div', { class: 'seg', role: 'group', 'aria-label': label },
    options.map(([v, text]) => h('button', { type: 'button', 'data-k': `${k}-${v}`, 'aria-pressed': String(v === value),
      onclick: () => { if (v !== value) onPick(v); } }, text)));
}

const pill = (k, label, on, onclick, disabled = false) =>
  h('button', { type: 'button', class: 'pill', 'data-k': k, 'aria-pressed': String(!!on), disabled, onclick }, label);

// − n + with a typeable middle; value null shows "–". lo..hi bounds the buttons; typed values are kept as typed.
function numStep(k, label, value, onSet, hi = Infinity) {
  return h('div', { class: 'atk-num' },
    h('label', { class: 'muted', for: k }, label),
    h('div', { class: 'stepper' },
      h('button', { type: 'button', 'data-k': `${k}-dec`, 'aria-label': `${label} down`, disabled: !value, onclick: () => onSet(Math.max(0, (value ?? 0) - 1)) }, '−'),
      h('input', { id: k, 'data-k': k, type: 'text', inputmode: 'numeric', value: value ?? '', placeholder: '–',
        onchange: (e) => { const n = parseInt(e.target.value, 10); onSet(Number.isFinite(n) && n >= 0 ? n : null); } }),
      h('button', { type: 'button', 'data-k': `${k}-inc`, 'aria-label': `${label} up`, disabled: (value ?? 0) >= hi, onclick: () => onSet((value ?? 0) + 1) }, '+')));
}

const rulesBtn = (k, label, title, text) =>
  h('button', { type: 'button', class: 'btn link', 'data-k': k, onclick: () => openSheet(title, text) }, label);

// ---------- rules lookups ----------

function ruleOf(fac, source) {
  const [kind, id, sub] = String(source).split(':');
  const pick = (x, name = x?.name) => (x ? { title: name, text: x.text } : null);
  switch (kind) {
    case 'stratagem': return pick(stratagemById(core, fac, id));
    case 'detachment': return pick(detachmentById(fac, id)?.rule);
    case 'enhancement': return pick(enhancementById(fac, id));
    case 'armyrule': return pick(armyRuleById(fac, id));
    case 'ability': return pick(fac.datasheets.find((d) => d.id === id)?.abilities.find((a) => a.id === sub));
    default: return null;
  }
}

// A chip's source -> its rule: an effect label, the core Command Re-roll, or a weapon ability named in the chip text.
function chipRule(fac, chip) {
  for (const part of String(chip.source).split(' + ').map((s) => s.replace(/ \(\+\d+\)$/, ''))) {
    const e = (fac.effects ?? []).find((x) => x.label === part);
    const r = e && ruleOf(fac, e.source);
    if (r) return r;
  }
  if (chip.source === 'Core stratagem') {
    const s = core.stratagems.find((x) => chip.text.startsWith(x.name));
    if (s) return { title: s.name, text: s.text };
  }
  const t = up(chip.text);
  const a = [...core.abilities].sort((x, y) => y.name.length - x.name.length).find((x) => t.includes(x.name));
  return a ? { title: a.name, text: a.text } : null;
}

function chipView(fac, c, k, cls = '') {
  const inner = h('span', { class: `chip ${cls}` }, h('span', null, c.text), c.source ? h('span', { class: 'src' }, c.source) : null);
  const r = chipRule(fac, c);
  return r ? h('button', { type: 'button', class: 'chip-btn', 'data-k': k, 'aria-label': `${c.text}, ${c.source}: read the rule`,
    onclick: () => openSheet(r.title, r.text) }, inner) : inner;
}

function weaponSheet(w) {
  const skill = w.skill == null ? 'N/A' : `${w.skill}+`;
  openSheet(displayName(w), h('div', { class: 'stack' },
    h('div', null, `Range ${w.range ?? 'Melee'} · A ${w.A} · ${w.type === 'melee' ? 'WS' : 'BS'} ${skill} · S ${w.S} · AP ${w.AP} · D ${w.D}`),
    w.keywordsText ? h('div', null, h('strong', null, 'Keywords: '), w.keywordsText) : null,
    (w.abilities ?? []).map((a) => abilityByName(core, a.name)).filter(Boolean)
      .map((a) => h('div', null, h('strong', null, a.name), h('div', { class: 'sheet-text' }, a.text)))));
}

// ---------- unit + weapons ----------

function unitCard(env, sel, selKey) {
  const { g, cu, cus, key, type, choices } = env;
  const set = (gk, fn) => local(() => { fn((ui.sel[selKey][gk] ??= {})); });
  return h('section', { class: 'card stack', 'aria-labelledby': 'atk-unit-h' },
    h('h2', { id: 'atk-unit-h' }, 'Attacking unit'),
    h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Unit'),
      h('select', { 'data-k': 'atk-unit', onchange: (e) => local(() => { ui.uid = e.target.value; }) },
        cus.map((u) => h('option', { value: u.uid, selected: u.uid === cu.uid }, u.name)))),
    seg('atk-type', 'Attack type', [['ranged', 'Shoot'], ['melee', 'Fight']], type, (v) => local(() => { ui.type[key] = v; })),
    choices.map((gr) => groupView(gr, type, (fn) => set(gr.key, fn))),
    g.units[cu.uid] == null ? h('p', { class: 'muted small' }, 'This unit has no game state yet; using its full size.') : null);
}

function groupView(gr, type, set) {
  const k = `atk-g-${gr.key}`;
  const profileSeg = (w) => (w.profiles.length > 1 ? seg(`${k}-p-${w.name}`, `${w.name} profile`, w.profiles.map((p) => [p, p]), w.profile,
    (v) => set((s) => { s.profiles = { ...s.profiles, [w.name]: v }; })) : null);
  const n = (w) => (w.n > 1 ? ` (×${w.n})` : '');
  const name = h('div', { class: 'row spread' }, h('strong', null, `${gr.modelName} ×${gr.models}`),
    gr.unitName !== gr.modelName ? h('span', { class: 'muted small' }, gr.unitName) : null);
  const body = [];
  body.push(numStep(`${k}-models`, `${gr.modelName}: models attacking`, gr.models, (v) => set((s) => { s.models = v ?? 0; }), gr.count));
  if (type === 'melee') {
    const picked = gr.weapons.find((w) => !w.fixed);
    if (gr.meleeOptions.length > 1) body.push(h('span', { class: 'muted small' }, 'One melee weapon per model'),
      seg(`${k}-melee`, `${gr.modelName} melee weapon`, gr.meleeOptions.map((o) => [o, o]), gr.melee, (v) => set((s) => { s.melee = v; })));
    else if (picked) body.push(h('div', null, picked.name + n(picked)));
    else body.push(h('p', { class: 'muted small' }, 'No melee weapon.'));
    if (picked) body.push(profileSeg(picked));
    for (const w of gr.weapons.filter((x) => x.fixed)) body.push(h('div', null, `${w.name}${n(w)} `, h('span', { class: 'muted small' }, '(Extra Attacks, always used)')), profileSeg(w));
  } else {
    if (gr.cqSwitch) body.push(h('span', { class: 'muted small' }, 'Fires either'),
      seg(`${k}-cq`, `${gr.modelName}: close-quarters weapons or the others`,
        [['other', gr.otherNames.join(', ')], ['cq', gr.cqNames.join(', ')]], gr.cq ? 'cq' : 'other', (v) => set((s) => { s.cq = v === 'cq'; })));
    if (!gr.weapons.length) body.push(h('p', { class: 'muted small' }, 'No ranged weapon.'));
    for (const w of gr.weapons) {
      body.push(pill(`${k}-w-${w.name}`, w.name + n(w), w.selected, () => set((s) => {
        const off = s.off ?? [];
        s.off = off.includes(w.name) ? off.filter((x) => x !== w.name) : [...off, w.name];
      })));
      if (w.selected) body.push(profileSeg(w));
    }
  }
  return h('div', { class: 'stack atk-group' }, name, body);
}

// ---------- target ----------

function targetCard(t) {
  const flags = [...(t.keywords ?? []), t.cover && 'in cover', t.halfRange && 'within half range', t.onObjective && 'within range of an objective',
    t.hidden && 'hidden', t.fnp && `Feel No Pain ${t.fnp}+`].filter(Boolean);
  const panel = h('div', { id: 'atk-tp', hidden: !ui.targetOpen });
  if (ui.targetOpen) renderTargetPanel(panel);
  return h('section', { class: 'stack', 'aria-label': 'Target' },
    h('div', { class: 'card stack' },
      h('div', null, h('strong', null, t.name || 'Unnamed target'),
        h('div', null, [`T${t.T}`, t.Sv >= 7 ? 'no armour save' : `Sv${t.Sv}+`, t.InSv && `InSv ${t.InSv}+`, `W${t.W}`, plural(t.models, 'model')].filter(Boolean).join(' · ')),
        flags.length ? h('div', { class: 'muted small' }, flags.join(' · ')) : null),
      h('button', { type: 'button', class: 'btn', 'data-k': 'atk-tp-toggle', 'aria-expanded': String(ui.targetOpen), 'aria-controls': 'atk-tp',
        onclick: () => local(() => { ui.targetOpen = !ui.targetOpen; }) }, ui.targetOpen ? 'Hide target editor' : 'Edit target')),
    panel);
}

// ---------- stratagems + manual effects ----------

function stratCard(env, manualFx, manualOn, turnKey, stratId, stratOn) {
  const { g, fac, cu, cus, key, st } = env;
  const units = cus.map((u) => ({ ...u, state: g.units[u.uid] ?? {} }));
  const list = (game) => availableStratagems({ phase: g.phase, turn: g.turn, phaseKey: key, detachmentIds: st.rosters.find((x) => x.id === g.rosterId).detachments,
    units, game, core, faction: fac });
  const avail = list(g), kwOk = list({ ...g, unitStrat: {} });   // kwOk: eligible ignoring "one stratagem per unit per phase"
  const nameOf = (id) => cus.find((u) => u.uid === id)?.name ?? 'another unit';
  const row = (e) => {
    const id = stratId(e);
    if (!id) {
      const r = ruleOf(fac, e.source);
      return h('div', { class: 'row' },
        pill(`atk-man-${e.source}`, e.label, manualOn.includes(e.source), () => local(() => {
          ui.manual[turnKey] = manualOn.includes(e.source) ? manualOn.filter((x) => x !== e.source) : [...manualOn, e.source];
        })),
        r ? rulesBtn(`atk-man-r-${e.source}`, 'Rules', r.title, r.text) : null);
    }
    const s = stratagemById(core, fac, id);
    if (!s) return null;
    const a = avail.find((x) => x.stratagem.id === id), on = stratOn(id);
    const reason = on ? null
      : !a ? `Not now: ${stratWhen(s)}`
      : a.usedThisPhase ? `Used this phase on ${nameOf(g.usedBy?.[id])}`
      : !a.affordable ? `Not enough CP (${g.cp} left)`
      : !a.eligibleUnits.includes(cu.uid) ? (kwOk.find((x) => x.stratagem.id === id).eligibleUnits.includes(cu.uid)
        ? 'This unit already used a stratagem this phase' : 'This unit is not eligible')
      : null;
    return h('div', { class: 'stack atk-strat' },
      h('div', { class: 'row spread' }, rulesBtn(`atk-s-r-${id}`, s.name, s.name, s.text),
        h('span', null, h('span', { class: 'big' }, s.cp), h('span', { class: 'muted' }, ' CP'))),
      s.effect ? h('p', { class: 'small rules-text' }, s.effect) : null,
      reason ? h('p', { class: 'atk-reason' }, reason) : null,
      pill(`atk-s-${id}`, on ? 'Used: tap to undo' : `Use (${s.cp} CP)`, on, () => (on ? undoStrat(s, key) : useStrat(s, cu.uid, key)), !!reason));
  };
  return h('section', { class: 'card stack', 'aria-labelledby': 'atk-strat-h' },
    h('div', { class: 'row spread' }, h('h2', { id: 'atk-strat-h' }, 'Stratagems and abilities'), h('span', null, h('span', { class: 'big' }, g.cp), h('span', { class: 'muted' }, ' CP'))),
    manualFx.map(row));
}

// ---------- context toggles ----------

function contextCard(env, showOverwatch) {
  const { cu, fac, state, key, st } = env;
  const label = (k, d) => fac.game?.stateLabels?.[k] ?? d;
  const unit = (k) => () => update((s) => { s.game.units[cu.uid] ??= unitStart(cu, fac); s.game.units[cu.uid][k] = !s.game.units[cu.uid][k]; });
  const tgt = (k) => () => update((s) => { s.target[k] = !s.target[k]; });
  return h('section', { class: 'card stack', 'aria-label': 'Situation' },
    h('div', { class: 'row atk-ctx' },
      fac.game?.stateLabels?.riled ? pill('atk-c-riled', label('riled', 'Riled up'), state.riled, unit('riled')) : null,
      pill('atk-c-charged', label('charged', 'Charged this turn'), state.charged, unit('charged')),
      pill('atk-c-stationary', label('stationary', 'Remained stationary'), state.stationary, unit('stationary')),
      pill('atk-c-cover', 'Target in cover', st.target.cover, tgt('cover')),
      pill('atk-c-half', 'Target within half range', st.target.halfRange, tgt('halfRange')),
      showOverwatch ? pill('atk-c-ow', 'Fire Overwatch (snap shooting)', ui.overwatch[key], () => local(() => { ui.overwatch[key] = !ui.overwatch[key]; })) : null));
}

// ---------- the dice card ----------

function attackCard(env, card, i, follow) {
  const { fac, choices, groups, st } = env;
  const t = st.target, k = `atk-${i}`;
  const chips = (list, part) => (list ?? []).map((c, j) => chipView(fac, c, `${k}-${part}-${j}`));
  const rrs = (list, part) => (list ?? []).map((c, j) => chipView(fac, c, `${k}-${part}-rr-${j}`, 'rr'));
  const chipRow = (...lists) => { const all = lists.flat(); return all.length ? h('div', { class: 'row atk-chips' }, all) : null; };
  const byName = new Map(groups.map((x) => [displayName(x.weapon), x.weapon]));
  const unitNames = [...new Set(card.weapons.map((w) => choices.find((c) => c.modelName === w.modelName)?.unitName).filter(Boolean))];

  const a = card.attacks, hit = card.hit, w = card.wound, sv = card.save, d = card.damage;
  const crit6 = (c) => `crit on ${c}${c < 6 ? '+' : ''}`;
  const hitCrit = hit.auto || hit.only6 ? null : crit6(hit.crit) + (hit.sustained || hit.lethal ? `: ${[
    hit.sustained && `+${plural(hit.sustained, 'hit')} per crit`, hit.lethal && 'crits auto-wound (Lethal Hits)'].filter(Boolean).join(', ')}` : '');
  const skill = `${env.type === 'melee' ? 'WS' : 'BS'}${hit.skill}+`;
  const saveLine = sv.Sv >= 7 ? 'No armour save'
    : `Sv${sv.Sv}+${sv.AP < 0 ? ` worsened by AP${sv.AP}` : ', AP 0'}${sv.need == null ? ': no save' : sv.InSv && sv.need === sv.InSv && sv.InSv < sv.Sv - sv.AP ? `; invulnerable ${sv.InSv}+ is better` : ''}`;

  // follow-along: real results typed in, validated against what could have been rolled
  const f = (ui.fa[card.title] ??= {});
  const set = (key, v) => local(() => { f[key] = v; if (key === 'attacks') f.rolls = null; if (key === 'failed') f.dmg = null; });
  const msg = (text) => h('p', { class: 'atk-msg', role: 'status' }, text);
  const A = a.total ?? f.attacks ?? null;
  const fa = {}, msgs = {};
  let hits = null, crits = 0, wounds = null, critWounds = 0, failed = null;
  if (follow) {
    if (A != null) {
      hits = hit.auto ? A : f.hits ?? null;
      if (!hit.auto && hits != null && hits > A) { msgs.hits = `Only ${dice(A, 'hit')} rolled: counting ${plural(A, 'hit')}.`; hits = A; }
      crits = hit.auto || hit.only6 ? 0 : f.crits ?? 0;
      if (hits != null && crits > hits) { msgs.crits = `Crits can't be more than hits: counting ${hits}.`; crits = hits; }
    }
    Object.assign(fa, followAlong(card, { attacks: A ?? undefined, hits: hits ?? undefined, crits }));
    if (fa.woundDice != null) {
      wounds = f.wounds ?? null;
      if (wounds != null && wounds > fa.woundDice) { msgs.wounds = `Only ${dice(fa.woundDice, 'wound')} rolled: counting ${plural(fa.woundDice, 'wound')}.`; wounds = fa.woundDice; }
      critWounds = f.critWounds ?? 0;
      if (wounds != null && critWounds > wounds) { msgs.critWounds = `Crits can't be more than wounds: counting ${wounds}.`; critWounds = wounds; }
      if (wounds != null) Object.assign(fa, followAlong(card, { attacks: A, hits: hits ?? undefined, crits, wounds, critWounds }));
    }
    if (fa.saveDice != null) {
      failed = f.failed ?? null;
      if (failed != null && failed > fa.saveDice) { msgs.failed = `Only ${plural(fa.saveDice, 'save')} rolled: counting ${fa.saveDice}.`; failed = fa.saveDice; }
    }
  }
  const diceLine = (text) => h('p', { class: 'atk-dice' }, text);

  // ATTACKS
  const perPart = card.weapons.map((x) => `${x.A} A × ${plural(x.models, 'model')}`).join(' + ');
  const aLines = [h('p', null, a.expr ? `${a.expr} per model × ${plural(a.models, 'model')}${a.bonusDice ? ` + ${a.bonusDice} bonus` : ''} (~${one(a.mean)} on average)` : perPart)];
  if (follow && a.expr) {
    aLines.push(numStep(`${k}-a`, 'Attacks rolled (total)', f.attacks ?? null, (v) => set('attacks', v)),
      h('button', { type: 'button', class: 'btn', 'data-k': `${k}-a-roll`, onclick: () => local(() => {
        f.rolls = card.weapons.flatMap((x) => Array.from({ length: x.models }, () => roll(x.A)));
        f.attacks = f.rolls.reduce((s, n) => s + n, 0) + a.bonusDice;
      }) }, 'Roll for me'),
      f.rolls ? h('p', { class: 'small' }, `Rolled ${f.rolls.join(', ')}${a.bonusDice ? ` + ${a.bonusDice} bonus` : ''} = ${f.attacks}`) : null);
  }

  // HIT
  const hLines = [h('p', null, hit.auto ? 'Torrent: no hit roll' : hit.only6 ? 'Snap shooting: only unmodified 6s hit' : `${skill}${hit.need !== hit.skill ? `, ${hit.need}+ after modifiers` : ''}`),
    hitCrit ? h('p', { class: 'crit' }, hitCrit) : null];
  if (follow && !hit.auto) {
    hLines.push(A == null ? h('p', { class: 'muted small' }, 'Enter the attacks rolled to see the hit dice.') : diceLine(`Roll ${dice(fa.hitDice, 'hit')}`),
      numStep(`${k}-h`, 'Hits', f.hits ?? null, (v) => set('hits', v)), msgs.hits ? msg(msgs.hits) : null,
      hit.only6 ? null : numStep(`${k}-hc`, 'of which crits', f.crits ?? null, (v) => set('crits', v)), msgs.crits ? msg(msgs.crits) : null);
  }

  // WOUND
  const wLines = [h('p', null, `S${w.S} vs T${w.T}${w.need !== w.base ? `, ${w.need}+ after modifiers` : ''}`),
    h('p', { class: 'crit' }, crit6(w.crit) + (w.devastating ? ': mortal wounds equal to D, no save (Devastating Wounds)' : ''))];
  if (follow) {
    if (fa.woundDice == null) wLines.push(h('p', { class: 'muted small' }, 'Enter the hits to see the wound dice.'));
    else {
      wLines.push(diceLine(`Roll ${dice(fa.woundDice, 'wound')}`),
        fa.autoWounds ? h('p', { class: 'crit' }, `+${fa.autoWounds} auto-wound${fa.autoWounds === 1 ? '' : 's'} (Lethal Hits)`) : null,
        numStep(`${k}-w`, 'Wounds', f.wounds ?? null, (v) => set('wounds', v)), msgs.wounds ? msg(msgs.wounds) : null,
        numStep(`${k}-wc`, 'of which crits', f.critWounds ?? null, (v) => set('critWounds', v)), msgs.critWounds ? msg(msgs.critWounds) : null);
    }
  }

  // SAVE
  const sLines = [h('p', null, saveLine)];
  if (follow) {
    if (fa.saveDice == null) sLines.push(h('p', { class: 'muted small' }, 'Enter the wounds to see the saves.'));
    else {
      sLines.push(diceLine(sv.need == null ? `${plural(fa.saveDice, 'wound')} with no save` : `Opponent rolls ${plural(fa.saveDice, 'save')}`),
        fa.devastatingCrits ? h('p', { class: 'crit' }, fa.mortalWounds != null ? `${plural(fa.mortalWounds, 'mortal wound')} (Devastating)`
          : `${plural(fa.devastatingCrits, 'crit wound')}: roll ${d.expr} mortal wounds each (Devastating)`) : null,
        numStep(`${k}-f`, 'Failed saves', f.failed ?? null, (v) => set('failed', v)), msgs.failed ? msg(msgs.failed) : null);
    }
  }

  // DAMAGE
  const random = /D/i.test(d.expr);
  const dLines = [h('p', null, `${d.expr} damage per failed save; no spill-over between models`)];
  if (follow && random) {
    const n = (failed ?? 0) + (fa.devastatingCrits ?? 0);
    dLines.push(n ? h('button', { type: 'button', class: 'btn', 'data-k': `${k}-d-roll`, onclick: () => local(() => {
      f.dmg = Array.from({ length: n }, () => Math.max(1, roll(d.expr)));
    }) }, `Roll for me (${n} × ${d.expr})`) : h('p', { class: 'muted small' }, 'Enter the failed saves to roll damage.'),
    f.dmg ? h('p', { class: 'small' }, `Rolled ${f.dmg.join(', ')}: one per failed save${fa.devastatingCrits ? ' and crit wound' : ''}`) : null);
  }

  const row = (name, big, lines, chipList) => h('div', { class: 'atk-step' },
    h('div', { class: 'atk-step-name' }, name),
    h('div', { class: 'atk-step-body' }, h('div', { class: 'big' }, big), lines, chipList));
  const e = card.expected;
  const titleParts = card.weapons.map((x, j) => [j ? ' + ' : '',
    byName.has(x.name) ? h('button', { type: 'button', class: 'btn link atk-wname', 'data-k': `${k}-wn-${j}`, onclick: () => weaponSheet(byName.get(x.name)) }, x.name) : x.name,
    ` ×${x.models}`]);
  return h('article', { class: 'card atk-card', 'aria-label': card.title },
    h('h3', null, titleParts, unitNames.length ? ` (${unitNames.join(', ')})` : ''),
    h('p', { class: 'muted atk-vs' }, `vs ${t.name || 'target'} (T${t.T} ${t.Sv >= 7 ? 'no Sv' : `Sv${t.Sv}+`}${t.InSv ? ` InSv ${t.InSv}+` : ''})`),
    row('Attacks', a.total != null ? `Roll ${a.total}` : `Roll ${a.expr}`, aLines, chipRow(chips(a.bonus, 'a'))),
    row('Hit', hit.auto ? 'Auto-hit' : hit.only6 ? '6 only' : `${hit.need}+`, hLines, chipRow(chips(hit.chips, 'h'), rrs(hit.rerolls, 'h'))),
    row('Wound', `${w.need}+`, wLines, chipRow(chips(w.chips, 'w'), rrs(w.rerolls, 'w'))),
    row('Save (opponent)', sv.need == null ? 'No save' : `${sv.need}+`, sLines, chipRow(chips(sv.chips, 's'))),
    row('Damage', d.expr, dLines, chipRow(chips(d.chips, 'd'))),
    h('p', { class: 'atk-expected' }, `Expected: ~${one(e.hits)} hits · ~${one(e.wounds)} wounds · ~${one(e.unsaved)} unsaved · ~${one(e.kills)} models killed`));
}

// ---------- after attacking ----------

function afterCard(env) {
  const { result, sheets } = env;
  const reminders = sheets.flatMap((d) => [
    ...d.abilities.filter((a) => /mortal wound/i.test(a.text)).map((a) => ({ who: d.name, name: a.name, text: a.text })),
    ...(d.coreAbilities ?? []).filter((c) => /deadly demise/i.test(c)).map((c) => ({ who: d.name, name: c,
      text: core.abilities.find((a) => up(c).startsWith(a.name))?.text ?? c })),
  ]);
  return h('section', { class: 'card stack', 'aria-labelledby': 'atk-after-h' },
    h('h2', { id: 'atk-after-h' }, 'After attacking'),
    result.after.map((x) => h('p', null, h('strong', null, `${x.label}: `), x.text)),
    reminders.map((r, i) => h('button', { type: 'button', class: 'btn atk-reminder', 'data-k': `atk-rem-${i}`, onclick: () => openSheet(r.name, r.text) },
      `${r.who}: `, h('strong', null, r.name))),
    !result.after.length && !reminders.length ? h('p', { class: 'muted' }, 'Nothing to roll after this attack.') : null);
}
