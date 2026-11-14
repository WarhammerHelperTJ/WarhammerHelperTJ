// Which stratagems are usable right now, spending them, and per-phase ability reminders. Pure. Rules: source A4 + 2.4.

const up = (s) => String(s).toUpperCase();

// Upper-case keyword vocabulary: datasheet keywords + datasheet names (a datasheet's name is also a keyword, e.g. BOYZ).
function vocabulary(faction) {
  const v = new Set();
  for (const d of faction?.datasheets ?? []) { for (const k of d.keywords ?? []) v.add(up(k)); v.add(up(d.name)); }
  return [...v].filter((k) => k.includes(' ')).sort((a, b) => b.length - a.length);
}

// "ORKS SPEED FREEKS" -> ["ORKS", "SPEED FREEKS"]; "BEAST SNAGGA BOYZ/BOYZ" -> ["BEAST SNAGGA BOYZ", "/", "BOYZ"].
function tokens(run, multi) {
  const words = run.replace(/\//g, ' / ').split(/\s+/).filter(Boolean), out = [];
  for (let i = 0; i < words.length;) {
    const m = multi.find((k) => { const n = k.split(' ').length; return words.slice(i, i + n).join(' ') === k; });
    const t = m ?? words[i];
    out.push(t);
    i += t.split(' ').length;
  }
  return out;
}

// Token list -> [[alternatives]]: each inner list is "any of", all outer entries must hold.
function groups(toks) {
  const g = [];
  toks.forEach((t, i) => { if (t !== '/') (toks[i - 1] === '/' ? g[g.length - 1].push(t) : g.push([t])); });
  return g;
}

const KW = String.raw`[A-Z][A-Z0-9'’\-]*`; // ’ as in EMPEROR’S CHILDREN
const RUN = String.raw`(?<![A-Za-z])${KW}(?:(?:\s+|\/)${KW})*`;
const PHRASE = new RegExp(String.raw`(friendly\s+(?:[a-z]+\s+)*)?(${RUN})\s+(?:units?|models?)\b(?:\s*\((?:excluding|not)\s+(${RUN})(?:\s+(?:units?|models?))?\))?`, 'g');

// Keyword constraints of one text: [{all:[[alt]], not:[kw]}]. onlyFriendly: WHEN text also names enemy units.
function phrases(text, multi, onlyFriendly) {
  const out = [];
  for (const m of String(text ?? '').matchAll(PHRASE)) {
    if (onlyFriendly && !m[1]) continue;
    out.push({ all: groups(tokens(m[2], multi)), not: m[3] ? tokens(m[3], multi).filter((t) => t !== '/') : [] });
  }
  return out;
}

const matches = (kw, p) => p.all.every((alt) => alt.some((k) => kw.includes(k))) && !p.not.some((k) => kw.includes(k));

/**
 * The first keyword phrase of TARGET; plus the first friendly phrase of WHEN when TARGET has none or refers back
 * to it ("That ORKS VEHICLE unit." after "friendly ORKS VEHICLE unit (excluding WALKER units)"). None -> any unit.
 */
export function stratagemTargets(s, faction) {
  const multi = vocabulary(faction);
  const [t] = phrases(s.target, multi, false), [w] = phrases(s.when, multi, true);
  return [t, (!t || /^\s*that\b/i.test(s.target ?? '')) && w].filter(Boolean);
}

/**
 * units: [{uid, name, keywords:[UPPER, incl. datasheet names], state:{shocked,…}}]; game: {cp, used, unitStrat}.
 * -> [{stratagem, eligibleUnits:[uid], usedThisPhase, affordable, usable}]
 */
export function availableStratagems({ phase, turn, phaseKey, detachmentIds = [], units = [], game = {}, core = {}, faction = {} }) {
  const strats = [
    ...(core.stratagems ?? []),
    ...(faction.detachments ?? []).filter((d) => detachmentIds.includes(d.id)).flatMap((d) => d.stratagems),
  ];
  const whose = turn === 'me' ? 'your' : 'opponent';
  return strats
    .filter((s) => (s.turn === 'either' || s.turn === whose) && (s.phases.includes('any') || s.phases.includes(phase)))
    .map((s) => {
      const cons = stratagemTargets(s, faction);
      const shockOk = /can target[^.]*battle-shocked/i.test(`${s.target ?? ''} ${s.text ?? ''}`);
      const eligibleUnits = units
        .filter((u) => (shockOk || !u.state?.shocked) && (phaseKey == null || game.unitStrat?.[u.uid] !== phaseKey))
        .filter((u) => { const kw = (u.keywords ?? []).map(up); return cons.every((p) => matches(kw, p)); })
        .map((u) => u.uid);
      const usedThisPhase = phaseKey != null && game.used?.[s.id] === phaseKey;
      const affordable = (game.cp ?? 0) >= s.cp;
      return { stratagem: s, eligibleUnits, usedThisPhase, affordable, usable: !usedThisPhase && affordable && eligibleUnits.length > 0 };
    });
}

/** -> new game with CP spent and usage recorded, or null if already used this phase, unaffordable, or the unit already took one. */
export function useStratagem(game, stratagem, uid, phaseKey) {
  if (game.used?.[stratagem.id] === phaseKey || (game.cp ?? 0) < stratagem.cp) return null;
  if (uid != null && game.unitStrat?.[uid] === phaseKey) return null;
  return {
    ...game,
    cp: game.cp - stratagem.cp,
    used: { ...game.used, [stratagem.id]: phaseKey },
    unitStrat: uid == null ? { ...game.unitStrat } : { ...game.unitStrat, [uid]: phaseKey },
  };
}

/** Reverse useStratagem in the same phase: refund CP, clear the usage (and the unit's, if uid given). null if not used this phase. */
export function undoStratagem(game, stratagem, uid, phaseKey) {
  if (game.used?.[stratagem.id] !== phaseKey) return null;
  const used = { ...game.used }, unitStrat = { ...game.unitStrat };
  delete used[stratagem.id];
  if (uid != null && unitStrat[uid] === phaseKey) delete unitStrat[uid];
  return { ...game, cp: game.cp + stratagem.cp, used, unitStrat };
}

const PHASE_WORD ={ command: 'Command', movement: 'Movement', shooting: 'Shooting', charge: 'Charge', fight: 'Fight' };

// Does the text name this phase for this turn? "your X phase" = my turn, "opponent's X phase" = theirs, "the X phase" = either.
function namesPhase(text, phase, turn) {
  const re = new RegExp(String.raw`((?:\S+\s+){0,2})${PHASE_WORD[phase]} phase`, 'g');   // two words: "your next X phase"
  return [...String(text).matchAll(re)].some((m) => {
    const w = m[1].toLowerCase();
    if (/opponent['’]?s\b/.test(w)) return turn === 'opp';
    if (/\byour\b/.test(w)) return turn === 'me';
    return true;
  });
}

// shortcut: "always on" = the text names no phase at all; upgrade to a hand-written flag in data if that misfiles abilities.
const ANY_PHASE = new RegExp(`(${Object.values(PHASE_WORD).join('|')}) phase`);
// faction.game.abilityPhases[name] (hand-written, either turn) beats the text check; [] hides the ability from the list.
const when = (name, text, phase, turn, fixed) => (fixed?.[name] ? (fixed[name].includes(phase) ? { always: false } : null)
  : !ANY_PHASE.test(text) ? { always: true } : namesPhase(text, phase, turn) ? { always: false } : null);

/**
 * units: [{uid, name, datasheetIds:[…]}]. -> [{uid, unitName, abilityName, text, always}] for datasheet abilities naming the
 * current phase (always:false) or no phase at all (always:true), plus army rules once each (uid/unitName null).
 */
export function phaseReminders({ phase, turn, units = [], faction = {} }) {
  const out = [], rules = new Set(), fixed = faction.game?.abilityPhases;
  for (const u of units) {
    for (const id of u.datasheetIds ?? []) {
      const d = faction.datasheets?.find((x) => x.id === id);
      if (!d) continue;
      for (const a of d.abilities ?? []) {
        const w = when(a.name, a.text, phase, turn, fixed);
        if (w) out.push({ uid: u.uid, unitName: u.name, abilityName: a.name, text: a.text, ...w });
      }
      for (const n of d.armyRules ?? []) rules.add(n);
    }
    for (const id of u.enhancementIds ?? []) {   // enhancements read like abilities of the unit
      const e = (faction.detachments ?? []).flatMap((x) => x.enhancements).find((x) => x.id === id);
      const w = e && when(e.name, e.text, phase, turn, fixed);
      if (w) out.push({ uid: u.uid, unitName: u.name, abilityName: e.name, text: e.text, ...w });
    }
  }
  for (const r of faction.armyRules ?? []) {
    const w = rules.has(r.name) && when(r.name, r.text, phase, turn, fixed);
    if (w) out.push({ uid: null, unitName: null, abilityName: r.name, text: r.text, ...w });
  }
  return out;
}
