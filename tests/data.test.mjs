import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseWeaponAbilities } from '../js/engine/parse.js';

const ROOT = new URL('../', import.meta.url);
const read = p => readFileSync(new URL(p, ROOT), 'utf8');
const json = p => JSON.parse(read(p));
const src = read('docs/source/orks-11e.md').split(/\r?\n/);
const datasheets = json('data/orks/datasheets.json');
const { armyRules, detachments } = json('data/orks/detachments.json');
const coreStrats = json('data/core/stratagems.json');
const coreAbilities = json('data/core/abilities.json');

const partC = src.findIndex(s => s.startsWith('# PART C'));
const partB = src.findIndex(s => s.startsWith('# PART B'));
const sheet = name => datasheets.find(d => d.name === name);
const allWeapons = [
  ...datasheets.flatMap(d => d.weapons.map(w => [d.name, w])),
  ...detachments.flatMap(d => d.enhancements.flatMap(e => e.weapons.map(w => [e.name, w]))),
];

test('every Part C datasheet is present, ids unique', () => {
  const heads = src.slice(partC).filter(s => s.startsWith('### ')).map(s => s.slice(4).trim());
  assert.equal(heads.length, 67);
  assert.deepEqual(datasheets.map(d => d.name), heads);
  assert.equal(new Set(datasheets.map(d => d.id)).size, 67);
  for (const d of datasheets) {
    assert.ok(d.keywords.includes('ORKS'), d.name);
    assert.equal(new Set(d.weapons.map(w => w.id)).size, d.weapons.length, `${d.name} weapon ids`);
    assert.ok(d.models.length && d.points.length && d.composition, d.name);
  }
});

