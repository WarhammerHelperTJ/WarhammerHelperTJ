import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { effectsForUnit } from '../js/engine/collect.js';
import { computeAttack } from '../js/engine/attack.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const datasheets = json('data/orks/datasheets.json');
const { armyRules, detachments } = json('data/orks/detachments.json');
const effects = json('data/orks/effects.json');
const faction = { id: 'orks', datasheets, armyRules, detachments, effects };
const sheet = (id) => datasheets.find((d) => d.id === id);
const weapon = (id, name) => sheet(id).weapons.find((w) => w.name === name);
const T4 = { T: 4, Sv: 3, W: 1, models: 5, keywords: ['INFANTRY'] };

test('every effect source resolves to an existing id', () => {
  const ids = {
    detachment: detachments.map((d) => d.id),
    stratagem: [...json('data/core/stratagems.json'), ...detachments.flatMap((d) => d.stratagems)].map((s) => s.id),
    enhancement: detachments.flatMap((d) => d.enhancements.map((e) => e.id)),
    armyrule: armyRules.map((r) => r.id),
  };
  for (const e of effects) {
    const [kind, id, sub] = e.source.split(':');
    if (kind === 'ability') assert.ok(sheet(id)?.abilities.some((a) => a.id === sub), e.source);
    else assert.ok(ids[kind]?.includes(id), e.source);
    assert.ok(e.label && e.mods, e.source);
  }
});

test('riled-up Meganobz in the fight phase (War Horde, Warboss attached): Power Klaw hits on 2+ with Sustained Hits 1', () => {
  const fx = effectsForUnit(faction, { datasheetIds: ['meganobz', 'warboss-in-mega-armour'], detachmentIds: ['war-horde'] });
  const { cards: [card] } = computeAttack({ type: 'melee', groups: [{ weapon: weapon('meganobz', 'Power Klaw'), models: 2, modelName: 'Meganob' }],
    target: T4, ctx: { phase: 'fight', riledUp: true }, effects: fx });
  assert.equal(card.hit.need, 2);
  assert.ok(card.hit.chips.some((c) => c.text === "+1 hit" && c.source === "Krumpin' Time (Meganobz)"));
  assert.equal(card.hit.sustained, 1);
  assert.ok(card.hit.chips.some((c) => c.source === 'Get Stuck In (War Horde)' && /Sustained Hits 1/.test(c.text)));
  // not riled up: back to 3+
  const calm = computeAttack({ type: 'melee', groups: [{ weapon: weapon('meganobz', 'Power Klaw'), models: 2, modelName: 'Meganob' }],
    target: T4, ctx: { phase: 'fight' }, effects: fx });
  assert.equal(calm.cards[0].hit.need, 3);
});

test('Boyz that charged get Lethal Hits in melee, not otherwise', () => {
  const fx = effectsForUnit(faction, { datasheetIds: ['boyz', 'mek'], detachmentIds: ['war-horde'] });
  const fight = (charged) => computeAttack({ type: 'melee', groups: [{ weapon: weapon('boyz', 'Choppa'), models: 9, modelName: 'Boy' }],
    target: T4, ctx: { phase: 'fight', charged }, effects: fx }).cards[0];
  assert.equal(fight(true).hit.lethal, true);
  assert.equal(fight(false).hit.lethal, false);
});

test('effectsForUnit picks only the unit, its detachments, enhancements and granted abilities', () => {
  const src = (opts) => effectsForUnit(faction, opts).map((e) => e.source).sort();
  assert.deepEqual(src({ datasheetIds: ['gretchin'] }), ['armyrule:waaagh']);
  assert.deepEqual(src({ datasheetIds: ['deff-dread'], detachmentIds: ['war-horde'], enhancementIds: [] }),
    ['armyrule:waaagh', 'detachment:war-horde', 'stratagem:close-range-dakka', 'stratagem:hit-em-harder', 'stratagem:mow-em-down']);
  assert.ok(src({ datasheetIds: ['boyz'], enhancementIds: ['headwoppas-killchoppa'] }).includes('enhancement:headwoppas-killchoppa'));
  assert.ok(src({ datasheetIds: ['deff-dread'], armyDatasheetIds: ['deff-dread', 'mek'] }).includes('ability:mek:clever-know-wotz'));
  assert.ok(!src({ datasheetIds: ['deff-dread'] }).includes('ability:mek:clever-know-wotz'));
});

test('manual stratagem effects apply only when enabled', () => {
  const fx = effectsForUnit(faction, { datasheetIds: ['boyz'], detachmentIds: ['war-horde'] });
  const shoot = (enabled) => computeAttack({ type: 'ranged', groups: [{ weapon: weapon('boyz', 'Slugga'), models: 1, modelName: 'Boy' }],
    target: { ...T4, halfRange: true }, ctx: { phase: 'shooting', enabled }, effects: fx }).cards[0];
  assert.equal(shoot([]).attacks.total, 1);
  assert.equal(shoot(['stratagem:close-range-dakka']).attacks.total, 2);   // Rapid Fire 1 added
});

test('loadFaction: missing effects.json -> []', async () => {
  globalThis.fetch = async (path) => (path.endsWith('effects.json') ? { ok: false, status: 404 }
    : { ok: true, json: async () => json(path) });
  const { loadFaction } = await import('../js/data.js');
  assert.deepEqual((await loadFaction('orks')).effects, []);
  delete globalThis.fetch;
});

test('Spiteful Power Trip: Killa Kans +1 to hit vs T6 or less, shooting and fighting; not vs T7', () => {
  const fx = effectsForUnit(faction, { datasheetIds: ['killa-kans'], detachmentIds: [] });
  const hit = (type, name, T) => computeAttack({ type, groups: [{ weapon: weapon('killa-kans', name), models: 3, modelName: 'Killa Kan' }],
    target: { ...T4, T }, ctx: { phase: type === 'ranged' ? 'shooting' : 'fight' }, effects: fx }).cards[0].hit;
  const blasta = weapon('killa-kans', 'Kan Blasta').skill, klaw = weapon('killa-kans', 'Kan Klaw').skill;
  assert.equal(hit('ranged', 'Kan Blasta', 6).need, blasta - 1);
  assert.equal(hit('melee', 'Kan Klaw', 4).need, klaw - 1);
  assert.equal(hit('melee', 'Kan Klaw', 7).need, klaw);
  assert.ok(hit('melee', 'Kan Klaw', 6).chips.some((c) => c.source.startsWith('Spiteful Power Trip')));
});
