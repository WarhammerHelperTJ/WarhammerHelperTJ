// Mission scoring (data/core/missions.json): Primary from Force Dispositions, Secondary decks, scoring windows, VP caps.
// Pure: no DOM or storage; randomness comes in as `rng`. Rules: docs/source/missions-11e.md.

export const CAPS = { perRound: 15, kind: 45, fixedCard: 20, ready: 10 };

/** Your Primary Mission: the card for your Force Disposition against your opponent's. */
export const primaryFor = (missions, mine, opp) =>
  missions.primaries.find((p) => p.forceDisposition === mine && p.opponent === opp) ?? null;

/** Force Dispositions a roster can choose: those of its detachments, or all of them when it has none. */
export function dispositionsFor(missions, faction, detachmentIds = []) {
  const fds = [...new Set(faction.detachments.filter((d) => detachmentIds.includes(d.id)).flatMap((d) => d.forceDispositions ?? []))];
  return fds.length ? fds : missions.forceDispositions;
}

// The game's phase stands in for the moment a line scores: "end of your Command phase" during your Command phase,
// "end of a turn" during that turn's Fight phase (the last phase).
const TIMING_NOW = {
  yourCommand: (g) => g.turn === 'me' && g.phase === 'command',
  yourTurnEnd: (g) => g.turn === 'me' && g.phase === 'fight',
  oppTurnEnd: (g) => g.turn === 'opp' && g.phase === 'fight',
  anyTurnEnd: (g) => g.phase === 'fight',
};
const lastTurn = (g) => g.round === 5 && g.phase === 'fight' && g.turn !== g.first;

/** Which line of a card is usable in this mode ("FIXED"/"TACTICAL" lines), and its VP. mode: 'fixed' | 'tactical' | null (Primary). */
export function lineVp(line, mode) {
  if (mode === 'fixed' && line.tactical != null && line.fixed == null) return null;
  if (mode === 'tactical' && line.fixed != null && line.tactical == null) return null;
  return (mode === 'fixed' ? line.fixed : mode === 'tactical' ? line.tactical : null) ?? line.vp;
}

/** Lines of a card that can score now: [{line, key, vp}]; key = "<block>:<line>". g: {round, turn, phase, first}. */
export function linesNow(card, g, mode = null) {
  const out = [];
  card.blocks.forEach((b, bi) => {
    const open = b.endOfBattle ? lastTurn(g) : g.round >= b.rounds[0] && g.round <= b.rounds[1];
    if (!open) return;
    b.lines.forEach((line, li) => {
      const timing = g.round === 5 && line.round5 ? line.round5 : line.timing;
      const vp = lineVp(line, mode);
      if (vp != null && (b.endOfBattle || TIMING_NOW[timing]?.(g))) out.push({ line, key: `${bi}:${li}`, vp });
    });
  });
  return out;
}

const sum = (log, f) => log.filter(f).reduce((s, e) => s + e.vp, 0);

// "OR" lines are alternatives to the line above them: they share that line's key.
const orGroup = (card, key) => {
  const [bi, li] = key.split(':').map(Number);
  let i = li;
  while (i > 0 && card.blocks[bi].lines[i].or) i--;
  return `${bi}:${i}`;
};

/**
 * Can this line still score this turn? A condition scores once per turn ("For each …" lines repeat, up to their caps),
 * and once one "OR" alternative scored, the others cannot.
 */
export function lineOpen(log, card, key, turn) {
  const line = card.blocks[+key.split(':')[0]].lines[+key.split(':')[1]];
  const group = orGroup(card, key);
  return !log.some((e) => e.card === card.id && e.turn === turn && e.line != null && orGroup(card, e.line) === group
    && (e.line !== key || !/^For each/i.test(line.text)));
}

/**
 * VP an entry can still add under the caps. entry: {kind:'primary'|'secondary'|'ready', round, card, line, turn, vp, upTo?, fixed?}.
 * Caps: 15 per battle round and 45 per kind; 20 per Fixed card; a line's "UP TO" per turn; Battle Ready 10.
 */
export function cappedVp(log, entry) {
  let room = entry.vp;
  if (entry.kind === 'ready') return Math.max(0, Math.min(room, CAPS.ready - sum(log, (e) => e.kind === 'ready')));
  room = Math.min(room, CAPS.perRound - sum(log, (e) => e.kind === entry.kind && e.round === entry.round),
    CAPS.kind - sum(log, (e) => e.kind === entry.kind));
  if (entry.fixed) room = Math.min(room, CAPS.fixedCard - sum(log, (e) => e.card === entry.card));
  if (entry.upTo != null) room = Math.min(room, entry.upTo - sum(log, (e) => e.card === entry.card && e.line === entry.line && e.turn === entry.turn));
  return Math.max(0, room);
}

export const totals = (log = []) => {
  const t = { primary: sum(log, (e) => e.kind === 'primary'), secondary: sum(log, (e) => e.kind === 'secondary'), ready: sum(log, (e) => e.kind === 'ready') };
  return { ...t, total: t.primary + t.secondary + t.ready };
};

// ---------- Secondary decks ----------

export function shuffle(ids, rng = Math.random) {
  const a = [...ids];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Fixed: the two picked cards stay active all battle. Tactical: the whole deck, shuffled. */
export const newSecondaries = (missions, mode, fixedIds = [], rng = Math.random) => (mode === 'fixed'
  ? { mode, active: [...fixedIds], deck: [], done: [], drawnAt: null, justDrawn: [], swapUsed: false }
  : { mode, active: [], deck: shuffle(missions.secondaries.map((s) => s.id), rng), done: [], drawnAt: null, justDrawn: [], swapUsed: false });

/** New state with up to n cards moved from the deck to the active cards. */
export function draw(sec, n, at) {
  const cards = sec.deck.slice(0, n);
  return { ...sec, deck: sec.deck.slice(n), active: [...sec.active, ...cards], drawnAt: at ?? sec.drawnAt, justDrawn: cards };
}
export const discard = (sec, id) => ({ ...sec, active: sec.active.filter((x) => x !== id), done: [...sec.done, id] });
/** "Shuffle this card back into your Secondary Mission deck". */
export function reshuffle(sec, id, rng = Math.random) {
  const deck = [...sec.deck], at = Math.floor(rng() * (deck.length + 1));
  deck.splice(at, 0, id);
  return { ...sec, active: sec.active.filter((x) => x !== id), deck };
}