test('15 detachments with rule, enhancement and stratagem counts matching the source', () => {
  assert.equal(detachments.length, 15);
  for (const d of detachments) {
    const start = src.findIndex(s => s.startsWith(`## ${d.name} (`));
    let end = src.findIndex((s, i) => i > start && /^#{1,2} /.test(s));
    if (end < 0) end = src.length;
    const section = src.slice(start, end);
    assert.ok(d.rule?.name && d.rule.text, `${d.name} rule`);
    assert.equal(d.stratagems.length, section.filter(s => s.startsWith('#### ')).length, `${d.name} stratagems`);
    assert.equal(d.enhancements.length, section.filter(s => /^• .+ \d+ pts — /.test(s)).length, `${d.name} enhancements`);
    for (const s of d.stratagems) {
      assert.equal(s.detachment, d.id);
      assert.ok(s.when && s.target && s.effect, s.name);
    }
  }
  assert.deepEqual(armyRules.map(r => r.id), ['waaagh', 'da-boss', 'unstable-energies', 'special-move-types']);
});

test('10 core stratagems, ids unique across core and detachments', () => {
  assert.equal(coreStrats.length, 10);
  for (const s of coreStrats) {
    assert.equal(s.detachment, null);
    assert.ok(['your', 'opponent', 'either'].includes(s.turn) && s.phases.length && s.effect, s.name);
  }
  const ids = [...coreStrats, ...detachments.flatMap(d => d.stratagems)].map(s => s.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(coreStrats.find(s => s.id === 'command-re-roll').phases, ['any']);
  assert.ok(coreAbilities.some(a => a.name === 'ANTI') && coreAbilities.every(a => a.text));
});

test('every weapon has numeric S/AP and a parsed abilities array', () => {
  assert.ok(allWeapons.length > 300);
  for (const [where, w] of allWeapons) {
    const tag = `${where}: ${w.name} ${w.profile ?? ''}`;
    assert.equal(typeof w.S, 'number', tag);
    assert.ok(typeof w.AP === 'number' && w.AP <= 0, tag);
    assert.ok(w.skill === null || Number.isInteger(w.skill), tag);
    assert.equal(typeof w.A, 'string', tag);
    assert.equal(typeof w.D, 'string', tag);
    assert.ok(Array.isArray(w.abilities), tag);
    for (const a of w.abilities) assert.ok(a.name, tag);
  }
});

test('spot checks', () => {
  assert.deepEqual(sheet('Boyz').points, [
    { fromCopy: 1, sizes: [{ models: 10, pts: 85 }, { models: 20, pts: 170 }] },
    { fromCopy: 4, sizes: [{ models: 10, pts: 95 }, { models: 20, pts: 180 }] },
  ]);
  assert.deepEqual(sheet('Boyz').defaultLoadout, [
    { model: 'Nob', min: 1, max: 2, weapons: ['Kustom Choppa', 'Kombi-skorcha'] },
    { model: 'Boy', min: 9, max: 18, weapons: ['Choppa', 'Shoota', 'Slugga'] },
  ]);
  assert.equal(sheet('Boyz').role, 'Battleline');

  const roar = sheet('Ghazghkull Thraka').weapons.find(w => w.name === "Mork's Roar" && w.profile === 'Point Blank');
  assert.equal(roar.A, '2D6+2');
  assert.equal(roar.skill, null);
  assert.ok(roar.abilities.some(a => a.name === 'TORRENT'));

  const thump = sheet('Mozrog Skragbad').weapons.find(w => w.name === 'Thump Gun');
  assert.deepEqual(thump.abilities, [{ name: 'ANTI', onlyVs: ['MONSTER', 'VEHICLE'], value: 4 }]);

  const shoota = sheet('Boyz').weapons.find(w => w.id === 'kombi-rokkit-shoota');
  assert.deepEqual(shoota.abilities, [{ name: 'LETHAL HITS', notVs: ['MONSTER', 'VEHICLE'] }, { name: 'RAPID FIRE', value: 1 }]);

  const gob = detachments.find(d => d.id === 'brute-bosses').enhancements.find(e => e.name === 'Da Gobshot Thunderbuss');
  assert.equal(gob.pts, 20);
  assert.equal(gob.restriction, 'WARBOSS model only');
  assert.equal(gob.weapons.length, 1);
  assert.deepEqual(gob.weapons[0].abilities, [
    { name: 'LETHAL HITS', notVs: ['MONSTER', 'VEHICLE'] }, { name: 'RAPID FIRE', value: 6 },
  ]);

  const madcap = detachments.find(d => d.id === 'madcap-meks');
  assert.deepEqual(madcap.stratagems.map(s => s.id), ['vindictive-artillerists']);
  assert.equal(madcap.enhancements.length, 3);
  assert.ok(madcap.rule.text.includes('Runtified'));

  const ardboyz = detachments.find(d => d.id === 'green-tide').enhancements.find(e => e.id === 'ardboyz');
  assert.equal(ardboyz.upgrade, true);
  assert.equal(ardboyz.name, "'Ardboyz");

  assert.ok(detachments.find(d => d.id === 'wurrband').rule.text.includes('Visions of Violence'));

  const wbma = sheet('Warboss In Mega Armour');
  assert.deepEqual(wbma.leads, ['MEGANOBZ']);
  assert.equal(wbma.role, 'Characters');
  assert.equal(wbma.invuln, 5);
  assert.deepEqual(wbma.points.map(p => p.fromCopy), [1, 3]);

  const heh = detachments.find(d => d.id === 'war-horde').stratagems.find(s => s.id === 'hit-em-harder');
  assert.equal(heh.turn, 'either');
  assert.deepEqual(heh.phases, ['fight']);
  assert.deepEqual(detachments.find(d => d.id === 'bully-boyz').stratagems.find(s => s.id === 'armed-to-da-teef').phases,
    ['shooting', 'fight']);
  assert.ok(sheet('Trukk').abilities.some(a => a.name === 'Transport'));
});

test('parseWeaponAbilities: source section 3 examples and edge cases', () => {
  assert.deepEqual(parseWeaponAbilities('LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2'), [
    { name: 'LETHAL HITS', notVs: ['MONSTER', 'VEHICLE'] }, { name: 'RAPID FIRE', value: 2 },
  ]);
  assert.deepEqual(parseWeaponAbilities('ANTI-MONSTER/VEHICLE 4+ CLOSE-QUARTERS DEVASTATING WOUNDS: MONSTER/VEHICLE'), [
    { name: 'ANTI', onlyVs: ['MONSTER', 'VEHICLE'], value: 4 },
    { name: 'CLOSE-QUARTERS' },
    { name: 'DEVASTATING WOUNDS', onlyVs: ['MONSTER', 'VEHICLE'] },
  ]);
  assert.deepEqual(parseWeaponAbilities('-'), []);
  assert.deepEqual(parseWeaponAbilities(''), []);
  assert.deepEqual(parseWeaponAbilities('BLAST 3, HAZARDOUS, LETHAL HITS, PSYCHIC'), [
    { name: 'BLAST', value: 3 }, { name: 'HAZARDOUS' }, { name: 'LETHAL HITS' }, { name: 'PSYCHIC' },
  ]);
  assert.deepEqual(parseWeaponAbilities('BLAST 1 Torrent'), [{ name: 'BLAST', value: 1 }, { name: 'TORRENT' }]);
  assert.deepEqual(parseWeaponAbilities('Blast'), [{ name: 'BLAST', value: 1 }]);
  assert.deepEqual(parseWeaponAbilities('SUSTAINED HITS 2: MONSTER/VEHICLE'), [
    { name: 'SUSTAINED HITS', value: 2, onlyVs: ['MONSTER', 'VEHICLE'] },
  ]);
  assert.deepEqual(parseWeaponAbilities('anti-infantry 4+ DEVASTATING WOUNDS: INFANTRY Extra Attacks Precision'), [
    { name: 'ANTI', onlyVs: ['INFANTRY'], value: 4 },
    { name: 'DEVASTATING WOUNDS', onlyVs: ['INFANTRY'] },
    { name: 'EXTRA ATTACKS' }, { name: 'PRECISION' },
  ]);
  assert.deepEqual(parseWeaponAbilities('Twin-linked Melta 2 Ignores Cover'), [
    { name: 'TWIN-LINKED' }, { name: 'MELTA', value: 2 }, { name: 'IGNORES COVER' },
  ]);
  const unknown = [];
  assert.deepEqual(parseWeaponAbilities('Lance Wobbly', unknown), [{ name: 'LANCE' }, { name: 'WOBBLY' }]);
  assert.deepEqual(unknown, ['WOBBLY']);
});

test('js/data.js loads JSON relative to the page, caches it, and looks things up', async () => {
  const calls = [];
  globalThis.fetch = async path => {
    calls.push(path);
    return { ok: true, json: async () => JSON.parse(read(path)) };
  };
  const data = await import('../js/data.js');
  const core = await data.loadCore();
  const orks = await data.loadFaction('orks');
  await data.loadFaction('orks');
  assert.deepEqual(calls.sort(), ['data/core/abilities.json', 'data/core/stratagems.json',
    'data/orks/datasheets.json', 'data/orks/detachments.json', 'data/orks/effects.json', 'data/orks/game.json']);
  assert.ok(orks.effects.length);
  assert.equal(data.datasheetById(orks, 'boyz').name, 'Boyz');
  assert.equal(data.detachmentById(orks, 'war-horde').dp, 3);
  assert.equal(data.stratagemById(core, orks, 'hit-em-harder').detachment, 'war-horde');
  assert.equal(data.stratagemById(core, null, 'fire-overwatch').turn, 'opponent');
  assert.equal(data.enhancementById(orks, 'follow-me-ladz').pts, 20);
  assert.equal(data.armyRuleById(orks, 'waaagh').name, 'Waaagh!');
  assert.ok(data.abilityByName(core, 'lethal hits').text);
  assert.equal(data.datasheetById(orks, 'nope'), null);
  delete globalThis.fetch;
});
