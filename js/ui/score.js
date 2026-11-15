// Score pane of the Game view: mission setup (Force Dispositions, Secondary mode), VP totals, and the Primary/Secondary
// lines that can score at this moment of the game. Logic in js/scoring.js; missions from data/core/missions.json.
import { h, openSheet } from '../dom.js';
import { update } from '../store.js';
import { primaryFor, dispositionsFor, linesNow, lineOpen, cappedVp, totals, newSecondaries, addCard, discard, putBack, CAPS } from '../scoring.js';

const form = { fd: '', opp: '', mode: 'tactical', fixed: [] };   // setup choices, not persisted
const editGame = (fn) => update((s) => { fn(s.game); });
const cardText = (c) => openSheet(c.name, c.text);
const field = (label, control) => h('label', { class: 'field' }, h('span', { class: 'muted' }, label), control);
const select = (k, value, options, onPick) => h('select', { 'data-k': k, onchange: (e) => onPick(e.target.value) },
  options.map(([v, text]) => h('option', { value: v, selected: v === value }, text)));

function setup(g, roster, fac, missions, repaint) {
  const mine = dispositionsFor(missions, fac, roster.detachments);
  if (!mine.includes(form.fd)) form.fd = mine[0];
  if (!missions.forceDispositions.includes(form.opp)) form.opp = missions.forceDispositions[0];
  const fixedCards = missions.secondaries.filter((s) => s.fixed);
  const primary = primaryFor(missions, form.fd, form.opp);
  const ready = form.mode === 'tactical' || form.fixed.length === 2;
  return [
    h('h2', null, 'Mission'),
    h('p', { class: 'muted small' }, 'Pick the Force Dispositions both players revealed. Your Primary Mission is the card for that pair.'),
    field('Your Force Disposition', select('sc-fd', form.fd, mine.map((x) => [x, x]), (v) => { form.fd = v; repaint(); })),
    field("Opponent's Force Disposition", select('sc-opp', form.opp, missions.forceDispositions.map((x) => [x, x]), (v) => { form.opp = v; repaint(); })),
    h('button', { type: 'button', class: 'btn passive', onclick: () => cardText(primary) }, h('strong', null, `Primary: ${primary.name}`), h('span', { class: 'muted' }, ' · read card')),
    h('div', { class: 'seg', role: 'group', 'aria-label': 'Secondary Missions' },
      [['tactical', 'Tactical'], ['fixed', 'Fixed']].map(([v, text]) => h('button', { type: 'button', 'data-k': `sc-mode-${v}`, 'aria-pressed': String(form.mode === v),
        onclick: () => { form.mode = v; repaint(); } }, `${text} Secondaries`))),
    form.mode === 'fixed' ? h('div', { class: 'stack' }, h('span', { class: 'muted small' }, 'Pick two Fixed Missions:'),
      fixedCards.map((c) => h('button', { type: 'button', class: 'pill', 'data-k': `sc-fix-${c.id}`, 'aria-pressed': String(form.fixed.includes(c.id)),
        disabled: !form.fixed.includes(c.id) && form.fixed.length >= 2,
        onclick: () => { form.fixed = form.fixed.includes(c.id) ? form.fixed.filter((x) => x !== c.id) : [...form.fixed, c.id]; repaint(); } }, c.name))) : null,
    h('button', { type: 'button', class: 'btn primary', 'data-k': 'sc-start', disabled: !ready, onclick: () => editGame((x) => {
      x.mission = { fd: form.fd, opp: form.opp, primary: primary.id };
      x.secondary = newSecondaries(form.mode, form.fixed);
      x.vp ??= { log: [], opp: 0 };
    }) }, 'Start scoring'),
  ];
}

