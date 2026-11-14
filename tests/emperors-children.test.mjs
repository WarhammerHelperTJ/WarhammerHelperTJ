import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableStratagems } from '../js/engine/stratagems.js';
import { enhancementAllowed, canAttach } from '../js/roster.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const datasheets = json('data/emperors-children/datasheets.json');
const { armyRules, detachments } = json('data/emperors-children/detachments.json');
const faction = { id: 'emperors-children', datasheets, armyRules, detachments };
const core = { stratagems: json('data/core/stratagems.json') };
const sheet = (id) => datasheets.find((d) => d.id === id);
const src = readFileSync(new URL('../docs/source/emperors-children-11e.md', import.meta.url), 'utf8');
const unit = (uid, id) => ({ uid, name: sheet(id).name, datasheetIds: [id], state: {}, keywords: [...sheet(id).keywords, sheet(id).name.toUpperCase()] });

test('every Part C datasheet and Part B detachment made it into the JSON', () => {
  assert.equal(datasheets.length, (src.match(/^### /gm) ?? []).length - (src.match(/^### (Detachment Rule|Enhancements|Stratagems|Thrill Seekers|Pact of Excess)/gm) ?? []).length);
  assert.equal(datasheets.length, 23);
  assert.equal(detachments.length, 10);
  for (const d of datasheets) assert.ok(d.defaultLoadout.length && d.points.length, d.name);
  assert.equal(sheet('noise-marines').points[1].fromCopy, 3);
  assert.ok(sheet('daemonettes').keywords.includes('LEGIONS OF EXCESS'));
  assert.ok(sheet('infractors').keywords.includes('EMPEROR’S CHILDREN'));
});

test('stratagem TARGET with EMPEROR’S CHILDREN matches only that faction keyword', () => {
  const units = [unit('a', 'infractors'), unit('b', 'daemonettes')];
  const list = availableStratagems({ phase: 'fight', turn: 'me', phaseKey: '1-me-fight', detachmentIds: ['mercurial-host'],
    units, game: { cp: 3, used: {}, unitStrat: {} }, core, faction });
  assert.deepEqual(list.find((x) => x.stratagem.id === 'violent-excess').eligibleUnits, ['a']);
});

test('enhancement restrictions and leaders', () => {
  const enh = (id) => detachments.flatMap((d) => d.enhancements).find((e) => e.id === id);
  assert.equal(enhancementAllowed(enh('warp-walker'), sheet('keeper-of-secrets')), true, '"X or KEEPER OF SECRETS model only"');
  assert.equal(enhancementAllowed(enh('euphoric-crown'), sheet('sorcerer')), false);
  assert.equal(enhancementAllowed(enh('exalted-patron'), sheet('lord-exultant')), true);
  assert.equal(canAttach(sheet('lord-exultant'), sheet('tormentors')), 'leader');
});

// ---------- effects overlay ----------
import { effectsForUnit } from '../js/engine/collect.js';
import { computeAttack } from '../js/engine/attack.js';

const effects = json('data/emperors-children/effects.json');
const fac = { ...faction, effects };
const weapon = (id, name) => sheet(id).weapons.find((w) => w.name === name);
const T4 = { T: 4, Sv: 3, W: 1, models: 5, keywords: ['INFANTRY'] };
const card = (type, w, modelName, fx, ctx = {}, target = T4) =>
  computeAttack({ type, groups: [{ weapon: w, models: 1, modelName }], target, ctx, effects: fx }).cards[0];

test('every Emperor’s Children effect source resolves to an existing id', () => {
  const ids = {
    detachment: detachments.map((d) => d.id),
    stratagem: detachments.flatMap((d) => d.stratagems).map((s) => s.id),
    enhancement: detachments.flatMap((d) => d.enhancements.map((e) => e.id)),
  };
  for (const e of effects) {
    const [kind, id, sub] = e.source.split(':');
    if (kind === 'ability') assert.ok(sheet(id)?.abilities.some((a) => sub.startsWith(a.id)), e.source);
    else assert.ok(ids[kind]?.includes(id), e.source);
    if (e.scope === 'model' && kind === 'ability') assert.ok(sheet(id).models.some((m) => m.name === e.model), e.source);
  }
  const manual = effects.filter((e) => e.manual && !e.source.startsWith('stratagem:'));
  const bySource = Map.groupBy(manual, (e) => e.source);
  for (const [s, list] of bySource) assert.ok(list.every((e) => e.label === list[0].label), `one toggle per source: ${s}`);
});

test('Perfectionists: Infractors led by a Lord Exultant get Lethal Hits; alone they do not', () => {
  const led = effectsForUnit(fac, { datasheetIds: ['infractors', 'lord-exultant'], detachmentIds: [] });
  const sabre = weapon('infractors', 'Duelling sabre');
  assert.equal(card('melee', sabre, 'Infractor', led, { phase: 'fight', attached: true }).hit.lethal, true);
  const alone = effectsForUnit(fac, { datasheetIds: ['infractors'], detachmentIds: [] });
  assert.equal(card('melee', sabre, 'Infractor', alone, { phase: 'fight' }).hit.lethal, false);
});

test('Daemonic Patrons: crit wound on 3+ once switched on', () => {
  const fx = effectsForUnit(fac, { datasheetIds: ['flawless-blades'] });
  const blade = weapon('flawless-blades', 'Blissblade');
  assert.equal(card('melee', blade, 'Flawless Blades', fx, { phase: 'fight' }).wound.crit, 6);
  const on = card('melee', blade, 'Flawless Blades', fx, { phase: 'fight', enabled: ['ability:flawless-blades:daemonic-patrons'] });
  assert.equal(on.wound.crit, 3);
  assert.ok(on.wound.chips.some((c) => c.text === 'crit wound on 3+'));
});

test('Daemonic Empowerment: Sustained Hits 1, and crit on 5+ only for weapons that already had it', () => {
  const fx = effectsForUnit(fac, { datasheetIds: ['fulgrim'], detachmentIds: ['carnival-of-excess'] });
  const ctx = { phase: 'fight', enabled: ['detachment:carnival-of-excess'] };
  assert.equal(card('melee', weapon('fulgrim', 'Daemonic blades'), 'Fulgrim', fx, ctx).hit.crit, 5);
  const tail = card('melee', weapon('fulgrim', 'Serpentine tail'), 'Fulgrim', fx, ctx);
  assert.equal(tail.hit.crit, 6);
  assert.equal(tail.hit.sustained, 1);
});

// ---------- ignore modifiers, Possessed Blade, target from datasheet ----------
import { effectsWithBearers } from '../js/attack-setup.js';
import { targetFromDatasheet } from '../js/ui/target.js';

test('Unshakeable Opponents ignores negative hit/wound modifiers, keeps positive ones', () => {
  const fx = [...effectsForUnit(fac, { datasheetIds: ['maulerfiend'], detachmentIds: ['coterie-of-the-conceited'] })];
  const fists = weapon('maulerfiend', 'Maulerfiend fists');
  const dmg = 'ability:maulerfiend:damaged', glut = 'ability:maulerfiend:glutton-for-punishment';
  assert.equal(card('melee', fists, 'Maulerfiend', fx, { phase: 'fight', enabled: [dmg] }).hit.need, 4, 'Damaged: 3+ becomes 4+');
  const ig = card('melee', fists, 'Maulerfiend', fx, { phase: 'fight', enabled: [dmg, glut, 'stratagem:unshakeable-opponents'] });
  assert.equal(ig.hit.need, 2, '-1 ignored, +1 kept');
  assert.ok(ig.hit.chips.some((c) => /ignores -1 hit/.test(c.text)));
});

test('Possessed Blade applies only to the chosen weapon, and not before one is chosen', () => {
  const cu = { members: [{ datasheetId: 'lord-exultant', enhancement: 'possessed-blade', groups: [{ model: 'Lord Exultant' }] }] };
  const fx = (chosen) => {
    cu.members[0].enhancementWeapon = chosen;
    return effectsWithBearers(effectsForUnit(fac, { datasheetIds: ['lord-exultant'], detachmentIds: ['carnival-of-excess'], enhancementIds: ['possessed-blade'] }), cu);
  };
  const atk = (w, f) => computeAttack({ type: 'melee', groups: [{ weapon: weapon('lord-exultant', w), models: 1, modelName: 'Lord Exultant' }], target: T4, ctx: { phase: 'fight' }, effects: f }).cards[0].attacks.total;
  assert.equal(atk('Power fist', fx('Power fist')), 6);
  assert.equal(atk('Phoenix power spear', fx('Power fist')), 5);
  assert.equal(atk('Power fist', fx(null)), 5);
});

test('target from datasheet: bodyguard profile, invuln, smallest size, keywords', () => {
  const t = targetFromDatasheet(sheet('infractors'));
  assert.deepEqual([t.name, t.T, t.Sv, t.W, t.InSv, t.models], ['Infractors', 5, 3, 2, null, 5]);
  assert.ok(t.keywords.includes('INFANTRY') && t.keywords.includes('EMPEROR’S CHILDREN'));
  assert.equal(targetFromDatasheet(sheet('chaos-spawn')).fnp, 5);
  assert.equal(targetFromDatasheet(sheet('daemonettes')).Sv, 7);
});

import { phaseReminders } from '../js/engine/stratagems.js';
test('Intoxicating Musk is a Fight phase reminder for its bearer’s unit', () => {
  const game = json('data/emperors-children/game.json');
  const units = [{ uid: 'u', name: 'Lord Exultant', datasheetIds: ['lord-exultant'], enhancementIds: ['intoxicating-musk'] }];
  const names = (phase) => phaseReminders({ phase, turn: 'opp', units, faction: { ...faction, game } }).map((r) => r.abilityName);
  assert.ok(names('fight').includes('Intoxicating Musk'));
  assert.ok(!names('shooting').includes('Intoxicating Musk'));
});

test('target from datasheet with a leader: bodyguard stats, +1 model, CHARACTER keyword', () => {
  const t = targetFromDatasheet(sheet('infractors'), [sheet('lord-exultant')]);
  assert.equal(t.name, 'Infractors + Lord Exultant');
  assert.deepEqual([t.T, t.Sv, t.W, t.models], [5, 3, 2, 6]);
  assert.ok(t.keywords.includes('CHARACTER') && t.keywords.includes('LORD EXULTANT') && t.keywords.includes('BATTLELINE'));
  assert.equal(new Set(t.keywords).size, t.keywords.length, 'no duplicate keywords');
});
