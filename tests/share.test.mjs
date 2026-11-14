import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encodeRoster, decodeRoster } from '../js/share.js';
import { rosterFromTemplate } from '../js/roster.js';

const json = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const { detachments } = json('data/orks/detachments.json');
const faction = { id: 'orks', datasheets: json('data/orks/datasheets.json'), detachments };

test('roster link round-trips the roster (without its id) and stays short', async () => {
  const r = rosterFromTemplate(json('data/orks/example-roster.json'), faction, 'r1');
  r.units[0].enhancementWeapon = 'Power Klaw';
  const code = await encodeRoster(r);
  assert.match(code, /^[A-Za-z0-9_-]+$/);
  assert.ok(code.length < 1500, `code is ${code.length} chars`);
  const back = await decodeRoster(code);
  assert.equal(back.id, undefined);
  assert.deepEqual({ ...back, units: back.units.map((u) => ({ ...u })) },
    { name: r.name, faction: r.faction, mode: r.mode, limit: r.limit, detachments: r.detachments,
      units: r.units.map((u) => ({ uid: u.uid, datasheetId: u.datasheetId, size: u.size, ptsOverride: u.ptsOverride ?? null,
        enhancement: u.enhancement ?? null, enhancementWeapon: u.enhancementWeapon ?? null, attachedTo: u.attachedTo ?? null,
        warlord: !!u.warlord, groups: u.groups })) });
});

test('damaged or foreign links are rejected; odd fields are dropped or defaulted', async () => {
  await assert.rejects(decodeRoster(''), /not a roster link/);
  await assert.rejects(decodeRoster('abc<script>'), /not a roster link/);
  await assert.rejects(decodeRoster('AAAA'), /damaged/);
  const evil = await encodeRoster({ name: 'x'.repeat(500), faction: 'orks', mode: 'evil', limit: -5, detachments: [1, 'war-horde'],
    units: [{ uid: 'a', datasheetId: 'boyz', size: 1e9, groups: [{ model: {}, count: 'x', weapons: [{}, 'Choppa'] }], warlord: 'yes' }, { uid: 'b' }] });
  const r = await decodeRoster(evil);
  assert.deepEqual([r.name, r.mode, r.limit, r.detachments], ['Shared roster', 'custom', 0, ['war-horde']]);
  assert.equal(r.units.length, 1);
  assert.deepEqual([r.units[0].size, r.units[0].warlord, r.units[0].groups], [1, false, [{ model: '', count: 0, weapons: ['Choppa'] }]]);
});
