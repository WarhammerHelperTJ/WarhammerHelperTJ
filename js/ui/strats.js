// Stratagem pane of the Game view (source 2.4): usable-now list, use/undo.
import { h, openSheet } from '../dom.js';
import { detachmentById } from '../data.js';
import { combatUnits, phaseKey } from '../game.js';
import { availableStratagems, stratagemTargets } from '../engine/stratagems.js';
import { useStrat, undoStrat, stratWhen } from './strat-actions.js';

export function stratsPane(st, roster, fac, core) {
  const g = st.game, key = phaseKey(g);
  const cus = combatUnits(roster, fac);
  const units = cus.map((u) => ({ ...u, state: g.units[u.uid] ?? {} }));
  const nameOf = (id) => cus.find((u) => u.uid === id)?.name ?? '?';
  const list = availableStratagems({ phase: g.phase, turn: g.turn, phaseKey: key, detachmentIds: roster.detachments, units, game: g, core, faction: fac });

  const use = (s, uid) => useStrat(s, uid, key);
  const pickAndUse = (a) => {
    const s = a.stratagem;
    const untargeted = stratagemTargets(s, fac).length === 0 && a.eligibleUnits.length === cus.length;
    if (a.eligibleUnits.length === 1 && !untargeted) { use(s, a.eligibleUnits[0]); return; }
    let close;
    const pick = (uid) => () => { close(); use(s, uid); };
    close = openSheet(`${s.name}: pick a unit`, h('div', { class: 'stack' },
      a.eligibleUnits.map((id) => h('button', { type: 'button', class: 'btn', onclick: pick(id) }, nameOf(id))),
      untargeted ? h('button', { type: 'button', class: 'btn', onclick: pick(null) }, 'No specific unit') : null));
  };

  const card = (a) => {
    const s = a.stratagem;
    const reason = a.usedThisPhase ? 'Used this phase' : !a.affordable ? 'Not enough CP' : a.eligibleUnits.length ? null : 'No eligible unit';
    const field = (label, text) => text ? h('div', null, h('strong', null, `${label}: `), h('span', { class: 'rules-text' }, text)) : null;
    return h('article', { class: 'card stack strat' + (a.usable ? '' : ' off') },
      h('div', { class: 'row spread strat-head' },
        h('div', null, h('h3', null, s.name),
          h('div', { class: 'muted small' }, s.detachment ? (detachmentById(fac, s.detachment)?.name ?? s.detachment) : 'Core'),
          h('div', { class: 'muted small' }, stratWhen(s))),
        h('div', { class: 'strat-cp' }, h('span', { class: 'big' }, s.cp), h('span', { class: 'muted' }, ' CP'))),
      field('WHEN', s.when), field('TARGET', s.target), field('EFFECT', s.effect), field('RESTRICTIONS', s.restrictions),
      a.eligibleUnits.length ? h('div', { class: 'small' }, h('strong', null, 'Eligible: '), a.eligibleUnits.map(nameOf).join(', ')) : null,
      reason ? h('p', { class: 'reason' }, a.usedThisPhase && g.usedBy?.[s.id] ? `${reason} on ${nameOf(g.usedBy[s.id])}` : reason) : null,
      a.usable ? h('button', { type: 'button', class: 'btn primary', onclick: () => pickAndUse(a) }, `Use (${s.cp} CP)`) : null,
      a.usedThisPhase ? h('button', { type: 'button', class: 'btn', onclick: () => undoStrat(s, key) }, `Undo (refund ${s.cp} CP)`) : null);
  };

  const usable = list.filter((a) => a.usable), rest = list.filter((a) => !a.usable);
  return [
    h('h2', null, 'Stratagems usable now'),
    // only the Command-phase CP is automatic; other gains are added by hand, so say why things are greyed out
    list.some((a) => !a.affordable) ? h('p', { class: 'crit' },
      `You have ${g.cp} CP, so stratagems that cost more are listed under "Not usable now". Add the CP you have gained with +.`) : null,
    usable.length ? usable.map(card) : h('p', { class: 'muted' }, 'Nothing usable right now.'),
    rest.length ? h('h2', null, 'Not usable now') : null,
    rest.map(card),
  ];
}

