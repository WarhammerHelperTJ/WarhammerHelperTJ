// Game view (source 2.2 + 2.4): turn tracker, then four panes: abilities for this phase | score + units | stratagems.
import { h, openSheet } from '../dom.js';
import { openDatasheet } from './datasheet.js';
import { get, update, subscribe } from '../store.js';
import { loadCore, loadFaction, loadMissions, armyRuleById } from '../data.js';
import { PHASES, newGame, nextPhase, callArmyRule, combatUnits, unitStart, warlordRules } from '../game.js';
import { renderTargetPanel } from './target.js';
import { phaseReminders } from '../engine/stratagems.js';
import { stratsPane } from './strats.js';
import { scorePane } from './score.js';

let root, unsub, core, missions;
const loaded = new Map();                 // faction id -> faction data
const ui = { rosterId: null, first: 'me', name: '', pane: 'units', mid: 'units' }; // view choices, not persisted; mid = middle column on wide screens

// Same guard as the army view: a blur commit must not rebuild the DOM under a pressed pointer.
let down = false, pending = false;
addEventListener('pointerdown', () => { down = true; }, true);
for (const ev of ['pointerup', 'pointercancel']) addEventListener(ev, () => {
  down = false;
  if (pending) { pending = false; setTimeout(paint); }
}, true);
let queued = false;
const schedule = () => {
  if (down) { pending = true; return; }
  if (!queued) { queued = true; setTimeout(() => { queued = false; paint(); }); }
};

export const PHASE_LABEL = { command: 'Command', movement: 'Movement', shooting: 'Shooting', charge: 'Charge', fight: 'Fight' };
const turnLabel = (g) => (g.turn === 'me' ? 'Your turn' : "Opponent's turn");

export async function render(r) {
  root = r;
  unsub?.();
  unsub = subscribe(schedule);
  root.append(h('p', { class: 'muted' }, 'Loading…'));
  try {
    [core, missions] = await Promise.all([loadCore(), loadMissions()]);
    await Promise.all([...new Set(get().rosters.map((x) => x.faction))].map((id) => loadFaction(id).then((f) => loaded.set(id, f))));
  } catch (e) {
    root.replaceChildren(h('p', { class: 'crit' }, `Could not load data: ${e.message}`));
    return;
  }
  paint();
}

function paint() {
  if (!location.hash.startsWith('#/game')) { unsub?.(); unsub = null; return; }
  const st = get();
  const roster = st.game && st.rosters.find((x) => x.id === st.game.rosterId);
  const fac = roster && loaded.get(roster.faction);
  const focusKey = document.activeElement?.dataset?.k;
  const y = scrollY;
  const tops = [...root.querySelectorAll('.pane')].map((p) => p.scrollTop); // panes scroll on their own on wide screens
  root.replaceChildren(...(st.game ? running(st.game, roster, fac) : start(st)).filter(Boolean));
  if (focusKey) root.querySelector(`[data-k="${CSS.escape(focusKey)}"]`)?.focus({ preventScroll: true });
  scrollTo(0, y);
  root.querySelectorAll('.pane').forEach((p, i) => { p.scrollTop = tops[i] ?? 0; });
}

const editGame = (fn) => update((s) => { fn(s.game); });

// ---------- no game ----------

function start(st) {
  if (!st.rosters.length) return [h('h1', null, 'Game'),
    h('p', null, 'You need a roster first. ', h('a', { href: '#/army' }, 'Go to Army'))];
  const id = st.rosters.some((x) => x.id === ui.rosterId) ? ui.rosterId : (st.activeRosterId ?? st.rosters[0].id);
  return [
    h('h1', null, 'Game'),
    h('div', { class: 'card stack' },
      h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Roster'),
        h('select', { 'data-k': 'roster', onchange: (e) => { ui.rosterId = e.target.value; } },
          st.rosters.map((x) => h('option', { value: x.id, selected: x.id === id }, x.name)))),
      h('span', { class: 'muted', id: 'first-l' }, 'Who has the first turn?'),
      h('div', { class: 'seg', role: 'group', 'aria-labelledby': 'first-l' },
        [['me', 'Me'], ['opp', 'Opponent']].map(([v, label]) => h('button', { type: 'button', 'aria-pressed': String(ui.first === v),
          onclick: () => { ui.first = v; paint(); } }, label))),
      h('label', { class: 'field' }, h('span', { class: 'muted' }, 'Game name (optional)'),
        h('input', { type: 'text', 'data-k': 'gname', placeholder: 'vs Space Marines', value: ui.name, oninput: (e) => { ui.name = e.target.value; } }))),
    h('button', { type: 'button', class: 'btn primary', onclick: () => {
      const rid = root.querySelector('[data-k="roster"]').value;
      const r = st.rosters.find((x) => x.id === rid), fac = loaded.get(r.faction);
      const name = root.querySelector('[data-k="gname"]').value.trim() || `${r.name} · ${new Date().toLocaleDateString()}`;
      ui.name = '';
      update((s) => { s.game = { ...newGame(r, fac, ui.first), name }; });
    } }, 'Start game'),
    st.games.length ? h('section', { class: 'stack', 'aria-labelledby': 'saved-h' },
      h('h2', { id: 'saved-h' }, 'Saved games'),
      st.games.map((g, i) => h('div', { class: 'card stack' },
        h('div', null, h('strong', null, g.name ?? 'Game'),
          h('div', { class: 'muted' }, `Round ${g.round} · ${turnLabel(g)} · ${PHASE_LABEL[g.phase]} · ${g.cp} CP`)),
        h('div', { class: 'row' },
          h('button', { type: 'button', class: 'btn primary', onclick: () => update((s) => { [s.game] = s.games.splice(i, 1); }) }, 'Resume'),
          h('button', { type: 'button', class: 'btn danger', onclick: () => {
            if (confirm(`Delete "${g.name ?? 'Game'}"? This cannot be undone.`)) update((s) => { s.games.splice(i, 1); });
          } }, 'Delete'))))) : null,
  ];
}

