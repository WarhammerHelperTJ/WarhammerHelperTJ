import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDice, formatDice, mean, min, max, roll, dist } from '../js/engine/dice.js';
import { activeEffects, applyEffects } from '../js/engine/effects.js';
import { computeAttack, followAlong } from '../js/engine/attack.js';

// --- fixtures ---
const gun = (o = {}) => ({ name: 'Gun', type: 'ranged', A: '1', skill: 4, S: 4, AP: 0, D: '1', abilities: [], ...o });
const blade = (o = {}) => gun({ name: 'Blade', type: 'melee', ...o });
const tgt = (o = {}) => ({ T: 4, Sv: 7, InSv: null, W: 1, models: 1, keywords: [], ...o });
const eff = (label, mods, o = {}) => ({ source: `test:${label}`, label, scope: 'unit', attack: 'any', mods, ...o });
const attack = (weapon, target = {}, { models = 1, ctx = {}, effects = [], groups } = {}) =>
  computeAttack({ type: weapon.type, groups: groups ?? [{ weapon, models, modelName: 'M' }], target: tgt(target), ctx, effects });
const card = (...a) => attack(...a).cards[0];
const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg ?? ''} ${a} != ${b}`);
const texts = (chips) => chips.map((c) => c.text);
const torrent = (o = {}) => gun({ skill: null, abilities: [{ name: 'TORRENT' }], ...o });

test('dice expressions', () => {
  assert.deepEqual(parseDice('2D6+2'), { n: 2, sides: 6, plus: 2 });
  assert.deepEqual(parseDice('3'), { n: 0, sides: 0, plus: 3 });
  assert.deepEqual(parseDice('D3'), { n: 1, sides: 3, plus: 0 });
  assert.deepEqual(parseDice('d6+1'), { n: 1, sides: 6, plus: 1 });
  assert.deepEqual(parseDice('D3+3'), { n: 1, sides: 3, plus: 3 });
  assert.throws(() => parseDice('x'));
  assert.equal(mean('2D6+2'), 9); assert.equal(min('2D6+2'), 4); assert.equal(max('2D6+2'), 14);
  assert.equal(mean('D3+3'), 5); assert.equal(mean('3'), 3);
  assert.equal(roll('2D6+2', () => 0.999), 14);
  assert.equal(roll('D3+3', () => 0), 4);
  assert.equal(formatDice({ n: 1, sides: 3, plus: -1 }), 'D3-1');
  close([...dist('2D6')].reduce((s, [v, p]) => s + v * p, 0), 7);
});

// Source 2.3: Meganobz Power Klaw ×2, riled up, War Horde, vs T4 Sv3+ W2 ×5.
const klaw = blade({ name: 'Power Klaw', A: '3', skill: 3, S: 10, AP: -2, D: '2' });
const klawEffects = [
  eff("Krumpin' Time", { hit: 1 }, { when: { phase: 'fight', riledUp: true } }),
  eff('Get Stuck In (War Horde)', { abilities: ['SUSTAINED HITS 1'] }, { attack: 'melee' }),
];
const klawTarget = { T: 4, Sv: 3, W: 2, models: 5, keywords: ['INFANTRY'] };
const klawCtx = { phase: 'fight', riledUp: true };

test('source 2.3 Power Klaw example end to end', () => {
  const r = attack(klaw, klawTarget, { models: 2, ctx: klawCtx, effects: klawEffects });
  assert.equal(r.cards.length, 1);
  const c = r.cards[0];
  assert.deepEqual(c.weapons, [{ name: 'Power Klaw', models: 2, modelName: 'M', A: '3' }]);
  assert.equal(c.attacks.total, 6); assert.equal(c.attacks.perModel, 3); assert.equal(c.attacks.models, 2);
  assert.deepEqual(c.attacks.bonus, [], 'no CLEAVE on the weapon -> no cleave chip');
  assert.equal(c.hit.skill, 3); assert.equal(c.hit.need, 2); assert.equal(c.hit.crit, 6); assert.equal(c.hit.sustained, 1);
  assert.deepEqual(c.hit.chips[0], { text: '+1 hit', source: "Krumpin' Time" });
  assert.equal(c.hit.chips[1].source, 'Get Stuck In (War Horde)');
  assert.equal(c.wound.need, 2); assert.equal(c.wound.crit, 6); assert.equal(c.wound.base, 2);
  assert.equal(c.save.need, 5);
  assert.equal(c.damage.expr, '2'); assert.equal(c.damage.spill, false);
  assert.deepEqual(r.after, []);
  // hits   = 6 × (5/6 + 1/6·1)                    = 6
  // wounds = 6 × (non-crit 4/6 + crit 1/6 + sustained 1/6) × 5/6 = 5
  // unsaved = 5 × 4/6 = 10/3; damage = 20/3
  close(c.expected.hits, 6); close(c.expected.wounds, 5);
  close(c.expected.unsaved, 10 / 3); close(c.expected.damage, 20 / 3);
  // kills: D2 vs W2 = one model per unsaved wound, capped at 5 -> E[min(N, 5)], N = sum of 6 dice of K.
  // per die q = P(hit wounds and is unsaved) = 5/6·4/6 = 5/9; K: 0 → 1/6 + 4/6·4/9 + 1/6·(4/9)², 1 → 4/6·5/9 + 1/6·2·(5/9)(4/9), 2 → 1/6·(5/9)²
  const q = 5 / 9, K = [1 / 6 + (4 / 6) * (1 - q) + (1 / 6) * (1 - q) ** 2, (4 / 6) * q + (1 / 6) * 2 * q * (1 - q), (1 / 6) * q * q];
  let N = [1];
  for (let i = 0; i < 6; i++) { const t = new Array(N.length + 2).fill(0); N.forEach((a, x) => K.forEach((b, y) => { t[x + y] += a * b; })); N = t; }
  close(c.expected.kills, N.reduce((s, p, n) => s + p * Math.min(n, 5), 0), 'kills');
  // not riled up -> no Krumpin' Time
  assert.equal(card(klaw, klawTarget, { models: 2, ctx: { phase: 'fight' }, effects: klawEffects }).hit.need, 3);
});

test('Power Klaw variant with CLEAVE 1 vs 4 and vs 5 models', () => {
  const cleaver = { ...klaw, abilities: [{ name: 'CLEAVE', value: 1 }] };
  const four = card(cleaver, { ...klawTarget, models: 4 }, { models: 2, ctx: klawCtx, effects: klawEffects });
  assert.equal(four.attacks.total, 6);
  assert.deepEqual(four.attacks.bonus, [{ text: '+0 Cleave 1: target <5 models', source: 'weapon' }]);
  const five = card(cleaver, klawTarget, { models: 2, ctx: klawCtx, effects: klawEffects });
  assert.equal(five.attacks.total, 8);
  assert.deepEqual(texts(five.attacks.bonus), ['+2 Cleave 1']);
  close(five.expected.hits, 8);
});

test('wound chart: all five bands and the ≤ T/2 boundary', () => {
  for (const [S, T, need] of [[8, 4, 2], [5, 4, 3], [4, 4, 4], [3, 4, 5], [2, 4, 6], [3, 5, 5], [2, 5, 6], [9, 4, 2]]) {
    assert.equal(card(gun({ S }), { T }).wound.need, need, `S${S} vs T${T}`);
  }
  assert.equal(card(gun({ S: 4 }), { T: 4 }, { effects: [eff('Big', { s: 2 })] }).wound.need, 3, '+2 S before the chart');
});

test('save: AP, invulnerable, no save, +1 AP effect', () => {
  assert.equal(card(gun({ AP: -1 }), { Sv: 3 }).save.need, 4);
  const inv = card(gun({ AP: -3 }), { Sv: 3, InSv: 4 }).save;
  assert.equal(inv.need, 4); assert.deepEqual(texts(inv.chips), ['invulnerable 4+']);
  assert.equal(card(gun({ AP: -3 }), { Sv: 3, InSv: 5 }).save.need, 5);
  assert.equal(card(gun({ AP: -1 }), { Sv: 2, InSv: 4 }).save.need, 3, 'armour better than invuln');
  const none = card(torrent({ A: '6', S: 8, AP: -2 }), { Sv: 5 });
  assert.equal(none.save.need, null);
  close(none.expected.unsaved, 6 * 5 / 6, 'no save: every wound is unsaved');
  const ap = card(gun({ AP: -1 }), { Sv: 3 }, { effects: [eff('Killchoppa', { ap: 1 })] }).save;
  assert.equal(ap.AP, -2); assert.equal(ap.need, 5); assert.deepEqual(ap.chips, [{ text: '+1 AP', source: 'Killchoppa' }]);
});

test('torrent: auto-hit, no crits, random A', () => {
  const c = card(torrent({ A: 'D6', abilities: [{ name: 'TORRENT' }, { name: 'SUSTAINED HITS', value: 1 }] }), {}, { models: 2 });
  assert.equal(c.hit.auto, true); assert.equal(c.hit.need, null); assert.equal(c.hit.crit, null);
  assert.equal(c.hit.sustained, 0, 'no crits -> sustained never triggers');
  assert.deepEqual(c.hit.rerolls, []);
  assert.equal(c.attacks.expr, 'D6'); assert.equal(c.attacks.total, null); close(c.attacks.mean, 7);
  close(c.expected.hits, 7);
});

test('rapid fire, blast, random A, +1 A', () => {
  const shoota = gun({ A: '2', abilities: [{ name: 'RAPID FIRE', value: 1 }] });
  const half = card(shoota, { halfRange: true }, { models: 3 });
  assert.equal(half.attacks.total, 9); assert.deepEqual(texts(half.attacks.bonus), ['+3 Rapid Fire 1']);
  const far = card(shoota, {}, { models: 3 });
  assert.equal(far.attacks.total, 6); assert.deepEqual(texts(far.attacks.bonus), ['+0 Rapid Fire 1: target not within half range']);
  const blasta = gun({ A: '2', abilities: [{ name: 'BLAST', value: 2 }] });
  assert.equal(card(blasta, { models: 10 }).attacks.total, 6, '2 + 2 per 5 models × 2');
  assert.equal(card(blasta, { models: 14 }).attacks.total, 6, 'round down');
  assert.deepEqual(texts(card(blasta, { models: 4 }).attacks.bonus), ['+0 Blast 2: target <5 models']);
  assert.equal(card(gun({ A: '3', abilities: [{ name: 'BLAST' }] }), { models: 5 }).attacks.total, 4, 'BLAST without number = 1');
  const pointBlank = torrent({ A: 'D3+3' });
  const pb = card(pointBlank, {}, { models: 2 });
  assert.equal(pb.attacks.expr, 'D3+3'); assert.equal(pb.attacks.total, null); close(pb.attacks.mean, 10, '2 × 5');
  const plus = card(pointBlank, {}, { models: 2, effects: [eff('Waaagh', { a: 1 })] });
  assert.equal(plus.attacks.expr, 'D3+4'); close(plus.attacks.mean, 12, '2 × 6');
  assert.deepEqual(plus.attacks.bonus, [{ text: '+1 A', source: 'Waaagh' }]);
  assert.equal(card(gun({ A: '2' }), {}, { models: 3, effects: [eff('Waaagh', { a: 1 })] }).attacks.total, 9, '+1 A per model');
});

test('sustained + lethal expected values, lethal vs keyword condition', () => {
  const w = gun({ A: '6', abilities: [{ name: 'SUSTAINED HITS', value: 2 }, { name: 'LETHAL HITS' }] });
  const c = card(w, { models: 20 });
  // BS4: p(hit) 1/2, p(crit) 1/6. hits = 6 × (1/2 + 1/6·2) = 5
  // rolled to wound per die = 1/3 (non-crit) + 2/6 (sustained) = 2/3; auto-wound per die = 1/6
  // wounds = 6 × (2/3 · 1/2 + 1/6) = 3; no save -> unsaved 3; 20 W1 models -> kills 3
  close(c.expected.hits, 5); close(c.expected.wounds, 3); close(c.expected.unsaved, 3); close(c.expected.kills, 3);
  assert.equal(c.hit.lethal, true); assert.equal(c.hit.sustained, 2);
  const shoota = gun({ abilities: [{ name: 'LETHAL HITS', notVs: ['MONSTER', 'VEHICLE'] }] });
  assert.equal(card(shoota, { keywords: ['VEHICLE'] }).hit.lethal, false);
  assert.equal(card(shoota, { keywords: ['INFANTRY'] }).hit.lethal, true);
  const crit5 = card(gun({ A: '6', abilities: [{ name: 'SUSTAINED HITS', value: 1 }] }), {}, { effects: [eff('Crit5', { critHit: 5 })] });
  assert.equal(crit5.hit.crit, 5); close(crit5.expected.hits, 6 * (1 / 2 + 2 / 6), 'crits on 5+');
});

test('anti-X crit threshold', () => {
  const w = torrent({ A: '6', S: 4, abilities: [{ name: 'TORRENT' }, { name: 'ANTI', onlyVs: ['MONSTER', 'VEHICLE'], value: 4 }] });
  const vs = card(w, { T: 8, keywords: ['VEHICLE'] });
  assert.equal(vs.wound.crit, 4); assert.equal(vs.wound.need, 4, 'S4 vs T8 is 6+, anti makes 4+ a crit wound');
  close(vs.expected.wounds, 3);
  const other = card(w, { T: 8, keywords: ['INFANTRY'] });
  assert.equal(other.wound.crit, 6); assert.equal(other.wound.need, 6); close(other.expected.wounds, 1);
  const two = card({ ...w, abilities: [...w.abilities, { name: 'ANTI', onlyVs: ['VEHICLE'], value: 2 }] }, { T: 8, keywords: ['VEHICLE'] });
  assert.equal(two.wound.crit, 2, 'lowest matching anti wins');
});

test('devastating wounds', () => {
  const w = torrent({ A: '6', D: '2', abilities: [{ name: 'TORRENT' }, { name: 'DEVASTATING WOUNDS' }] });
  const c = card(w, { Sv: 2, W: 3, models: 10 });
  assert.equal(c.wound.devastating, true);
  // per hit: normal wound 1/2 − 1/6 = 1/3 × fail Sv2+ 1/6 = 1/18, crit wound 1/6 skips save -> 4/18 = 2/9
  close(c.expected.unsaved, 6 * 2 / 9); close(c.expected.damage, 6 * 2 / 9 * 2);
  const f = followAlong(c, { attacks: 6, wounds: 3, critWounds: 1 });
  assert.deepEqual(f, { damagePerFail: '2', hitDice: 0, autoWounds: 0, woundDice: 6, saveDice: 2, devastatingCrits: 1, mortalWounds: 2 });
});

test('twin-linked and re-roll hit rolls of 1', () => {
  const c = card(torrent({ A: '6', abilities: [{ name: 'TORRENT' }, { name: 'TWIN-LINKED' }] }));
  // 4+ to wound, full re-roll: 1/2 + 1/2·1/2 = 3/4
  close(c.expected.wounds, 4.5);
  assert.deepEqual(c.wound.rerolls[0], { text: 'Re-roll wound rolls', source: 'weapon' });
  assert.equal(c.wound.rerolls.at(-1).text, 'Command Re-roll (1CP): one die');
  const ones = card(gun({ A: '6' }), {}, { effects: [eff('Mek', { rerollHit: 'ones' })] });
  // 4+ to hit, re-roll 1s: 1/2 + 1/2·1/6 = 7/12
  close(ones.expected.hits, 3.5);
  assert.deepEqual(ones.hit.rerolls[0], { text: 'Re-roll hit rolls of 1', source: 'Mek' });
});

test('melta, heavy, lance', () => {
  const melta = gun({ D: 'D6', abilities: [{ name: 'MELTA', value: 2 }] });
  const near = card(melta, { halfRange: true });
  assert.equal(near.damage.expr, 'D6+2'); close(near.damage.mean, 5.5);
  const far = card(melta);
  assert.equal(far.damage.expr, 'D6'); assert.deepEqual(texts(far.damage.chips), ['+0 D Melta 2: target not within half range']);
  const heavy = gun({ skill: 5, abilities: [{ name: 'HEAVY' }] });
  assert.equal(card(heavy, {}, { ctx: { stationary: true } }).hit.need, 4);
  assert.equal(card(heavy).hit.need, 5);
  const lance = blade({ abilities: [{ name: 'LANCE' }] });
  assert.equal(card(lance, {}, { ctx: { charged: true } }).wound.need, 3);
  assert.equal(card(lance).wound.need, 4);
});

test('cover vs ignores cover', () => {
  const c = card(gun(), { cover: true });
  assert.equal(c.hit.need, 5); assert.deepEqual(c.hit.chips, [{ text: '-1 BS: cover', source: 'target in cover' }]);
  assert.equal(card(gun({ abilities: [{ name: 'IGNORES COVER' }] }), { cover: true }).hit.need, 4);
  assert.equal(card(blade(), { cover: true }).hit.need, 4, 'cover is ranged only');
  assert.equal(card(gun({ skill: 3 }), { cover: true }, { effects: [eff('Plus', { hit: 1 })] }).hit.need, 3, 'cover counts in the net');
  const psy = card(gun({ abilities: [{ name: 'PSYCHIC' }] }), { cover: true });
  assert.equal(psy.hit.need, 4); assert.deepEqual(texts(psy.hit.chips), ['Psychic: ignores -1 BS: cover']);
});

test('snap shooting (Fire Overwatch)', () => {
  const w = gun({ A: '6', skill: 3, abilities: [{ name: 'SUSTAINED HITS', value: 1 }] });
  const c = card(w, {}, { ctx: { overwatch: true }, effects: [eff('Plus', { hit: 1 }), eff('RR', { rerollHit: 'all' })] });
  assert.equal(c.hit.only6, true); assert.equal(c.hit.need, 6); assert.equal(c.hit.crit, null);
  assert.equal(c.hit.sustained, 0); assert.deepEqual(c.hit.rerolls, [], 'no hit re-rolls, not even Command Re-roll');
  close(c.expected.hits, 1);
});

test('modifier cap: net ±1, +1 and -1 cancel', () => {
  const heavy = gun({ abilities: [{ name: 'HEAVY' }] });
  const opts = { ctx: { stationary: true }, effects: [eff('Plus', { hit: 1 })] };
  const on = card(heavy, {}, opts);
  assert.equal(on.hit.need, 3); assert.ok(texts(on.hit.chips).includes('net +2 capped at +1'));
  const minus = { effects: [eff('Minus', { hit: -1 })] };
  assert.equal(card(gun({ skill: 5 }), { cover: true }, minus).hit.need, 6);
  assert.equal(card(gun(), {}, { effects: [eff('Plus', { hit: 1 }), eff('Minus', { hit: -1 })] }).hit.need, 4, '+1 and -1 cancel');
  const lance = blade({ abilities: [{ name: 'LANCE' }] });
  const wOpts = { ctx: { charged: true }, effects: [eff('Wplus', { wound: 1 })] };
  assert.equal(card(lance, {}, wOpts).wound.need, 3);
  assert.equal(card(gun({ skill: 2 }), {}, { effects: [eff('Plus', { hit: 1 })] }).hit.need, 2, 'never better than 2+');
});

test('duplicate ability from two sources keeps the highest', () => {
  const w = blade({ abilities: [{ name: 'SUSTAINED HITS', value: 1 }] });
  const c = card(w, {}, { effects: [eff('Two', { abilities: ['Sustained Hits 2'] })] });
  assert.equal(c.hit.sustained, 2);
  assert.deepEqual(c.hit.chips, [{ text: 'Sustained Hits 2: +2 hit per crit', source: 'weapon + Two' }]);
  assert.equal(card({ ...w, abilities: [{ name: 'SUSTAINED HITS', value: 2 }] }, {}, { effects: [eff('One', { abilities: ['SUSTAINED HITS 1'] })] }).hit.sustained, 2);
  const cond = card(blade(), { keywords: ['VEHICLE'] }, { effects: [eff('L', { abilities: ['LETHAL HITS: non-MONSTER/VEHICLE'] })] });
  assert.equal(cond.hit.lethal, false, 'effect ability with failing keyword condition is dropped');
});

test('bump: +1 to an existing ability, else gain it at 1', () => {
  const dakka = eff('Close-Range Dakka', { bump: { 'RAPID FIRE': 1 } }, { attack: 'ranged' });
  const rf = card(gun({ A: '2', abilities: [{ name: 'RAPID FIRE', value: 1 }] }), { halfRange: true }, { effects: [dakka] });
  assert.equal(rf.attacks.total, 4); assert.deepEqual(rf.attacks.bonus, [{ text: '+2 Rapid Fire 2', source: 'weapon + Close-Range Dakka (+1)' }]);
  assert.equal(card(gun({ A: '2' }), { halfRange: true }, { effects: [dakka] }).attacks.total, 3);
  const mow = eff("Mow 'Em Down", { bump: { CLEAVE: 1 } }, { attack: 'melee' });
  assert.equal(card(blade({ A: '5', abilities: [{ name: 'CLEAVE', value: 1 }] }), { models: 5 }, { effects: [mow] }).attacks.total, 7);
});

test('damage reduction floors at 1', () => {
  assert.equal(card(gun({ D: '1' }), { dmgReduction: 1 }).damage.expr, '1');
  assert.equal(card(gun({ D: '3' }), { dmgReduction: 1 }).damage.expr, '2');
  const r = card(gun({ D: 'D3' }), { dmgReduction: 1 }).damage;
  assert.equal(r.expr, 'D3-1'); close(r.mean, 4 / 3, '(1+1+2)/3');
  assert.deepEqual(texts(r.chips), ['-1 D (min 1)']);
});

test('feel no pain and no spill-over kills', () => {
  // A3 torrent, S8 vs T4 (2+), no save: unsaved = 3 × 5/6 = 2.5
  const fnp = card(torrent({ A: '3', S: 8, D: '2' }), { fnp: 5, W: 3, models: 3 });
  assert.equal(fnp.damage.fnp, 5);
  close(fnp.expected.damage, 2.5 * 2 * 4 / 6, 'each wound ignored on 5+');
  // D3 vs W2: every unsaved wound kills one model (excess lost)
  const d3 = card(torrent({ A: '3', S: 8, D: '3' }), { W: 2, models: 10 });
  close(d3.expected.kills, 2.5);
  // D1 vs W3, one model: needs all 3 wounds = (5/6)^3
  const d1 = card(torrent({ A: '3', S: 8, D: '1' }), { W: 3, models: 1 });
  close(d1.expected.kills, 125 / 216); close(d1.expected.damage, 2.5);
  // capped at target.models
  close(card(torrent({ A: '3', S: 8, D: '1' }), { W: 1, models: 1 }).expected.kills, 1 - (1 / 6) ** 3);
});

test('hazard rolls and merging', () => {
  const blasta = gun({ name: 'Kustom Mega-blasta', A: '3', S: 9, AP: -2, D: '3', skill: 5, abilities: [{ name: 'HAZARDOUS' }] });
  const shoota = gun({ name: 'Shoota', A: '2', skill: 5 });
  const r = attack(blasta, {}, { groups: [{ weapon: blasta, models: 2, modelName: 'A' }, { weapon: shoota, models: 1, modelName: 'B' }] });
  assert.equal(r.cards.length, 2);
  assert.equal(r.after[0].rolls, 2); assert.match(r.after[0].text, /1 mortal wound to/);
  const mv = attack(blasta, {}, { ctx: { allMonsterVehicle: true }, groups: [{ weapon: blasta, models: 1, modelName: 'A' }] });
  assert.match(mv.after[0].text, /3 mortal wounds/);

  const boy = gun({ name: 'Shoota', A: '2', skill: 5, abilities: [{ name: 'RAPID FIRE', value: 1 }] });
  const nob = gun({ name: 'Kombi-rokkit', profile: 'Shoota', A: '2', skill: 5, abilities: [{ name: 'RAPID FIRE', value: 1 }] });
  const klawNob = gun({ name: 'Big', A: '3', skill: 5, abilities: [{ name: 'RAPID FIRE', value: 1 }] });
  const m = attack(boy, { halfRange: true }, { groups: [{ weapon: boy, models: 9, modelName: 'Boy' }, { weapon: nob, models: 1, modelName: 'Nob' }, { weapon: klawNob, models: 1, modelName: 'Nob' }] });
  assert.equal(m.cards.length, 1, 'same skill/S/AP/D/abilities merge, fixed A may differ');
  const c = m.cards[0];
  assert.deepEqual(c.weapons.map((w) => [w.name, w.models]), [['Shoota', 9], ['Kombi-rokkit - Shoota', 1], ['Big', 1]]);
  // 9×2 + 1×2 + 1×3 = 23, plus Rapid Fire 1 × 11 models
  assert.equal(c.attacks.base, 23); assert.equal(c.attacks.total, 34); assert.equal(c.attacks.perModel, null);
  const diff = attack(boy, {}, { groups: [{ weapon: boy, models: 1 }, { weapon: { ...boy, S: 5 }, models: 1 }] });
  assert.equal(diff.cards.length, 2);
});

test('followAlong', () => {
  const c = card(klaw, klawTarget, { models: 2, ctx: klawCtx, effects: klawEffects });
  assert.deepEqual(followAlong(c, { attacks: 6 }), { damagePerFail: '2', hitDice: 6 });
  assert.deepEqual(followAlong(c, { hits: 5, crits: 1 }), { damagePerFail: '2', autoWounds: 0, woundDice: 6 });
  const lethal = card(klaw, klawTarget, { models: 2, ctx: klawCtx, effects: [...klawEffects, eff('Hit Em', { abilities: ['LETHAL HITS'] })] });
  const f = followAlong(lethal, { hits: 5, crits: 2, wounds: 3 });
  assert.equal(f.autoWounds, 2); assert.equal(f.woundDice, 5, '3 non-crit + 2 sustained'); assert.equal(f.saveDice, 5);
  const t = followAlong(card(torrent({ A: 'D6' })), { attacks: 4 });
  assert.equal(t.hitDice, 0); assert.equal(t.woundDice, 4);
  const rd = followAlong(card(torrent({ D: 'D3', abilities: [{ name: 'TORRENT' }, { name: 'DEVASTATING WOUNDS' }] })), { wounds: 2, critWounds: 1 });
  assert.equal(rd.mortalWounds, null); assert.equal(rd.devastatingCrits, 1); assert.equal(rd.damagePerFail, 'D3');
});

test('activeEffects: scope, attack type, when, manual', () => {
  const list = [
    eff('unit', { hit: 1 }),
    eff('melee', { hit: 1 }, { attack: 'melee' }),
    eff('klaw', { s: 1 }, { scope: 'weapon:Power Klaw' }),
    eff('boss', { ap: 1 }, { scope: 'model', model: 'Warboss' }),
    eff('vs', { wound: 1 }, { when: { targetHas: ['MONSTER', 'VEHICLE'] } }),
    eff('not', { wound: 1 }, { when: { targetNot: ['VEHICLE'] } }),
    eff('big', { a: 1 }, { when: { minModels: 11, unitHas: ['MOB'] } }),
    eff('strat', { abilities: ['LETHAL HITS'] }, { manual: true }),
    eff('obj', { hit: 1 }, { when: { onObjective: true, charged: true } }),
  ];
  const names = (o) => activeEffects(list, o).map((e) => e.label);
  const base = { type: 'melee', weapon: { name: 'Power Klaw' }, modelName: 'Meganob', target: { keywords: ['VEHICLE'] } };
  assert.deepEqual(names(base), ['unit', 'melee', 'klaw', 'vs']);
  assert.deepEqual(names({ ...base, type: 'ranged', weapon: { name: 'Shoota' }, modelName: 'Warboss', target: { keywords: ['INFANTRY'] } }), ['unit', 'boss', 'not']);
  assert.ok(names({ ...base, ctx: { enabled: ['test:strat'] } }).includes('strat'));
  assert.ok(names({ ...base, ctx: { modelCount: 11 }, unitKeywords: ['MOB'] }).includes('big'));
  assert.ok(!names({ ...base, ctx: { modelCount: 10 }, unitKeywords: ['MOB'] }).includes('big'));
  assert.ok(names({ ...base, ctx: { charged: true }, target: { onObjective: true } }).includes('obj'));
  assert.ok(!names({ ...base, ctx: { charged: true } }).includes('obj'));
  assert.equal(applyEffects(gun({ S: 4 }), activeEffects(list, base), {}).S, 5);
});

// ---------- whole unit ----------
import { summarize } from '../js/engine/attack.js';

test('summarize: one card matches its own expected kills; sure kills give a sure wipe', () => {
  const res = attack(gun({ A: '6', S: 8, AP: -3, D: '2' }), { T: 4, Sv: 4, W: 2, models: 3 }, { models: 2 });
  const s = summarize(res.cards, { W: 2, models: 3 });
  close(s.kills, res.cards[0].expected.kills);
  assert.ok(s.wipe > 0 && s.wipe < 1);
  // torrent, auto-wound vs T1, no save, 1 damage vs 2 models of W1: 4 attacks always kill both
  const sure = attack(torrent({ A: '4', S: 10, AP: -6, D: '1' }), { T: 1, Sv: 7, W: 1, models: 2 });
  const w = summarize(sure.cards, { W: 1, models: 2 });
  close(w.wipe, (1 - 1 / 6) ** 0 * 1 - (1 / 6) ** 4 - 4 * (5 / 6) * (1 / 6) ** 3, 1e-9);
});

test('summarize: two cards carry a wounded model over; kills never exceed the unit', () => {
  const t = { T: 4, Sv: 7, W: 3, models: 2 };
  const two = [attack(gun({ A: '10', S: 8, D: '1' }), t).cards[0], attack(blade({ A: '10', S: 8, D: '1', skill: 2 }), t).cards[0]];
  const s = summarize(two, t);
  assert.ok(s.kills <= 2 + 1e-9 && s.kills > Math.max(two[0].expected.kills, two[1].expected.kills));
  close(s.unsaved, two[0].expected.unsaved + two[1].expected.unsaved);
});
