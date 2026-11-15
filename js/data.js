// Loads the generated JSON (relative to the page) and caches it in memory. Faction-agnostic.
const cache = new Map();

function getJSON(path) {
  if (!cache.has(path)) {
    const p = fetch(path).then(r => {
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
      return r.json();
    });
    p.catch(() => cache.delete(path)); // let a later call retry
    cache.set(path, p);
  }
  return cache.get(path);
}

/** -> { stratagems:[S], abilities:[{name,text}] } */
export async function loadCore() {
  const [stratagems, abilities] = await Promise.all([
    getJSON('data/core/stratagems.json'),
    getJSON('data/core/abilities.json'),
  ]);
  return { stratagems, abilities };
}

/** -> { id, datasheets:[…], armyRules:[…], detachments:[…], effects:[…], game:{armyToggle?,stateLabels?} } (no effects.json -> [], no game.json -> {}) */
export async function loadFaction(id) {
  const [datasheets, { armyRules, detachments }, effects, game] = await Promise.all([
    getJSON(`data/${id}/datasheets.json`),
    getJSON(`data/${id}/detachments.json`),
    getJSON(`data/${id}/effects.json`).catch(() => []),
    getJSON(`data/${id}/game.json`).catch(() => ({})),
  ]);
  return { id, datasheets, armyRules, detachments, effects, game };
}

/** -> { forceDispositions, primaries, secondaries } (data/core/missions.json, docs/source/missions-11e.md). */
export const loadMissions = () => getJSON('data/core/missions.json');
/** -> [{ id, name }] factions that have data (data/factions.json). */
export const loadFactions = () => getJSON('data/factions.json');
/** -> example roster template of a faction (data/<id>/example-roster.json); rejects if none. */
export const loadExampleRoster = id => getJSON(`data/${id}/example-roster.json`);

export const datasheetById = (faction, id) => faction.datasheets.find(d => d.id === id) ?? null;
export const detachmentById = (faction, id) => faction.detachments.find(d => d.id === id) ?? null;
export const armyRuleById = (faction, id) => faction.armyRules.find(r => r.id === id) ?? null;
export const enhancementById = (faction, id) =>
  faction.detachments.flatMap(d => d.enhancements).find(e => e.id === id) ?? null;
/** Core stratagems first, then every detachment of the faction (faction may be omitted). */
export const stratagemById = (core, faction, id) =>
  [...core.stratagems, ...(faction?.detachments.flatMap(d => d.stratagems) ?? [])].find(s => s.id === id) ?? null;
/** Weapon/core ability rules text by parser name, e.g. "LETHAL HITS" or "ANTI". */
export const abilityByName = (core, name) => core.abilities.find(a => a.name === String(name).toUpperCase()) ?? null;
