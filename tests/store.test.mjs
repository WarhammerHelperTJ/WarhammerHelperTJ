import test from 'node:test';
import assert from 'node:assert/strict';

test('store imports without localStorage and updates/notifies', async () => {
  const store = await import('../js/store.js');
  const s = store.get();
  assert.deepEqual(s.rosters, []);
  assert.equal(s.settings.capModifiers, true);
  let seen = null;
  const off = store.subscribe((st) => { seen = st; });
  store.update((d) => { d.rosters.push({ id: 'r1' }); });
  assert.equal(store.get().rosters[0].id, 'r1');
  assert.equal(seen, store.get());
  assert.deepEqual(s.rosters, [], 'previous state not mutated');
  off();
  store.update((d) => ({ ...d, game: { round: 1 } }));
  assert.equal(seen.game, null);
  assert.equal(store.get().game.round, 1);
});

test('store persists to dicehelper.v1 and survives throwing storage', async () => {
  const mem = {};
  globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = v; } };
  const a = await import('../js/store.js?persist');
  a.update((d) => { d.settings.capModifiers = false; });
  assert.equal(JSON.parse(mem['dicehelper.v1']).settings.capModifiers, false);
  const b = await import('../js/store.js?reload');
  assert.equal(b.get().settings.capModifiers, false);
  globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  const c = await import('../js/store.js?blocked');
  assert.equal(c.get().settings.capModifiers, true);
  c.update((d) => { d.game = {}; });
  delete globalThis.localStorage;
});