// ---------- running game ----------

function endGame() {
  if (confirm('End this game? It is deleted: round, CP and unit states are lost.')) update((s) => { s.game = null; });
}
// Park the open game in the saved list; it can be resumed from the start screen.
const closeGame = () => update((s) => { s.games.push(s.game); s.game = null; });

function phaseSteps(g) {
  return h('ol', { class: 'phases', 'aria-label': 'Phases' }, PHASES.map((p) =>
    h('li', { 'aria-current': p === g.phase ? 'step' : null }, PHASE_LABEL[p])));
}

function running(g, roster, fac) {
  if (!roster || !fac) return [h('h1', null, 'Game'), h('p', { class: 'crit' }, 'The roster of this game no longer exists.'),
    h('button', { type: 'button', class: 'btn', onclick: closeGame }, 'Close game'),
    h('button', { type: 'button', class: 'btn danger', onclick: endGame }, 'End game')];
  const units = combatUnits(roster, fac);
  const cfg = fac.game ?? {};
  const toggle = cfg.armyToggle;
  const rule = toggle && armyRuleById(fac, toggle.armyRuleId);
  const label = (k, dflt) => cfg.stateLabels?.[k] ?? dflt;
  const active = !!g.waaagh?.activeUntil;

  const header = h('section', { class: 'card stack game-head', 'aria-label': 'Turn tracker' },
    g.name ? h('strong', null, g.name) : null,
    h('div', { class: 'row spread' },
      h('div', null, h('div', { class: 'muted' }, 'Battle round'), h('div', { class: 'big' }, g.round)),
      h('div', { class: 'turn' + (g.turn === 'me' ? ' mine' : '') }, turnLabel(g))),
    h('div', { class: 'row spread nowrap' }, h('span', { id: 'cp-l' }, 'Command points (CP)'),
        h('div', { class: 'stepper', role: 'group', 'aria-labelledby': 'cp-l' },
          h('button', { type: 'button', 'data-k': 'cp-dec', 'aria-label': 'Remove 1 CP', disabled: g.cp <= 0, onclick: () => editGame((x) => { x.cp = Math.max(0, x.cp - 1); }) }, '−'),
          h('output', { class: 'big' }, g.cp),
          h('button', { type: 'button', 'data-k': 'cp-inc', 'aria-label': 'Add 1 CP', onclick: () => editGame((x) => { x.cp++; }) }, '+'))),
    phaseSteps(g),
    // Always-on army rules that only count while the Warlord has them (ids from the faction's game.json)
    warlordRules(roster, fac).map(({ rule: wr, on, warlordName, cpPerRound }) =>
      h('button', { type: 'button', class: 'btn passive', onclick: () => openSheet(wr.name, wr.text) },
        h('strong', null, `${on ? '✓' : '✕'} ${wr.name}: ${on ? 'active' : 'not active'}`),
        h('span', { class: 'muted' }, on ? ` · Warlord: ${warlordName}${cpPerRound && g.roundCp ? ` · +${cpPerRound} CP added each battle round` : ''}`
          : warlordName ? ` · your Warlord (${warlordName}) doesn't have it` : ' · no Warlord set in this roster'))),
    rule ? h('button', { type: 'button', class: 'pill', 'data-k': 'army-toggle', 'aria-pressed': String(active),
      disabled: g.waaagh?.used && !active,
      onclick: () => {
        if (g.waaagh?.used) return;
        if (!confirm(`${toggle.label ?? 'Call army rule'}? This is once per battle.`)) return;
        update((s) => { s.game = callArmyRule(s.game, units, rule.name) ?? s.game; });
      } }, toggle.label ?? rule.name, g.waaagh?.used && !active ? ' (used)' : '') : null);

  const unitList = h('section', { class: 'stack', 'aria-labelledby': 'units-h' },
    h('h2', { id: 'units-h' }, 'Units'),
    units.map((cu) => unitCard(cu, g.units[cu.uid] ?? unitStart(cu, fac), fac, label)));

  const target = h('div');
  renderTargetPanel(target);

  const reminders = phaseReminders({ phase: g.phase, turn: g.turn, units, faction: fac });
  const abilities = [
    h('h2', null, `Abilities: ${PHASE_LABEL[g.phase]} phase`),
    // always-on first; sort is stable, so the rest keeps roster order
    reminders.length ? reminders.sort((a, b) => b.always - a.always).map((r) => h('article', { class: 'card stack ability' },
      h('div', null, h('h3', null, r.abilityName),
        h('div', { class: 'muted small' }, [r.unitName, r.always ? 'Always on' : 'This phase'].filter(Boolean).join(' · '))),
      h('div', { class: 'rules-text' }, r.text)))
      : h('p', { class: 'muted' }, 'No abilities for this phase.'),
  ];
  const PANES = [['abilities', 'Abilities'], ['score', 'Score'], ['units', 'Units'], ['strats', 'Strats']];
  const pane = (k, ...kids) => h('section', { class: `stack pane pane-${k}${ui.pane === k ? ' on' : ''}${ui.mid === k ? ' mid' : ''}`, 'aria-label': PANES.find((p) => p[0] === k)[1] }, kids);

  return [
    // phone: one pane at a time, picked with the switch; wide screens: all three side by side (game.css)
    h('div', { class: 'game-cols' },
      header,
      // phone: pick one of the four panes; wide: abilities and strats are always shown, the middle column is units or score
      h('div', { class: 'seg pane-switch', role: 'group', 'aria-label': 'Show' }, PANES.map(([k, text]) =>
        h('button', { type: 'button', 'data-k': `pane-${k}`, 'aria-pressed': String(ui.pane === k),
          onclick: () => { ui.pane = k; if (k === 'units' || k === 'score') ui.mid = k; paint(); } }, text))),
      h('div', { class: 'seg mid-switch', role: 'group', 'aria-label': 'Middle column' }, [['units', 'Units'], ['score', 'Score']].map(([k, text]) =>
        h('button', { type: 'button', 'data-k': `mid-${k}`, 'aria-pressed': String(ui.mid === k), onclick: () => { ui.mid = k; ui.pane = k; paint(); } }, text))),
      pane('abilities', abilities),
      pane('score', scorePane(g, roster, fac, missions, paint)),
      pane('units', unitList, target,
        h('button', { type: 'button', class: 'btn', onclick: closeGame }, 'Close game (keep it for later)'),
        h('button', { type: 'button', class: 'btn danger', onclick: endGame }, 'End game')),
      pane('strats', stratsPane(get(), roster, fac, core))),
    h('div', { class: 'game-next' },
      h('button', { type: 'button', class: 'btn primary', 'data-k': 'next', onclick: () => update((s) => { s.game = nextPhase(s.game); }) },
        g.phase === 'fight' ? (g.turn === 'me' ? "Next phase: opponent's turn" : 'Next phase: your turn') : `Next phase: ${PHASE_LABEL[PHASES[PHASES.indexOf(g.phase) + 1]]}`)),
  ];
}

