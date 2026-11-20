import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableStratagems } from '../js/engine/stratagems.js';
import { effectsForUnit } from '../js/engine/collect.js';
import { computeAttack } from '../js/engine/attack.js';
import { enhancementAllowed, canAttach } from '../js/roster.js';
import { strength } from '../js/game.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const datasheets = json('data/adepta-sororitas/datasheets.json');
const { armyRules, detachments } = json('data/adepta-sororitas/detachments.json');
const effects = json('data/adepta-sororitas/effects.json');
const faction = { id: 'adepta-sororitas', datasheets, armyRules, detachments, effects };
const core = { stratagems: json('data/core/stratagems.json') };
const sheet = (id) => datasheets.find((d) => d.id === id);
const unit = (uid, id) => ({ uid, name: sheet(id).name, datasheetIds: [id], state: {}, keywords: [...sheet(id).keywords, sheet(id).name.toUpperCase()] });

test('every datasheet and detachment made it into the JSON, with loadouts, points and Force Dispositions', () => {
  assert.equal(datasheets.length, 38);
  assert.equal(detachments.length, 8);
  for (const d of datasheets) assert.ok(d.defaultLoadout.length && d.points.length, d.name);
  for (const d of detachments) assert.ok(d.forceDispositions.length, d.name);
  assert.ok(sheet('battle-sisters-squad').keywords.includes('ADEPTA SORORITAS'));
  assert.deepEqual(sheet('dialogus').supports.length > 0, true);
});

test('every effect source resolves to an existing id', () => {
  const ids = {
    detachment: detachments.map((d) => d.id),
    stratagem: [...core.stratagems, ...detachments.flatMap((d) => d.stratagems)].map((s) => s.id),
    enhancement: detachments.flatMap((d) => d.enhancements.map((e) => e.id)),
  };
  for (const e of effects) {
    const [kind, id, sub] = e.source.split(':');
    if (kind === 'ability') assert.ok(sheet(id)?.abilities.some((a) => a.id === sub), e.source);
    else assert.ok(ids[kind]?.includes(id), e.source);
    if (e.scope === 'model' && e.model) assert.ok(sheet(id)?.models.some((m) => m.name === e.model) || datasheets.some((d) => d.models.some((m) => m.name === e.model)), e.source);
  }
});

test('Blood of Martyrs: +1 hit below Starting Strength, +1 wound as well Below Half-strength', () => {
  const fx = effectsForUnit(faction, { datasheetIds: ['battle-sisters-squad'], detachmentIds: ['hallowed-martyrs'] });
  const bolter = sheet('battle-sisters-squad').weapons.find((w) => w.name === 'Boltgun');
  const card = (ctx) => computeAttack({ type: 'ranged', groups: [{ weapon: bolter, models: 4, modelName: 'Battle Sister' }],
    target: { T: 4, Sv: 7, W: 1, models: 5, keywords: [] }, ctx, effects: fx, unitKeywords: sheet('battle-sisters-squad').keywords }).cards[0];
  const cu = { members: [{ datasheetId: 'battle-sisters-squad', size: 10 }] };
  assert.equal(card(strength(cu, faction, { models: 10 })).hit.need, 3);
  assert.deepEqual([card(strength(cu, faction, { models: 9 })).hit.need, card(strength(cu, faction, { models: 9 })).wound.need], [2, 4]);
  assert.deepEqual([card(strength(cu, faction, { models: 4 })).hit.need, card(strength(cu, faction, { models: 4 })).wound.need], [2, 3]);
  // one-model unit: counts wounds
  const canoness = { members: [{ datasheetId: 'canoness', size: 1 }] };
  assert.equal(sheet('canoness').models[0].W, 4);
  assert.deepEqual(strength(canoness, faction, { models: 1, wounds: 2 }), { belowStart: true, belowHalf: false });   // exactly half is not below
  assert.deepEqual(strength(canoness, faction, { models: 1, wounds: 1 }), { belowStart: true, belowHalf: true });
});

test('stratagems, enhancements and leaders', () => {
  const list = availableStratagems({ phase: 'fight', turn: 'me', phaseKey: '1-me-fight', detachmentIds: ['penitent-host'],
    units: [unit('a', 'repentia-squad'), unit('b', 'battle-sisters-squad')], game: { cp: 3, used: {}, unitStrat: {} }, core, faction });
  assert.deepEqual(list.find((x) => x.stratagem.id === 'passion-of-the-penitent').eligibleUnits, ['a']);
  const enh = (id) => detachments.flatMap((d) => d.enhancements).find((e) => e.id === id);
  assert.equal(enhancementAllowed(enh('mantle-of-ophelia'), sheet('canoness')), true);
  assert.equal(enhancementAllowed(enh('mantle-of-ophelia'), sheet('ministorum-priest')), false);
  assert.equal(canAttach(sheet('canoness-with-jump-pack'), sheet('seraphim-squad')), 'leader');
  assert.equal(canAttach(sheet('dialogus'), sheet('battle-sisters-squad')), 'support');
});
