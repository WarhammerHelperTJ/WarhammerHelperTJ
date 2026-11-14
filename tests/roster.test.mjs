import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { unitPoints, rosterTotal, dpOk, dpUsed, defaultGroups, canAttach, enhancementAllowed, newUnit, rosterFromTemplate } from '../js/roster.js';

const json = p => JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'));
const datasheets = json('data/orks/datasheets.json');
const { detachments } = json('data/orks/detachments.json');
const faction = { id: 'orks', datasheets, detachments };
const ds = id => datasheets.find(d => d.id === id);
const det = id => detachments.find(d => d.id === id);
const rosterOf = (...ids) => ({ units: ids.map(id => newUnit(ds(id))), detachments: [], mode: 'custom' });

test('example roster totals 500 with War Horde', () => {
  const r = rosterFromTemplate(json('data/orks/example-roster.json'), faction);
  assert.equal(rosterTotal(r, faction), 500);
  assert.equal(r.units.filter(u => u.warlord).length, 1);
  assert.equal(r.units.filter(u => u.attachedTo).length, 2);
  assert.ok(dpOk(r, detachments));
});

test('nth-copy pricing and override', () => {
  const boyz = rosterOf('boyz', 'boyz', 'boyz', 'boyz');
  assert.deepEqual(boyz.units.map(u => unitPoints(boyz, u, datasheets)), [85, 85, 85, 95]);
  const mega = rosterOf('meganobz', 'meganobz', 'meganobz');
  assert.equal(unitPoints(mega, mega.units[2], datasheets), 110);
  mega.units[2].ptsOverride = 1;
  assert.equal(unitPoints(mega, mega.units[2], datasheets), 1);
});

test('default groups scale to the unit size', () => {
  const names = g => g.map(x => [x.model, x.count]);
  assert.deepEqual(names(defaultGroups(ds('boyz'), 10)), [['Nob', 1], ['Boy', 9]]);
  assert.deepEqual(names(defaultGroups(ds('boyz'), 20)), [['Nob', 2], ['Boy', 18]]);
  assert.deepEqual(defaultGroups(ds('meganobz'), 3)[0].weapons, ['Kustom Shoota', 'Power Klaw']);
});

test('leader/support attachment', () => {
  assert.equal(canAttach(ds('warboss-in-mega-armour'), ds('meganobz')), 'leader');
  assert.equal(canAttach(ds('warboss-in-mega-armour'), ds('boyz')), null);
  assert.equal(canAttach(ds('mek'), ds('boyz')), 'support');
});

test('detachment points budget', () => {
  assert.ok(dpOk({ mode: 'incursion', detachments: ['war-horde'] }, detachments));
  const pair = { mode: 'incursion', detachments: ['war-horde', 'green-tide'] };
  assert.equal(dpUsed(pair, detachments), 4);
  assert.ok(!dpOk(pair, detachments));
  assert.ok(dpOk({ ...pair, mode: 'custom' }, detachments));
  assert.ok(dpOk({ mode: 'incursion', detachments: ['green-tide', 'bully-boyz'] }, detachments));
});

test('enhancement restriction heuristic', () => {
  const enh = (d, name) => det(d).enhancements.find(e => e.name === name);
  assert.ok(enhancementAllowed(enh('war-horde', 'Follow Me Ladz'), ds('warboss-in-mega-armour')));
  assert.ok(!enhancementAllowed(enh('war-horde', 'Follow Me Ladz'), ds('boyz')), 'needs a CHARACTER');
  assert.ok(enhancementAllowed(enh('green-tide', "'Ardboyz"), ds('boyz')));
  assert.ok(!enhancementAllowed(enh('green-tide', "'Ardboyz"), ds('gretchin')));
  assert.ok(enhancementAllowed(enh('shoota-boyz', "Targetin' Squigs"), ds('warboss-in-mega-armour')));
  assert.ok(!enhancementAllowed(enh('shoota-boyz', "Targetin' Squigs"), ds('mek')));
  assert.ok(enhancementAllowed(enh('bully-boyz', 'Tellyporta Boss'), ds('warboss-in-mega-armour')));
});
