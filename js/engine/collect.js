// Candidate effects (data/<faction>/effects.json) for one attacking unit, ready for computeAttack({effects}). Pure.

/**
 * faction: loaded faction ({datasheets, armyRules, detachments, effects}).
 * datasheetIds: the unit's datasheets incl. attached characters. detachmentIds: the roster's. enhancementIds: the unit's.
 * armyDatasheetIds (optional): every datasheet in the army; effects marked `grant` (an ability of another unit
 * that buffs this one, e.g. "select one friendly VEHICLE model") come from these.
 */
export function effectsForUnit(faction, { datasheetIds = [], detachmentIds = [], enhancementIds = [], armyDatasheetIds = [] } = {}) {
  const own = new Set(datasheetIds), army = new Set(armyDatasheetIds);
  const sheets = faction.datasheets.filter((d) => own.has(d.id));
  const ruleNames = new Set(sheets.flatMap((d) => d.armyRules ?? []));
  const armyRuleIds = new Set(faction.armyRules.filter((r) => ruleNames.has(r.name)).map((r) => r.id));
  const dets = faction.detachments.filter((d) => detachmentIds.includes(d.id));
  const stratIds = new Set(dets.flatMap((d) => d.stratagems.map((s) => s.id)));
  return (faction.effects ?? []).filter(({ source = '', grant }) => {
    const [kind, id, sub] = source.split(':');
    switch (kind) {
      case 'ability': return sub != null && (grant ? army.has(id) : own.has(id));
      case 'armyrule': return armyRuleIds.has(id);
      case 'detachment': return detachmentIds.includes(id);
      case 'stratagem': return stratIds.has(id);
      case 'enhancement': return enhancementIds.includes(id);
      default: return false;
    }
  });
}