export function scorePane(g, roster, fac, missions, repaint) {
  if (!missions) return [h('p', { class: 'muted' }, 'Loading missions…')];
  if (!g.mission) return setup(g, roster, fac, missions, repaint);
  const log = g.vp?.log ?? [], t = totals(log), sec = g.secondary, turn = `${g.round}-${g.turn}`;
  const card = (id) => missions.secondaries.find((s) => s.id === id);
  const primary = missions.primaries.find((p) => p.id === g.mission.primary);

  const lineButtons = (kind, c, mode) => {
    const now = linesNow(c, g, mode);
    if (!now.length) return h('p', { class: 'muted small' }, 'Nothing to score right now.');
    return now.map(({ line, key: lk, vp }) => {
      const entry = { kind, round: g.round, card: c.id, line: lk, turn, vp, upTo: line.upTo, fixed: mode === 'fixed' };
      const add = lineOpen(log, c, lk, turn) ? cappedVp(log, entry) : 0;
      return h('button', { type: 'button', class: 'btn pick score-line', 'data-k': `sc-${c.id}-${lk}`, disabled: !add,
        onclick: () => editGame((x) => { x.vp.log.push({ ...entry, vp: add, label: `${c.name}: +${add}VP` }); }) },
        h('span', { class: 'rules-text' }, `${line.or ? 'OR ' : ''}${line.text}`),
        h('strong', null, !lineOpen(log, c, lk, turn) ? 'scored' : add < vp ? `+${add}VP (cap)` : `+${vp}VP${/^For each/i.test(line.text) ? ' each' : ''}`));
    });
  };

  const tactical = sec.mode === 'tactical';
  const myCommand = g.turn === 'me' && g.phase === 'command', myTurnEnd = g.turn === 'me' && g.phase === 'fight';
  const secCard = (id) => {
    const c = card(id), scored = log.some((e) => e.card === id && e.turn === turn);
    // When Drawn rules that discard the card (not "shuffle back": that is Put back)
    const whenDrawnDiscard = tactical && c.intro.some((l) => /^WHEN DRAWN.*discard this card and draw/i.test(l));
    return h('article', { class: 'card stack' },
      h('button', { type: 'button', class: 'btn link', onclick: () => cardText(c) }, c.name),
      c.intro.filter((l) => /^WHEN DRAWN/.test(l)).map((l) => h('p', { class: 'muted small' }, l)),
      lineButtons('secondary', c, sec.mode),
      h('div', { class: 'row' },
        tactical && scored ? h('button', { type: 'button', class: 'btn', onclick: () => editGame((x) => { x.secondary = discard(x.secondary, id); }) }, 'Achieved: discard') : null,
        tactical && myTurnEnd && !scored ? h('button', { type: 'button', class: 'btn', onclick: () => editGame((x) => { x.secondary = discard(x.secondary, id); x.cp++; }) }, 'Discard (+1 CP)') : null,
        tactical && myCommand && !sec.swapUsed && g.cp >= 1 ? h('button', { type: 'button', class: 'btn',
          onclick: () => editGame((x) => { x.cp--; x.secondary = { ...discard(x.secondary, id), swapUsed: true }; }) }, 'Discard to draw a new one (1 CP, once)') : null,
        whenDrawnDiscard ? h('button', { type: 'button', class: 'btn', onclick: () => editGame((x) => { x.secondary = discard(x.secondary, id); }) }, 'When Drawn: discard') : null,
        tactical ? h('button', { type: 'button', class: 'btn', 'data-k': `sc-back-${id}`, onclick: () => editGame((x) => { x.secondary = putBack(x.secondary, id); }) }, 'Put back in deck') : null));
  };

  const oppVp = g.vp.opp ?? 0;
  return [
    h('h2', null, 'Score'),
    h('section', { class: 'card stack', 'aria-label': 'Victory points' },
      h('div', { class: 'row spread nowrap' }, h('span', null, 'You'), h('output', { class: 'big', 'data-k': 'sc-total' }, `${t.total} VP`)),
      h('div', { class: 'muted small' }, `Primary ${t.primary}/${CAPS.kind} · Secondary ${t.secondary}/${CAPS.kind} · round ${g.round}: `
        + `${log.filter((e) => e.round === g.round && e.kind === 'primary').reduce((s, e) => s + e.vp, 0)}/${CAPS.perRound} primary, `
        + `${log.filter((e) => e.round === g.round && e.kind === 'secondary').reduce((s, e) => s + e.vp, 0)}/${CAPS.perRound} secondary`),
      h('button', { type: 'button', class: 'pill', 'data-k': 'sc-ready', 'aria-pressed': String(t.ready > 0),
        onclick: () => editGame((x) => { x.vp.log = t.ready ? x.vp.log.filter((e) => e.kind !== 'ready') : [...x.vp.log, { kind: 'ready', round: 0, vp: CAPS.ready, label: 'Battle Ready' }]; }) },
      `Battle Ready army (+${CAPS.ready}VP)`),
      h('div', { class: 'row spread nowrap' }, h('span', { id: 'sc-opp-l' }, 'Opponent'),
        h('div', { class: 'stepper', role: 'group', 'aria-labelledby': 'sc-opp-l' },
          h('button', { type: 'button', 'data-k': 'sc-opp-dec', 'aria-label': 'Opponent 1 VP less', disabled: oppVp <= 0, onclick: () => editGame((x) => { x.vp.opp = Math.max(0, oppVp - 1); }) }, '−'),
          h('output', { class: 'big' }, oppVp),
          h('button', { type: 'button', 'data-k': 'sc-opp-inc', 'aria-label': 'Opponent 1 VP more', onclick: () => editGame((x) => { x.vp.opp = oppVp + 1; }) }, '+'))),
      log.length ? h('button', { type: 'button', class: 'btn', 'data-k': 'sc-undo', onclick: () => editGame((x) => { x.vp.log.pop(); }) },
        `Undo: ${log.at(-1).label}`) : null),

    h('section', { class: 'stack', 'aria-label': 'Primary Mission' },
      h('h3', null, h('button', { type: 'button', class: 'btn link', onclick: () => cardText(primary) }, `Primary: ${primary.name}`)),
      h('div', { class: 'muted small' }, `${g.mission.fd} vs ${g.mission.opp}`),
      lineButtons('primary', primary, null)),

    h('section', { class: 'stack', 'aria-label': 'Secondary Missions' },
      h('h3', null, `${tactical ? 'Tactical' : 'Fixed'} Secondary Missions`),
      tactical ? field(myCommand ? 'Draw 2 from your deck, then add them here' : 'Add a card you drew',
        h('select', { 'data-k': 'sc-add', onchange: (e) => { const id = e.target.value; if (id) editGame((x) => { x.secondary = addCard(x.secondary, id); }); } },
          h('option', { value: '' }, 'Pick the card…'),
          missions.secondaries.filter((c) => !sec.active.includes(c.id))
            .map((c) => h('option', { value: c.id }, `${c.name}${sec.done.includes(c.id) ? ' (discarded)' : ''}`)))) : null,
      sec.active.length ? sec.active.map(secCard) : h('p', { class: 'muted small' }, tactical ? 'No cards entered yet.' : 'No active Secondary Missions.'),
      tactical && sec.done.length ? h('p', { class: 'muted small' }, `Discarded: ${sec.done.map((id) => card(id).name).join(', ')}`) : null),

    h('button', { type: 'button', class: 'btn', 'data-k': 'sc-change', onclick: () => {
      if (confirm('Change the mission? Your Secondary cards are reset; VP scored so far is kept.')) editGame((x) => { x.mission = null; x.secondary = null; });
    } }, 'Change mission'),
  ];
}
