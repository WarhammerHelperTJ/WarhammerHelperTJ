import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { availableStratagems, useStratagem, undoStratagem, phaseReminders } from '../js/engine/stratagems.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const datasheets = json('data/orks/datasheets.json');
const { armyRules, detachments } = json('data/orks/detachments.json');
const faction = { id: 'orks', datasheets, armyRules, detachments };
const core = { stratagems: json('data/core/stratagems.json') };
const sheet = (id) => datasheets.find((d) => d.id === id);
const unit = (uid, ids, state = {}) => ({
  uid, name: ids.map((i) => sheet(i).name).join(' + '), datasheetIds: ids, state,
  keywords: [...new Set(ids.flatMap((i) => [...sheet(i).keywords, sheet(i).name.toUpperCase()]))],
});
const roster = [
  unit('u0', ['meganobz', 'warboss-in-mega-armour']), unit('u2', ['deff-dread']),
  unit('u3', ['boyz', 'mek']), unit('u5', ['gretchin']),
];
const KEY = '1-me-fight';
const avail = (o) => availableStratagems({ phase: 'fight', turn: 'me', phaseKey: KEY, detachmentIds: ['war-horde'],
  units: roster, game: { cp: 3, used: {}, unitStrat: {} }, core, faction, ...o });
const find = (list, id) => list.find((x) => x.stratagem.id === id);

test("Hit 'Em Harder: Fight on either turn, not Shooting", () => {
  assert.ok(find(avail({}), 'hit-em-harder').usable);
  assert.ok(find(avail({ turn: 'opp' }), 'hit-em-harder'));
  assert.equal(find(avail({ phase: 'shooting' }), 'hit-em-harder'), undefined);
  assert.equal(find(avail({ detachmentIds: [] }), 'hit-em-harder'), undefined);
});

test("Mow 'Em Down: Deff Dread (WALKER) not eligible, Trukk is", () => {
  const m = find(avail({}), 'mow-em-down');
  assert.deepEqual(m.eligibleUnits, []);
  assert.equal(m.usable, false);
  assert.deepEqual(find(avail({ units: [...roster, unit('t', ['trukk'])] }), 'mow-em-down').eligibleUnits, ['t']);
});

test('Close-Range Dakka only on my turn in Shooting', () => {
  assert.ok(find(avail({ phase: 'shooting' }), 'close-range-dakka'));
  assert.equal(find(avail({ phase: 'shooting', turn: 'opp' }), 'close-range-dakka'), undefined);
  assert.equal(find(avail({}), 'close-range-dakka'), undefined);
});

test('keyword phrases: alternatives, exclusions, multi-word keywords, no phrase = all units', () => {
  const ids = (id, o = {}) => find(avail(o), id).eligibleUnits;
  assert.deepEqual(ids('epic-challenge'), ['u0', 'u3']);                                   // CHARACTER
  assert.deepEqual(ids('explosives', { phase: 'shooting' }), ['u0', 'u3']);                // EXPLOSIVES/GRENADES
  assert.deepEqual(ids('command-re-roll'), ['u0', 'u2', 'u3', 'u5']);
  const sf = { id: 'x', cp: 1, turn: 'either', phases: ['any'], when: null, target: 'One ORKS SPEED FREEKS unit.' };
  const fx = { ...faction, detachments: [{ id: 'd', stratagems: [sf] }] };
  assert.deepEqual(find(avail({ faction: fx, detachmentIds: ['d'], units: [...roster, unit('t', ['trukk'])] }), 'x').eligibleUnits, ['t']);
});

test('battle-shocked units are not eligible, except for Breakin\' Heads', () => {
  const units = [unit('u0', ['meganobz', 'warboss-in-mega-armour'], { shocked: true }), unit('u3', ['boyz', 'mek'])];
  assert.deepEqual(find(avail({ units }), 'hit-em-harder').eligibleUnits, ['u3']);
  assert.deepEqual(find(avail({ units }), 'breakin-heads').eligibleUnits, ['u0', 'u3']);
});

test('useStratagem spends CP, blocks a second use this phase and a second stratagem on the same unit', () => {
  const hit = find(avail({}), 'hit-em-harder').stratagem;
  const g0 = { cp: 3, used: {}, unitStrat: {} };
  const g1 = useStratagem(g0, hit, 'u0', KEY);
  assert.equal(g1.cp, 2);
  assert.equal(g0.cp, 3);
  assert.equal(useStratagem(g1, hit, 'u3', KEY), null);
  const list = avail({ game: g1 });
  assert.equal(find(list, 'hit-em-harder').usedThisPhase, true);
  assert.equal(find(list, 'hit-em-harder').usable, false);
  assert.ok(!find(list, 'epic-challenge').eligibleUnits.includes('u0'));
  assert.equal(useStratagem(g1, find(list, 'epic-challenge').stratagem, 'u0', KEY), null);
  assert.equal(useStratagem({ cp: 0, used: {}, unitStrat: {} }, hit, 'u0', KEY), null);
  assert.equal(find(avail({ game: { cp: 0 } }), 'hit-em-harder').affordable, false);
  assert.ok(useStratagem(g1, hit, 'u3', '1-opp-fight'));   // next phase is fine
});

test('undoStratagem refunds CP and clears the usage', () => {
  const hit = find(avail({}), 'hit-em-harder').stratagem;
  const g1 = useStratagem({ cp: 3, used: {}, unitStrat: {} }, hit, 'u0', KEY);
  const g2 = undoStratagem(g1, hit, 'u0', KEY);
  assert.deepEqual(g2, { cp: 3, used: {}, unitStrat: {} });
  assert.equal(undoStratagem(g2, hit, 'u0', KEY), null);
  assert.equal(undoStratagem(g1, hit, 'u0', '1-opp-fight'), null);
  assert.ok(find(avail({ game: g2 }), 'hit-em-harder').usable);
});

test('phase reminders respect phase and your/opponent', () => {
  const r = (phase, turn) => phaseReminders({ phase, turn, units: roster, faction }).filter((x) => !x.always).map((x) => x.abilityName);
  const always = phaseReminders({ phase: 'movement', turn: 'opp', units: roster, faction }).filter((x) => x.always);
  const fx = { ...faction, game: { abilityPhases: { 'Waaagh!': ['fight'], "Krumpin' Time": [] } } };
  const names = (phase) => phaseReminders({ phase, turn: 'opp', units: roster, faction: fx }).map((x) => x.abilityName);
  assert.ok(names('fight').includes('Waaagh!') && !names('command').includes('Waaagh!') && !names('fight').includes("Krumpin' Time"));
  assert.ok(always.length && always.every((x) => !/(Command|Movement|Shooting|Charge|Fight) phase/.test(x.text)));
  assert.ok(r('command', 'me').includes('Waaagh!'));
  assert.ok(r('command', 'opp').includes('Waaagh!'));   // "At the start of the Command phase"
  assert.deepEqual(r('movement', 'me').sort(), ['Clever Know-wotz', 'Intimidating Motivation', "Thievin' Scavengers"]);
  assert.deepEqual(r('movement', 'opp'), []);
  assert.ok(r('fight', 'opp').includes("Krumpin' Time"));
  assert.ok(r('shooting', 'me').includes('Ammo Runts'));
  assert.ok(!r('shooting', 'opp').includes('Ammo Runts'));
});