function unitCard(cu, s, fac, label) {
  const max = cu.members.reduce((n, m) => n + (m.size ?? 1), 0);
  const d0 = fac.datasheets.find((d) => d.id === cu.members[0].datasheetId);
  const maxW = d0?.models.at(-1)?.W ?? 1;
  const set = (fn) => update((st) => { st.game.units[cu.uid] ??= unitStart(cu, fac); fn(st.game.units[cu.uid]); });
  const pill = (k, text) => h('button', { type: 'button', class: 'pill', 'data-k': `${k}-${cu.uid}`, 'aria-pressed': String(!!s[k]),
    onclick: () => set((x) => { x[k] = !x[k]; }) }, text);
  const step = (k, text, lo, hi) => h('div', { class: 'row spread' }, h('span', { class: 'muted' }, text),
    h('div', { class: 'stepper' },
      h('button', { type: 'button', 'data-k': `${k}-dec-${cu.uid}`, 'aria-label': `${text} down`, disabled: s[k] <= lo, onclick: () => set((x) => { x[k] = Math.max(lo, x[k] - 1); }) }, '−'),
      h('output', null, s[k]),
      h('button', { type: 'button', 'data-k': `${k}-inc-${cu.uid}`, 'aria-label': `${text} up`, disabled: s[k] >= hi, onclick: () => set((x) => { x[k] = Math.min(hi, x[k] + 1); }) }, '+')));
  return h('div', { class: 'card stack game-unit' },
    h('button', { type: 'button', class: 'btn link unit-title', onclick: () => abilitiesSheet(cu, fac) }, cu.name),
    h('div', { class: 'row' },
      fac.game?.stateLabels?.riled ? pill('riled', fac.game.stateLabels.riled) : null,   // faction-specific state (Orks)
      pill('charged', label('charged', 'Charged this turn')),
      pill('advanced', label('advanced', 'Advanced')),
      pill('stationary', label('stationary', 'Remained stationary / moved ≤3"')),
      pill('shocked', label('shocked', 'Battle-shocked'))),
    step('models', 'Models remaining', 0, max),
    max === 1 && s.wounds != null ? step('wounds', 'Wounds remaining', 0, maxW) : null);
}

function abilitiesSheet(cu, fac) {
  openDatasheet(cu.members.map((m) => fac.datasheets.find((d) => d.id === m.datasheetId)), cu.name);
}
