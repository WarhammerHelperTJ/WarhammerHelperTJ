import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PHASES, newGame, phaseKey, nextPhase, callArmyRule, combatUnits } from '../js/game.js';
import { rosterFromTemplate } from '../js/roster.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const { armyRules, detachments } = json('data/orks/detachments.json');
const faction = { id: 'orks', datasheets: json('data/orks/datasheets.json'), armyRules, detachments };
const roster = rosterFromTemplate(json('data/orks/example-roster.json'), faction, 'r1');
const cus = combatUnits(roster, faction);
const steps = (g, n) => { for (let i = 0; i < n; i++) g = nextPhase(g); return g; };

test('combatUnits merges attached characters into their bodyguard', () => {
  assert.equal(cus.length, 4);
  assert.deepEqual(cus.map((u) => u.name), ['Meganobz + Warboss In Mega Armour', 'Deff Dread', 'Boyz + Mek', 'Gretchin']);
  const boyz = cus.find((u) => u.datasheetIds[0] === 'boyz');
  assert.ok(boyz.keywords.includes('BOYZ') && boyz.keywords.includes('MEK') && boyz.keywords.includes('INFANTRY'));
  assert.deepEqual(boyz.datasheetIds, ['boyz', 'mek']);
  assert.equal(boyz.uid, roster.units[3].uid);
  assert.equal(boyz.members.length, 2);
});

test('newGame: SPEC shape, models and single-model wounds', () => {
  const g = newGame(roster, faction, 'me');
  assert.equal(phaseKey(g), '1-me-command');
  assert.equal(g.cp, 1 + g.roundCp);
  assert.deepEqual(g.waaagh.used, false);
  const s = (id) => g.units[cus.find((u) => u.datasheetIds[0] === id).uid];
  assert.equal(s('boyz').models, 11);
  assert.equal(s('boyz').wounds, null);
  assert.equal(s('deff-dread').models, 1);
  assert.equal(s('deff-dread').wounds, 8);
});

for (const first of ['me', 'opp']) {
  test(`phase/turn/round progression, ${first} goes first`, () => {
    const second = first === 'me' ? 'opp' : 'me';
    let g = newGame(roster, faction, first);
    assert.equal(g.turn, first);
    assert.deepEqual(PHASES.map((_, i) => steps(g, i).phase), PHASES);
    g = steps(g, 5);
    assert.equal(phaseKey(g), `1-${second}-command`);
    g = steps(g, 5);
    assert.equal(phaseKey(g), `2-${first}-command`);
  });
}

test('turn flags clear when a new turn starts', () => {
  let g = newGame(roster, faction, 'me');
  const id = cus[0].uid;
  g.units[id] = { ...g.units[id], charged: true, advanced: true, stationary: true, shocked: true, riled: true };
  g = steps(g, 4);
  assert.equal(g.units[id].charged, true);
  g = nextPhase(g);
  assert.deepEqual([g.units[id].charged, g.units[id].advanced, g.units[id].stationary], [false, false, false]);
  assert.equal(g.units[id].shocked, true);
  assert.equal(g.units[id].riled, true);   // manual riled-up is not timed
});

test('army toggle riles only units with the rule, once, until the end of the next turn', () => {
  const units = [...cus, { uid: 'x', armyRules: [] }];
  let g = newGame(roster, faction, 'me');
  g.units.x = { riled: false };
  g = callArmyRule(g, units, 'Waaagh!');
  assert.ok(cus.every((u) => g.units[u.uid].riled));
  assert.equal(g.units.x.riled, false);
  assert.equal(callArmyRule(g, units, 'Waaagh!'), null);
  g = steps(g, 5);                         // my turn over, opponent's turn: still riled
  assert.ok(g.units[cus[0].uid].riled);
  g = steps(g, 4);
  assert.ok(g.units[cus[0].uid].riled);    // opponent's Fight phase
  g = nextPhase(g);                        // end of the next turn
  assert.equal(phaseKey(g), '2-me-command');
  assert.ok(cus.every((u) => !g.units[u.uid].riled));
  assert.equal(g.waaagh.used, true);
  assert.equal(g.waaagh.activeUntil, null);
});

test('army toggle called on the second player\'s turn lasts into the next round', () => {
  let g = steps(newGame(roster, faction, 'opp'), 5);   // round 1, my turn (second)
  g = callArmyRule(g, cus, 'Waaagh!');
  assert.deepEqual(g.waaagh.activeUntil, { round: 2, turn: 'opp' });
  g = steps(g, 5);
  assert.ok(g.units[cus[0].uid].riled);
  g = steps(g, 5);
  assert.equal(g.units[cus[0].uid].riled, false);
});

test('1 CP is gained at the start of every Command phase, on both turns', () => {
  let g = { first: 'me', round: 1, turn: 'me', phase: 'command', cp: 1, units: {} };
  for (let i = 0; i < 4; i++) g = nextPhase(g);
  assert.equal(g.cp, 1, 'no gain within a turn');
  g = nextPhase(g);
  assert.deepEqual([g.turn, g.phase, g.cp], ['opp', 'command', 2]);
  for (let i = 0; i < 5; i++) g = nextPhase(g);
  assert.deepEqual([g.round, g.turn, g.cp], [2, 'me', 3]);
});

test('a Warlord rule with cpPerRound adds CP at game start and at each new battle round, only if the Warlord has it', () => {
  const faction = { datasheets: [{ id: 'boss', name: 'Boss', models: [{ W: 5 }], keywords: [], armyRules: ['Chief'] }, { id: 'grunt', name: 'Grunt', models: [{ W: 1 }], keywords: [], armyRules: [] }],
    armyRules: [{ id: 'chief', name: 'Chief', text: '' }], game: { warlordRules: [{ armyRuleId: 'chief', cpPerRound: 1 }] } };
  const unit = (id, warlord) => ({ uid: id, datasheetId: id, size: 1, groups: [], warlord });
  let g = newGame({ id: 'r', units: [unit('boss', true), unit('grunt', false)] }, faction);
  assert.deepEqual([g.roundCp, g.cp], [1, 2]);
  for (let i = 0; i < 5; i++) g = nextPhase(g);
  assert.equal(g.cp, 3, "opponent's Command phase: +1 only");
  for (let i = 0; i < 5; i++) g = nextPhase(g);
  assert.deepEqual([g.round, g.cp], [2, 5], 'new round: +1 Command phase, +1 Warlord rule');
  assert.equal(newGame({ id: 'r', units: [unit('boss', false), unit('grunt', true)] }, faction).cp, 1);
});
