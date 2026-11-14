// Pure game-tracking helpers (no DOM, storage or fetch). Faction-agnostic: faction data is passed in.

export const PHASES = ['command', 'movement', 'shooting', 'charge', 'fight'];

const up = (s) => String(s).toUpperCase();
const other = (t) => (t === 'me' ? 'opp' : 'me');

/**
 * Units as they fight: each bodyguard merged with its attached characters, unattached units alone.
 * -> [{uid, name, datasheetIds, members:[rosterUnit], keywords:[UPPER incl. datasheet names], enhancementIds, armyRules:[name]}]
 */
export function combatUnits(roster, faction) {
  const ds = (u) => faction.datasheets.find((d) => d.id === u.datasheetId);
  const has = (id) => roster.units.some((b) => b.uid === id);
  return roster.units.filter((u) => !u.attachedTo || !has(u.attachedTo)).map((b) => {
    const members = [b, ...roster.units.filter((c) => c !== b && c.attachedTo === b.uid)];
    const sheets = members.map(ds).filter(Boolean);
    return {
      uid: b.uid,
      name: sheets.map((d) => d.name).join(' + '),
      datasheetIds: members.map((m) => m.datasheetId),
      members,
      keywords: [...new Set(sheets.flatMap((d) => [...d.keywords.map(up), up(d.name)]))],
      enhancementIds: members.map((m) => m.enhancement).filter(Boolean),
      armyRules: [...new Set(sheets.flatMap((d) => d.armyRules ?? []))],
    };
  });
}

/** Fresh per-unit state: models = unit size (bodyguard + characters); wounds = W of the model when the unit is one model, else null. */
export function unitStart(cu, faction) {
  const models = cu.members.reduce((s, m) => s + (m.size ?? 1), 0);
  const d = faction.datasheets.find((x) => x.id === cu.members[0].datasheetId);
  return { riled: false, charged: false, advanced: false, stationary: false, shocked: false,
    models, wounds: models === 1 ? (d?.models.at(-1)?.W ?? null) : null };
}

/** SPEC game shape plus `first` ("me"|"opp": who has the first turn of each round). */
/** Always-on army rules that only count while the Warlord has them (faction game.json "warlordRules"). */
export function warlordRules(roster, faction) {
  const w = roster.units.find((u) => u.warlord);
  const wd = w && faction.datasheets.find((d) => d.id === w.datasheetId);
  return (faction.game?.warlordRules ?? []).map((c) => {
    const rule = faction.armyRules.find((r) => r.id === c.armyRuleId);
    return rule && { rule, cpPerRound: c.cpPerRound ?? 0, warlordName: wd?.name ?? null, on: !!wd?.armyRules.includes(rule.name) };
  }).filter(Boolean);
}

export function newGame(roster, faction, first = 'me') {
  const units = {};
  for (const cu of combatUnits(roster, faction)) units[cu.uid] = unitStart(cu, faction);
  const roundCp = warlordRules(roster, faction).reduce((n, r) => n + (r.on ? r.cpPerRound : 0), 0);   // gained at the start of each battle round
  return { rosterId: roster.id, first, round: 1, turn: first, phase: 'command', roundCp, cp: 1 + roundCp,   // 1 = the first Command phase's CP
    waaagh: { used: false, activeUntil: null, uids: [] }, units, used: {}, unitStrat: {}, once: {} };
}

export const phaseKey = (g) => `${g.round}-${g.turn}-${g.phase}`;

// 0, 1, 2… over the whole battle: round 1 first player, round 1 second player, round 2 first player…
const turnIndex = (g, { round, turn }) => (round - 1) * 2 + (turn === g.first ? 0 : 1);

/** Next phase; after Fight the other player's turn starts (and a new round once both have played). New game object. */
export function nextPhase(game) {
  const g = structuredClone(game);
  const i = PHASES.indexOf(g.phase);
  if (i < PHASES.length - 1) { g.phase = PHASES[i + 1]; return g; }
  const ended = turnIndex(g, g);
  const until = g.waaagh?.activeUntil;
  if (until && turnIndex(g, until) <= ended) {
    for (const id of g.waaagh.uids ?? []) if (g.units[id]) g.units[id].riled = false;
    g.waaagh = { ...g.waaagh, activeUntil: null, uids: [] };
  }
  g.turn = other(g.turn);
  if (g.turn === g.first) { g.round++; g.cp += g.roundCp ?? 0; }
  g.phase = PHASES[0];
  g.cp++;   // 1 CP at the start of every Command phase, mine and the opponent's (user-confirmed; not in the captured rules)
  for (const s of Object.values(g.units)) { s.charged = false; s.advanced = false; s.stationary = false; }
  return g;
}

/**
 * Once-per-battle army-wide toggle: riles every unit whose datasheets list `ruleName` until the end of the next turn.
 * units: combatUnits(). -> new game, or null if already used.
 */
export function callArmyRule(game, units, ruleName) {
  if (game.waaagh?.used) return null;
  const g = structuredClone(game);
  const uids = units.filter((u) => u.armyRules.includes(ruleName)).map((u) => u.uid);
  for (const id of uids) if (g.units[id]) g.units[id].riled = true;
  const until = g.turn === g.first ? { round: g.round, turn: other(g.turn) } : { round: g.round + 1, turn: g.first };
  g.waaagh = { used: true, activeUntil: until, uids };
  return g;
}
