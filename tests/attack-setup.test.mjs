import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { weaponChoices, buildGroups, effectsWithBearers } from '../js/attack-setup.js';
import { combatUnits } from '../js/game.js';
import { rosterFromTemplate } from '../js/roster.js';
import { effectsForUnit } from '../js/engine/collect.js';
import { computeAttack } from '../js/engine/attack.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const { armyRules, detachments } = json('data/orks/detachments.json');
const faction = { id: 'orks', datasheets: json('data/orks/datasheets.json'), armyRules, detachments, effects: json('data/orks/effects.json') };
const fresh = () => rosterFromTemplate(json('data/orks/example-roster.json'), faction, 'r1');
const unitOf = (roster, id) => combatUnits(roster, faction).find((u) => u.datasheetIds[0] === id);
const named = (groups) => groups.map((g) => [g.weapon.name + (g.weapon.profile ? ` - ${g.weapon.profile}` : ''), g.models, g.modelName]);

test('Meganobz + Warboss in Fight: Power Klaw ×2 and the Warboss melee weapon', () => {
  const cu = unitOf(fresh(), 'meganobz');
  const ch = weaponChoices(cu, faction, 'melee');
  assert.deepEqual(ch[0].meleeOptions, ['Power Klaw']);
  assert.deepEqual(named(buildGroups(ch)), [['Power Klaw', 2, 'Meganob'], ["'Uge Choppa", 1, 'Warboss In Mega Armour']]);
});

test('Boyz + Mek in Shoot: slugga either/or for Boy models only', () => {
  const cu = unitOf(fresh(), 'boyz');
  const ch = weaponChoices(cu, faction, 'ranged');
  const boy = ch.find((g) => g.modelName === 'Boy'), nob = ch.find((g) => g.modelName === 'Nob'), mek = ch.find((g) => g.modelName === 'Mek');
  assert.equal(boy.cqSwitch, true);
  assert.deepEqual([boy.cqNames, boy.otherNames], [['Slugga'], ['Shoota']]);
  assert.deepEqual(boy.weapons.map((w) => w.name), ['Shoota']);                       // default: the other weapons
  assert.equal(nob.cqSwitch, false);
  assert.equal(mek.cqSwitch, false);                                                   // only a close-quarters gun: it fires
  assert.deepEqual(mek.weapons.map((w) => w.name), ['Kustom Mega-slugga']);
  const cq = weaponChoices(cu, faction, 'ranged', { [boy.key]: { cq: true } });
  assert.deepEqual(cq.find((g) => g.modelName === 'Boy').weapons.map((w) => w.name), ['Slugga']);
  // toggled off weapons are left out of the groups
  const off = buildGroups(weaponChoices(cu, faction, 'ranged', { [mek.key]: { off: ['Kustom Mega-slugga'] } }));
  assert.ok(!off.some((g) => g.modelName === 'Mek'));
});

test('MONSTER/VEHICLE models are not bound by the close-quarters rule', () => {
  const roster = fresh();
  const dread = roster.units.find((u) => u.datasheetId === 'deff-dread');
  dread.groups[0].weapons.push('Kustom Mega-blasta');
  const fake = { ...faction, datasheets: faction.datasheets.map((d) => (d.id === 'deff-dread'
    ? { ...d, weapons: d.weapons.map((w) => (w.name === 'Skorcha' ? { ...w, abilities: [...w.abilities, { name: 'PISTOL' }] } : w)) } : d)) };
  const [g] = weaponChoices(unitOf(roster, 'deff-dread'), fake, 'ranged');
  assert.equal(g.cqSwitch, false);
  assert.equal(g.weapons.length, 3);
});

test('Extra Attacks weapons are always included in Fight', () => {
  const roster = fresh();
  roster.units.find((u) => u.datasheetId === 'deff-dread').groups[0].weapons.push('Extra Klaw');
  const cu = unitOf(roster, 'deff-dread');
  const [g] = weaponChoices(cu, faction, 'melee', {});
  assert.deepEqual(g.meleeOptions, ['Dread Klaws']);
  assert.deepEqual(g.weapons.map((w) => [w.name, w.fixed]), [['Dread Klaws', false], ['Extra Klaw', true]]);
  const [g2] = weaponChoices(cu, faction, 'melee', { [g.key]: { melee: 'Extra Klaw' } });   // not a choice
  assert.deepEqual(g2.weapons.map((w) => w.name), ['Dread Klaws', 'Extra Klaw']);
});

test('a group without melee weapons fights with nothing', () => {
  const roster = fresh();
  roster.units.find((u) => u.datasheetId === 'gretchin').groups[0].weapons = ['Grot Blasta'];
  const [g] = weaponChoices(unitOf(roster, 'gretchin'), faction, 'melee');
  assert.equal(g.melee, null);
  assert.deepEqual(buildGroups([g]), []);
});

test('a weapon name listed twice doubles the models for that weapon', () => {
  const roster = fresh();
  roster.units.find((u) => u.datasheetId === 'deff-dread').groups[0].weapons.push('Big Shoota');
  const groups = buildGroups(weaponChoices(unitOf(roster, 'deff-dread'), faction, 'ranged'));
  assert.deepEqual(named(groups), [['Big Shoota', 2, 'Deff Dread'], ['Skorcha', 1, 'Deff Dread']]);
});

