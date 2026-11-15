import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { primaryFor, dispositionsFor, linesNow, lineVp, cappedVp, totals, newSecondaries, addCard, discard, putBack } from '../js/scoring.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const missions = json('data/core/missions.json');
const orks = { detachments: json('data/orks/detachments.json').detachments };
const sec = (id) => missions.secondaries.find((s) => s.id === id);

test('every pair of Force Dispositions has exactly one Primary Mission; detachments list theirs', () => {
  for (const a of missions.forceDispositions) for (const b of missions.forceDispositions) assert.ok(primaryFor(missions, a, b), `${a} vs ${b}`);
  assert.equal(primaryFor(missions, 'Take and Hold', 'Take and Hold').name, 'BATTLEFIELD DOMINANCE');
  assert.deepEqual(dispositionsFor(missions, orks, ['war-horde']), ['Take and Hold', 'Purge the Foe']);
  assert.equal(dispositionsFor(missions, orks, []).length, 5, 'no detachment: any');
});

test('scoring windows: Command phase, end of turn, round-5 switch, end of the battle', () => {
  const p = primaryFor(missions, 'Take and Hold', 'Take and Hold');   // r1-2 end of turn; r2+ end of Command phase (r5: end of turn)
  const at = (round, turn, phase, first = 'me') => linesNow(p, { round, turn, phase, first }).map((x) => x.key);
  assert.deepEqual(at(1, 'me', 'command'), []);
  assert.deepEqual(at(1, 'me', 'fight'), ['0:0']);
  assert.deepEqual(at(1, 'opp', 'fight'), [], 'not in the opponent turn');
  assert.deepEqual(at(2, 'me', 'command'), ['1:0', '1:1']);
  assert.deepEqual(at(5, 'me', 'command'), [], 'round 5 scores at the end of the turn instead');
  assert.deepEqual(at(5, 'me', 'fight'), ['1:0', '1:1']);
  const end = missions.primaries.find((x) => x.blocks.some((b) => b.endOfBattle));
  const eob = (turn) => linesNow(end, { round: 5, turn, phase: 'fight', first: 'me' }).filter((x) => end.blocks[+x.key.split(':')[0]].endOfBattle);
  assert.equal(eob('me').length, 0, 'end of battle is after the second player');
  assert.ok(eob('opp').length > 0);
});

test('Fixed/Tactical VP: Assassination lines per mode; A Grievous Blow 4 fixed / 5 tactical', () => {
  const lines = sec('assassination').blocks[0].lines;
  assert.deepEqual(lines.map((l) => lineVp(l, 'fixed')), [3, 1, null]);
  assert.deepEqual(lines.map((l) => lineVp(l, 'tactical')), [null, null, 5]);
  const g = sec('a-grievous-blow').blocks[0].lines[0];
  assert.deepEqual([lineVp(g, 'fixed'), lineVp(g, 'tactical'), g.upTo], [4, 5, 5]);
  assert.equal(linesNow(sec('no-prisoners'), { round: 1, turn: 'opp', phase: 'fight', first: 'me' }, 'tactical').length, 1, '"End of a turn" also scores in the opponent turn');
});

test('VP caps: 15 per round, 45 per kind, 20 per Fixed card, UP TO per turn, Battle Ready 10', () => {
  const e = (o) => ({ kind: 'primary', round: 1, card: 'p', line: '0:0', turn: '1-me', vp: 5, ...o });
  assert.equal(cappedVp([e(), e(), e({ vp: 3 })], e()), 2);
  const full = [1, 2, 3].flatMap((round) => [e({ round, vp: 15 })]);
  assert.equal(cappedVp(full, e({ round: 4 })), 0);
  assert.equal(cappedVp([e({ kind: 'secondary', card: 'f', vp: 15, round: 1 }), e({ kind: 'secondary', card: 'f', vp: 4, round: 2 })], e({ kind: 'secondary', card: 'f', round: 3, fixed: true })), 1);
  assert.equal(cappedVp([e({ kind: 'secondary', card: 's', vp: 2 }), e({ kind: 'secondary', card: 's', vp: 2 })], e({ kind: 'secondary', card: 's', vp: 2, upTo: 5 })), 1);
  assert.equal(cappedVp([], { kind: 'ready', vp: 10 }), 10);
  assert.deepEqual(totals([e(), e({ kind: 'secondary' }), { kind: 'ready', vp: 10 }]), { primary: 5, secondary: 5, ready: 10, total: 20 });
});

test('Tactical cards are entered by hand: add, discard, put back; Fixed cards start active', () => {
  let s = newSecondaries('tactical');
  assert.deepEqual([s.active, s.done], [[], []]);
  s = addCard(addCard(s, 'no-prisoners'), 'beacon');
  assert.deepEqual(addCard(s, 'beacon').active, ['no-prisoners', 'beacon'], 'no duplicates');
  s = discard(s, 'no-prisoners');
  assert.deepEqual([s.active, s.done], [['beacon'], ['no-prisoners']]);
  s = putBack(s, 'beacon');
  assert.deepEqual([s.active, s.done], [[], ['no-prisoners']], 'put back: not discarded');
  assert.deepEqual(addCard(s, 'no-prisoners').done, [], 'a discarded card drawn again leaves the discard pile');
  assert.deepEqual(newSecondaries('fixed', ['assassination', 'bring-it-down']).active, ['assassination', 'bring-it-down']);
});

test('a condition scores once per turn; "For each" repeats; OR alternatives exclude each other', async () => {
  const { lineOpen } = await import('../js/scoring.js');
  const fronts = sec('engage-on-all-fronts');           // 0:0 three quarters, 0:1 OR four quarters
  const log = [{ kind: 'secondary', card: fronts.id, line: '0:0', turn: '1-me', vp: 3 }];
  assert.equal(lineOpen(log, fronts, '0:0', '1-me'), false);
  assert.equal(lineOpen(log, fronts, '0:1', '1-me'), false, 'the OR alternative is closed too');
  assert.equal(lineOpen(log, fronts, '0:0', '2-me'), true, 'next turn it can score again');
  const np = sec('no-prisoners');                        // "For each enemy unit destroyed" (up to 5VP)
  assert.equal(lineOpen([{ card: np.id, line: '0:0', turn: '1-me', vp: 2 }], np, '0:0', '1-me'), true);
});
