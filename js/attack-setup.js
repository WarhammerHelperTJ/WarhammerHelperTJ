// Attack view weapon selection (source 2.3 + A1): stored model groups -> selectable choices -> computeAttack groups. Pure.
import { enhancementById } from './data.js';

const has = (w, name) => (w.abilities ?? []).some((a) => String(a.name).toUpperCase() === name);
const isCq = (w) => has(w, 'CLOSE-QUARTERS') || has(w, 'PISTOL');

// Every member's stored groups; an enhancement's weapons join its bearer's first group.
function modelGroups(cu, faction) {
  return cu.members.flatMap((m) => {
    const ds = faction.datasheets.find((d) => d.id === m.datasheetId);
    if (!ds) return [];
    const extra = (m.enhancement && enhancementById(faction, m.enhancement)?.weapons) || [];
    const pool = [...ds.weapons, ...extra];
    return (m.groups ?? []).map((g, gi) => ({
      key: `${m.uid}:${gi}`, ds, model: g.model, count: g.count, pool,
      names: [...g.weapons, ...(gi === 0 ? [...new Set(extra.map((w) => w.name))] : [])],
    }));
  });
}

// Counts follow the models remaining only when exactly one group can have lost them; otherwise the user sets them.
// shortcut: losses are assumed to come from the only multi-model group, upgrade if characters' deaths need tracking.
function attackingCounts(groups, remaining) {
  const counts = groups.map((g) => g.count);
  const total = counts.reduce((s, n) => s + n, 0);
  if (remaining == null || remaining >= total) return { counts, stepper: false };
  const lost = total - remaining, multi = groups.filter((g) => g.count > 1);
  if (multi.length === 1 && lost < multi[0].count) return { counts: groups.map((g) => (g === multi[0] ? g.count - lost : g.count)), stepper: false };
  return { counts, stepper: true };
}

/**
 * type: "ranged" | "melee". selection: {[groupKey]: {melee, off:[name], cq, profiles:{[name]: profile}, models}} (all optional).
 * remaining: models left in the unit (game state), optional.
 * -> [{key, unitName, modelName, count, models, stepper, meleeOptions, melee, cqSwitch, cq, cqNames, otherNames,
 *      weapons:[{name, n, profiles, profile, weapon, selected, fixed}]}]
 */
export function weaponChoices(cu, faction, type, selection = {}, remaining) {
  const groups = modelGroups(cu, faction);
  const { counts, stepper } = attackingCounts(groups, remaining);
  return groups.map((g, i) => {
    const sel = selection[g.key] ?? {};
    const tally = new Map();
    for (const n of g.names) tally.set(n, (tally.get(n) ?? 0) + 1);   // a name listed twice = two of that weapon
    const items = [...tally].map(([name, n]) => {
      const profiles = g.pool.filter((w) => w.name === name && w.type === type);
      if (!profiles.length) return null;
      const weapon = profiles.find((w) => w.profile === sel.profiles?.[name]) ?? profiles[0];
      return { name, n, profiles: profiles.length > 1 ? profiles.map((w) => w.profile) : [], profile: weapon.profile, weapon, selected: true, fixed: false };
    }).filter(Boolean);
    const out = { key: g.key, unitName: g.ds.name, modelName: g.model, count: g.count,
      // default: models still alive; the user can lower it for models not eligible to shoot/fight
      models: Math.max(0, Math.min(g.count, sel.models ?? counts[i])), stepper,
      meleeOptions: [], melee: null, cqSwitch: false, cq: false, cqNames: [], otherNames: [], weapons: [] };
    if (type === 'melee') {
      // one melee weapon per model plus all its [EXTRA ATTACKS] weapons
      const extra = items.filter((w) => has(w.weapon, 'EXTRA ATTACKS')).map((w) => ({ ...w, fixed: true }));
      const opts = items.filter((w) => !has(w.weapon, 'EXTRA ATTACKS'));
      const pick = opts.find((w) => w.name === sel.melee) ?? opts[0];
      out.meleeOptions = opts.map((w) => w.name);
      out.melee = pick?.name ?? null;
      out.weapons = [...(pick ? [pick] : []), ...extra];
    } else {
      // [CLOSE-QUARTERS]/[PISTOL]: non-MONSTER/VEHICLE models fire either those or their other ranged weapons.
      // shortcut: kind follows the picked profile, so a profile change can move a weapon to the other side.
      const kw = g.ds.keywords.map((k) => String(k).toUpperCase());
      const cqW = items.filter((w) => isCq(w.weapon)), other = items.filter((w) => !isCq(w.weapon));
      out.cqSwitch = !kw.includes('MONSTER') && !kw.includes('VEHICLE') && cqW.length > 0 && other.length > 0;
      out.cq = out.cqSwitch && !!sel.cq;
      out.cqNames = cqW.map((w) => w.name);
      out.otherNames = other.map((w) => w.name);
      const firing = !out.cqSwitch ? items : out.cq ? cqW : other;
      out.weapons = firing.map((w) => ({ ...w, selected: !(sel.off ?? []).includes(w.name) }));
    }
    return out;
  });
}

/** choices from weaponChoices -> computeAttack groups [{weapon, models, modelName}]. */
export const buildGroups = (choices) => choices.flatMap((g) => (g.models > 0 ? g.weapons : [])
  .filter((w) => w.selected).map((w) => ({ weapon: w.weapon, models: g.models * w.n, modelName: g.modelName })));

/** Enhancement effects with scope "model" and no `model`: the bearer is the member carrying that enhancement. */
export function effectsWithBearers(effects, cu) {
  return effects.map((e) => {
    const [kind, id] = String(e.source ?? '').split(':');
    if (e.scope !== 'model' || e.model || kind !== 'enhancement') return e;
    const bearer = cu.members.find((m) => m.enhancement === id);
    const model = bearer?.groups?.[0]?.model;
    // no weapon chosen yet: '' matches no weapon, so the effect stays off
    const weapon = e.chosenWeapon ? { weapon: bearer?.enhancementWeapon ?? '' } : {};
    return model ? { ...e, model, ...weapon } : e;
  });
}