test('multi-profile weapons expose their profiles; default the first', () => {
  const cu = unitOf(fresh(), 'meganobz');
  const ch = weaponChoices(cu, faction, 'ranged');
  const ks = ch[0].weapons.find((w) => w.name === 'Kustom Shoota');
  assert.deepEqual(ks.profiles, ['Aimed', 'Point Blank']);
  assert.equal(ks.profile, 'Aimed');
  const pb = weaponChoices(cu, faction, 'ranged', { [ch[0].key]: { profiles: { 'Kustom Shoota': 'Point Blank' } } })[0].weapons[0];
  assert.equal(pb.weapon.A, 'D3+3');
});

test('models remaining: scaled when only one group can lose models, else a stepper', () => {
  const cu = unitOf(fresh(), 'boyz');                                      // Nob 1, Boy 9, Mek 1
  const ch = weaponChoices(cu, faction, 'melee', {}, 8);
  assert.deepEqual(ch.map((g) => [g.modelName, g.models, g.stepper]), [['Nob', 1, false], ['Boy', 6, false], ['Mek', 1, false]]);
  // not every model is eligible: the user can always lower the count, never above the group size
  const fewer = weaponChoices(cu, faction, 'melee', { [ch[1].key]: { models: 3 }, [ch[2].key]: { models: 0 } }, 8);
  assert.deepEqual(fewer.map((g) => g.models), [1, 3, 0]);
  assert.equal(weaponChoices(cu, faction, 'melee', { [ch[1].key]: { models: 99 } }, 8)[1].models, 9);
  const roster = fresh();
  const boyz = roster.units.find((u) => u.datasheetId === 'boyz');
  boyz.groups = [{ model: 'Nob', count: 1, weapons: ['Power Klaw'] }, { model: 'Boy', count: 5, weapons: ['Choppa'] }, { model: 'Boy', count: 4, weapons: ['Big Choppa'] }];
  const st = weaponChoices(unitOf(roster, 'boyz'), faction, 'melee', {}, 8);
  assert.ok(st.every((g) => g.stepper));
  assert.deepEqual(st.map((g) => g.models), [1, 5, 4, 1]);
  const set = weaponChoices(unitOf(roster, 'boyz'), faction, 'melee', { [st[2].key]: { models: 2 } }, 8);
  assert.equal(set[2].models, 2);
});

test('enhancement weapons join the bearer group; model-scoped enhancement effects get the bearer', () => {
  const roster = fresh();
  const boss = roster.units.find((u) => u.datasheetId === 'warboss-in-mega-armour');
  boss.enhancement = 'da-gobshot-thunderbuss';
  const cu = unitOf(roster, 'meganobz');
  const g = weaponChoices(cu, faction, 'ranged').find((x) => x.modelName === 'Warboss In Mega Armour');
  assert.deepEqual(g.weapons.map((w) => w.name), ['Big Shoota', 'Da Gobshot Thunderbuss']);

  boss.enhancement = 'headwoppas-killchoppa';
  const cu2 = unitOf(roster, 'meganobz');
  const fx = effectsWithBearers(effectsForUnit(faction, { datasheetIds: cu2.datasheetIds, detachmentIds: roster.detachments, enhancementIds: cu2.enhancementIds }), cu2);
  assert.equal(fx.find((e) => e.source === 'enhancement:headwoppas-killchoppa').model, 'Warboss In Mega Armour');
  const { cards } = computeAttack({ type: 'melee', groups: buildGroups(weaponChoices(cu2, faction, 'melee')),
    target: { T: 4, Sv: 3, W: 2, models: 5, keywords: ['INFANTRY'] }, ctx: { phase: 'fight', charged: true }, effects: fx, unitKeywords: cu2.keywords });
  assert.equal(cards.find((c) => c.title.startsWith('Power Klaw')).save.need, 5);       // AP-2 unchanged
  assert.equal(cards.find((c) => c.title.startsWith("'Uge Choppa")).save.need, 6);      // AP-3 on the bearer only
});

test('definition of done: riled-up Meganobz fight Intercessors -> source 2.3 Power Klaw card', () => {
  const roster = fresh();
  const cu = unitOf(roster, 'meganobz');
  const effects = effectsWithBearers(effectsForUnit(faction, { datasheetIds: cu.datasheetIds, detachmentIds: roster.detachments,
    enhancementIds: cu.enhancementIds, armyDatasheetIds: roster.units.map((u) => u.datasheetId) }), cu);
  const { cards } = computeAttack({ type: 'melee', groups: buildGroups(weaponChoices(cu, faction, 'melee', {}, 3)),
    target: { name: 'Intercessors', T: 4, Sv: 3, InSv: null, W: 2, models: 5, keywords: ['INFANTRY'] },
    ctx: { phase: 'fight', turn: 'me', riledUp: true, attached: true, modelCount: 3, enabled: [] }, effects, unitKeywords: cu.keywords });
  const klaw = cards.find((c) => c.title === 'Power Klaw ×2');
  assert.equal(klaw.attacks.total, 6);
  assert.equal(klaw.hit.need, 2);
  assert.ok(klaw.hit.chips.some((c) => c.source === "Krumpin' Time (Meganobz)" && c.text === '+1 hit'));
  assert.ok(klaw.hit.chips.some((c) => c.source === 'Get Stuck In (War Horde)' && /Sustained Hits 1/.test(c.text)));
  assert.equal(klaw.wound.need, 2);
  assert.equal(klaw.save.need, 5);
  assert.equal(klaw.damage.expr, '2');
  assert.equal(cards.length, 2);
});
