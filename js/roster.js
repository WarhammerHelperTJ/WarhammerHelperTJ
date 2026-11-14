// Pure army-building helpers (no DOM, storage or fetch). Faction data is passed in.

export const MODES = {
  incursion: { label: 'Incursion', limit: 1000, dp: 2 },
  strike: { label: 'Strike Force', limit: 2000, dp: 3 },
  custom: { label: 'Custom', limit: null, dp: Infinity },
};

const byId = (list, id) => list.find(x => x.id === id) ?? null;
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** 1-based position of this unit among same-datasheet units, in roster order. */
export const copyNumber = (roster, unit) =>
  roster.units.filter(u => u.datasheetId === unit.datasheetId).indexOf(unit) + 1;

/** Points tier for the nth copy: the one with the highest fromCopy <= n. */
export function tierFor(datasheet, n) {
  return datasheet.points.filter(t => t.fromCopy <= n).sort((a, b) => b.fromCopy - a.fromCopy)[0] ?? datasheet.points[0];
}

/** Points of one unit (without enhancement); ptsOverride wins. */
export function unitPoints(roster, unit, datasheets) {
  if (typeof unit.ptsOverride === 'number') return unit.ptsOverride;
  const ds = byId(datasheets, unit.datasheetId);
  if (!ds?.points.length) return 0;
  const sizes = tierFor(ds, copyNumber(roster, unit)).sizes;
  return (sizes.find(s => s.models === unit.size) ?? sizes[0])?.pts ?? 0;
}

const enhancements = faction => faction.detachments.flatMap(d => d.enhancements);

/** faction: { datasheets, detachments } */
export function rosterTotal(roster, faction) {
  return roster.units.reduce((sum, u) =>
    sum + unitPoints(roster, u, faction.datasheets) + (byId(enhancements(faction), u.enhancement)?.pts ?? 0), 0);
}

export const dpUsed = (roster, detachments) =>
  roster.detachments.reduce((s, id) => s + (byId(detachments, id)?.dp ?? 0), 0);
export const dpAllowed = mode => MODES[mode]?.dp ?? Infinity;
/** DP fits the budget; a lone 3 DP detachment is also fine in a 2 DP game. */
export function dpOk(roster, detachments) {
  const used = dpUsed(roster, detachments), allowed = dpAllowed(roster.mode);
  return used <= allowed || (allowed === 2 && roster.detachments.length === 1 && used === 3);
}

/** Every loadout row gets its min, then the remainder fills rows up to max, last row first. */
export function defaultGroups(datasheet, size) {
  const groups = datasheet.defaultLoadout.map(r => ({ model: r.model, count: r.min, weapons: [...r.weapons] }));
  let rest = size - groups.reduce((s, g) => s + g.count, 0);
  for (let i = groups.length - 1; i >= 0 && rest > 0; i--) {
    const add = Math.min(rest, datasheet.defaultLoadout[i].max - groups[i].count);
    groups[i].count += add;
    rest -= add;
  }
  return groups.filter(g => g.count > 0);
}

const upper = s => String(s).toUpperCase();
/** Keywords plus the upper-cased datasheet name. */
const tags = ds => new Set([...ds.keywords.map(upper), upper(ds.name)]);

/** "leader" | "support" | null */
export function canAttach(character, bodyguard) {
  if (!character.keywords.includes('CHARACTER')) return null;
  const t = tags(bodyguard);
  if (character.leads.some(x => t.has(upper(x)))) return 'leader';
  if (character.supports.some(x => t.has(upper(x)))) return 'support';
  return null;
}

// A phrase ("ORKS INFANTRY") matches when every word is a keyword word or a word of the name.
function phraseMatches(phrase, ds) {
  const words = new Set([...ds.keywords, ds.name].flatMap(s => upper(s).split(/\s+/)));
  return upper(phrase).trim().split(/\s+/).every(w => words.has(w));
}

/** Heuristic restriction check: false only when the datasheet clearly does not qualify. */
export function enhancementAllowed(enh, ds) {
  const isChar = ds.keywords.includes('CHARACTER');
  const r = enh.restriction ?? '';
  if (!enh.upgrade && !isChar) return false;
  // some upgrades are "… model only" on a character (e.g. a weapon swap): only "unit only" ones exclude characters
  if (enh.upgrade && isChar && /unit only/i.test(r)) return false;
  // last sentence: "X/Y model only" or "X unit only", optionally "(excluding Z models)"
  const m = r.split('. ').pop().match(/^(.+?) (?:model|unit)s? only(?: \(excluding (.+?) (?:model|unit)s?\))?$/i);
  if (!m) return true; // shortcut: unknown restriction wording is allowed; UI shows the text
  if (!m[1].split(/\/| or /).some(p => phraseMatches(p, ds))) return false; // "X/Y" or "X or Y"
  if (m[2] && m[2].split('/').some(p => phraseMatches(p, ds))) return false;
  return true;
}

export function newUnit(datasheet) {
  const size = datasheet.points[0]?.sizes[0]?.models ?? datasheet.defaultLoadout.reduce((s, r) => s + r.min, 0);
  return { uid: uid(), datasheetId: datasheet.id, size, ptsOverride: null,
    groups: defaultGroups(datasheet, size), enhancement: null, attachedTo: null, warlord: false };
}

/** Example template: { name, mode, limit, detachments, units:[{datasheetId,size,warlord,attachedTo:index}] } */
export function rosterFromTemplate(tpl, faction, id = uid()) {
  const units = tpl.units.map(t => {
    const ds = byId(faction.datasheets, t.datasheetId);
    if (!ds) throw new Error(`unknown datasheet ${t.datasheetId}`);
    const u = newUnit(ds);
    if (t.size) { u.size = t.size; u.groups = defaultGroups(ds, t.size); }
    u.warlord = !!t.warlord;
    u.enhancement = t.enhancement ?? null;
    return u;
  });
  tpl.units.forEach((t, i) => { if (t.attachedTo != null) units[i].attachedTo = units[t.attachedTo].uid; });
  return { id, name: tpl.name, faction: faction.id, mode: tpl.mode, limit: tpl.limit,
    detachments: [...tpl.detachments], units };
}
