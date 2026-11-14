// computeAttack(): the dice cards for one shooting/fight activation. Pure. Rules: source section 3 + Part A.
import { parseDice, formatDice, isRandom, dist } from './dice.js';
import { activeEffects, applyEffects, abilityText } from './effects.js';

const CMD = { text: 'Command Re-roll (1CP): one die', source: 'Core stratagem' };

// Count distributions as arrays: index = count, value = probability.
const conv = (a, b) => {
  const r = new Array(a.length + b.length - 1).fill(0);
  a.forEach((x, i) => { if (x) b.forEach((y, j) => { r[i + j] += x * y; }); });
  return r;
};
const bern = (p) => [1 - p, p];
const pow = (a, n) => { let r = [1]; for (let i = 0; i < n; i++) r = conv(r, a); return r; };
const mix = (parts) => {
  const r = [];
  for (const [w, poly] of parts) poly.forEach((x, i) => { r[i] = (r[i] ?? 0) + w * x; });
  return Array.from(r, (x) => x ?? 0);
};
const ev = (poly) => poly.reduce((s, x, i) => s + x * i, 0);
const fromMap = (m) => mix([...m].map(([v, p]) => [p, [...new Array(v).fill(0), 1]]));

// Sum modifiers, one chip each; the net is clamped to ±1 (so +1 and -1 cancel out).
function net(mods, chips) {
  for (const m of mods) chips.push({ text: m.text, source: m.source });
  const n = mods.reduce((s, m) => s + m.v, 0);
  if (Math.abs(n) <= 1) return n;
  chips.push({ text: `net ${n > 0 ? '+' : ''}${n} capped at ${n > 0 ? '+1' : '-1'}`, source: 'Modifier cap' });
  return Math.sign(n);
}

// Success / crit chance of one die, incl. certain re-rolls (failed dice only).
function odds(need, crit, rr) {
  let p = (7 - need) / 6, c = crit ? (7 - crit) / 6 : 0;
  if (rr === 'all') { c += (1 - p) * c; p += (1 - p) * p; } else if (rr === 'ones') { c += c / 6; p += p / 6; }
  return { p, c };
}
const bestRr = (list) => (list.some((r) => r.v === 'all') ? 'all' : list.length ? 'ones' : null);
const rrChip = (r, what) => ({ text: r.v === 'all' ? `Re-roll ${what} rolls` : `Re-roll ${what} rolls of 1`, source: r.source });

const displayName = (w) => (w.profile ? `${w.name} - ${w.profile}` : w.name);

const ignoring = (e, roll) => e.ignoreMods.filter((x) => x.rolls.includes(roll));

// One weapon group -> everything except counts. `key` decides merging.
function resolve(weapon, type, active, target, ctx) {
  const e = applyEffects(weapon, active, target);
  const ab = (n) => e.abilities.get(n);
  const val = (n) => ab(n).value ?? 1;
  const src = (n) => ab(n).sources.join(' + ');
  const chip = (n, text) => ({ text, source: src(n) });
  const ranged = type === 'ranged';
  const fives = Math.floor((target.models ?? 1) / 5);

  // ATTACKS: bonus dice per weapon (= per model)
  const bonus = [];
  const b = (n, per, why) => bonus.push({ text: abilityText(ab(n)), per, why: per ? null : why, source: src(n) });
  if (ab('RAPID FIRE')) b('RAPID FIRE', target.halfRange ? val('RAPID FIRE') : 0, 'target not within half range');
  if (ab('BLAST')) b('BLAST', val('BLAST') * fives, 'target <5 models');
  if (!ranged && ab('CLEAVE')) b('CLEAVE', val('CLEAVE') * fives, 'target <5 models');

  // HIT
  let hit, ho;
  if (weapon.skill == null || ab('TORRENT')) {
    hit = { auto: true, need: null, crit: null, skill: null, chips: [{ text: 'Torrent: auto-hit, no crits', source: ab('TORRENT') ? src('TORRENT') : 'weapon' }],
      rerolls: [], sustained: 0, lethal: false, only6: false, onlyCrits: false };
    ho = { p: 1, c: 0 };
  } else if (ctx.overwatch) {
    hit = { auto: false, need: 6, crit: null, skill: weapon.skill, chips: [{ text: 'Snap shooting: only unmodified 6s hit, not crits; no hit re-rolls', source: 'Fire Overwatch' }],
      rerolls: [], sustained: 0, lethal: false, only6: true, onlyCrits: false };
    ho = { p: 1 / 6, c: 0 };
  } else {
    const chips = [], mods = [...e.hit];
    if (ranged && target.cover) {
      if (ab('IGNORES COVER')) chips.push(chip('IGNORES COVER', 'Ignores Cover: no cover penalty'));
      else mods.push({ v: -1, text: '-1 BS: cover', source: 'target in cover' });
    }
    if (ranged && ctx.stationary && ab('HEAVY')) mods.push({ v: 1, text: '+1 hit: Heavy', source: src('HEAVY') });
    // "can ignore any or all modifiers": ignore the negative ones (Psychic weapons, ignoreMods effects)
    const ig = [...(ab('PSYCHIC') ? [{ label: 'Psychic', source: src('PSYCHIC') }] : []), ...ignoring(e, 'hit')];
    const used = ig.length ? mods.filter((m) => m.v > 0) : mods;
    if (ig.length) for (const m of mods) if (m.v < 0) chips.push({ text: `${ig[0].label}: ignores ${m.text}`, source: ig[0].source });
    const n = net(used, chips);
    const crit = Math.max(2, Math.min(6, ...e.critHit.map((c) => c.v)));
    for (const c of e.critHit) if (c.v < 6) chips.push({ text: c.text, source: c.source });
    const raw = weapon.skill - n;
    if (raw > 6) chips.push({ text: `only crits hit (${crit}+)`, source: 'modifiers' });
    const sustained = ab('SUSTAINED HITS') ? val('SUSTAINED HITS') : 0;
    const lethal = !!ab('LETHAL HITS');
    if (sustained) chips.push(chip('SUSTAINED HITS', `${abilityText(ab('SUSTAINED HITS'))}: +${sustained} hit per crit`));
    if (lethal) chips.push(chip('LETHAL HITS', 'Lethal Hits: crit auto-wounds'));
    const rerolls = [...e.rerollHit.map((r) => rrChip(r, 'hit')), CMD];
    const need = Math.max(2, Math.min(raw, crit));
    hit = { auto: false, need, crit, skill: weapon.skill, chips, rerolls, sustained, lethal, only6: false, onlyCrits: raw > 6 };
    ho = odds(need, crit, bestRr(e.rerollHit));
  }

  // WOUND
  const S = e.S, T = Math.max(1, target.T + e.targetT);
  const base = S >= 2 * T ? 2 : S > T ? 3 : S === T ? 4 : 2 * S <= T ? 6 : 5;
  const wChips = [...e.chips.wound], wMods = [...e.wound];
  if (ab('LANCE') && ctx.charged) wMods.push({ v: 1, text: '+1 wound: Lance', source: src('LANCE') });
  const wIg = ignoring(e, 'wound');
  if (wIg.length) for (const m of wMods) if (m.v < 0) wChips.push({ text: `${wIg[0].label}: ignores ${m.text}`, source: wIg[0].source });
  const wn = net(wIg.length ? wMods.filter((m) => m.v > 0) : wMods, wChips);
  const wCrits = [...(ab('ANTI') ? [ab('ANTI').value] : []), ...e.critWound.map((c) => c.v)];
  const wCrit = wCrits.length ? Math.max(2, Math.min(6, ...wCrits)) : 6;
  if (ab('ANTI')) wChips.push(chip('ANTI', `${abilityText(ab('ANTI'))}: crit wound on ${Math.max(2, Math.min(6, ab('ANTI').value))}+`));
  for (const c of e.critWound) wChips.push({ text: c.text, source: c.source });
  const devastating = !!ab('DEVASTATING WOUNDS');
  if (devastating) wChips.push(chip('DEVASTATING WOUNDS', 'Devastating Wounds: crit wound = mortal wounds equal to D, no save'));
  const wRr = [...(ab('TWIN-LINKED') ? [{ v: 'all', source: src('TWIN-LINKED') }] : []), ...e.rerollWound];
  const wRaw = base - wn, wNeed = Math.max(2, Math.min(wRaw, wCrit));
  if (wRaw > 6) wChips.push({ text: `only crits wound (${wCrit}+)`, source: 'modifiers' });
  const wound = { need: wNeed, crit: wCrit, base, S, T, chips: wChips, rerolls: [...wRr.map((r) => rrChip(r, 'wound')), CMD], devastating, onlyCrits: wRaw > 6 };
  const wo = odds(wNeed, wCrit, bestRr(wRr));

  // SAVE: better of armour (worsened by AP) and invulnerable; worse than 6+ = no save
  const Sv = target.Sv ?? 7, InSv = target.InSv ?? null, armour = Sv - e.AP;
  const sChips = [...e.chips.save];
  let sNeed = armour;
  if (InSv && InSv < armour) { sNeed = InSv; sChips.push({ text: `invulnerable ${InSv}+`, source: 'target' }); }
  if (sNeed > 6) sNeed = null;
  const save = { need: sNeed, Sv, AP: e.AP, InSv, chips: sChips };
  const pf = sNeed == null ? 1 : (sNeed - 1) / 6;

  // DAMAGE: D + melta + effects − reduction, min 1 per roll; FNP per wound
  const d0 = parseDice(e.D), dChips = [...e.chips.damage];
  let plus = d0.plus;
  if (ab('MELTA')) {
    const x = target.halfRange ? val('MELTA') : 0;
    plus += x;
    dChips.push(chip('MELTA', `+${x} D ${abilityText(ab('MELTA'))}${x ? '' : ': target not within half range'}`));
  }
  const red = target.dmgReduction ?? 0;
  if (red) { plus -= red; dChips.push({ text: `-${red} D (min 1)`, source: 'target' }); }
  const dd = { ...d0, plus };
  const dmg = new Map();
  for (const [x, p] of dist(dd)) dmg.set(Math.max(1, x), (dmg.get(Math.max(1, x)) ?? 0) + p);
  const fnp = target.fnp ?? null;
  if (fnp) dChips.push({ text: `Feel No Pain ${fnp}+`, source: 'target' });
  const keep = fnp ? (fnp - 1) / 6 : 1;
  const eff = mix([...dmg].map(([y, p]) => [p, pow(bern(keep), y)]));   // wounds actually lost per damaging event
  const damage = { expr: isRandom(dd) ? formatDice(dd) : String(Math.max(1, plus)), mean: [...dmg].reduce((s, [y, p]) => s + y * p, 0), chips: dChips, fnp, spill: false };

  const abilities = [...e.abilities.values()].map(abilityText).sort();
  const key = JSON.stringify({ A: isRandom(e.A) ? e.A : 'fixed', a: e.chips.attacks, bonus, hit, wound, save, damage, abilities });
  return { key, A: e.A, aChips: e.chips.attacks, bonus, hit, wound, save, damage, hazardous: !!ab('HAZARDOUS'),
    m: { ph: ho.p, pc: ho.c, pw: wo.p, pcw: wo.c, pf, eff } };
}

// Expected kills with no spill-over: Markov chain over (models killed, wounds left on current model).
function expectedKills(N, eff, M, W) {
  let s = new Array(M * W).fill(0), dead = 0, total = 0;
  s[W - 1] = 1;
  const now = () => s.reduce((acc, p, i) => acc + p * Math.floor(i / W), 0) + dead * M;
  for (let n = 1; n < N.length; n++) {
    const t = new Array(M * W).fill(0);
    s.forEach((p0, i) => {
      if (!p0) return;
      const k = Math.floor(i / W), w = (i % W) + 1;
      eff.forEach((pe, x) => {
        const p = p0 * pe;
        if (!p) return;
        if (x < w) t[k * W + w - x - 1] += p;
        else if (k + 1 >= M) dead += p;
        else t[(k + 1) * W + W - 1] += p;
      });
    });
    s = t;
    total += N[n] * now();
  }
  return total;
}

function buildCard(prof, parts, target) {
  const models = parts.reduce((s, p) => s + p.models, 0);
  const random = isRandom(prof.A);
  const bonusDice = prof.bonus.reduce((s, b) => s + b.per, 0) * models;
  const uniform = parts.every((p) => p.A === parts[0].A);
  const base = random ? null : parts.reduce((s, p) => s + p.models * Number(p.A), 0);
  const perModelDist = fromMap(dist(prof.A));
  const Apoly = random ? conv(pow(perModelDist, models), [...new Array(bonusDice).fill(0), 1]) : [...new Array(base + bonusDice).fill(0), 1];
  const attacks = {
    fixed: !random && uniform ? Number(prof.A) : null, expr: random ? prof.A : null,
    perModel: uniform ? (random ? prof.A : Number(prof.A)) : null, models, base,
    bonus: [...prof.aChips, ...prof.bonus.map((b) => ({ text: `+${b.per * models} ${b.text}${b.why ? `: ${b.why}` : ''}`, source: b.source }))],
    bonusDice, total: random ? null : base + bonusDice, mean: ev(Apoly),
  };

  // Per attack die: number of damaging events (unsaved wounds + devastating crit wounds).
  const { ph, pc, pw, pcw, pf, eff } = prof.m, { sustained, lethal, auto } = prof.hit;
  const dev = prof.wound.devastating ? pcw : 0;
  const q = (pw - dev) * pf + dev;                       // a rolled-to-wound hit becomes a damaging event
  const rolledHits = auto ? 1 : ph - pc + pc * sustained + (lethal ? 0 : pc);
  const autoWounds = lethal ? pc : 0;
  const K = auto ? bern(q)
    : mix([[1 - ph, [1]], [ph - pc, bern(q)], [pc, conv(lethal ? bern(pf) : bern(q), pow(bern(q), sustained))]]);
  let Kp = [1];
  const N = mix(Apoly.map((pa) => { const r = [pa, Kp]; Kp = conv(Kp, K); return r; }));
  const A = attacks.mean, unsaved = A * ev(K);
  const expected = {
    attacks: A,
    hits: A * (auto ? 1 : ph + pc * sustained),
    wounds: A * (rolledHits * pw + autoWounds),
    unsaved,
    damage: unsaved * ev(eff),
    kills: expectedKills(N, eff, target.models ?? 1, target.W ?? 1),
  };
  const weapons = parts.map(({ name, models: n, modelName, A: a }) => ({ name, models: n, modelName, A: a }));
  const title = weapons.map((w) => `${w.name} ×${w.models}`).join(' + ');
  return { title, weapons, attacks, hit: prof.hit, wound: prof.wound, save: prof.save, damage: prof.damage, expected };
}

// effects: the unit's candidate effects; filtered per group with activeEffects (manual ones need ctx.enabled).
export function computeAttack({ type, groups = [], target = {}, ctx = {}, effects = [], unitKeywords = [] }) {
  const byKey = new Map();
  let hazards = 0;
  for (const g of groups) {
    if (!g.models) continue;
    const active = activeEffects(effects, { type, ctx, target, unitKeywords, weapon: g.weapon, modelName: g.modelName });
    const prof = resolve(g.weapon, type, active, target, ctx);
    if (prof.hazardous) hazards += g.models;
    if (!byKey.has(prof.key)) byKey.set(prof.key, { prof, parts: [] });
    byKey.get(prof.key).parts.push({ name: displayName(g.weapon), models: g.models, modelName: g.modelName, A: prof.A });
  }
  const cards = [...byKey.values()].map(({ prof, parts }) => buildCard(prof, parts, target));
  const mw = ctx.allMonsterVehicle ? 3 : 1;
  const after = hazards ? [{ label: 'Hazard rolls', rolls: hazards,
    text: `Roll ${hazards} D6, one per [HAZARDOUS] weapon: each 1–2 = ${mw} mortal wound${mw > 1 ? 's' : ''} to your unit.` }] : [];
  return { cards, after };
}

// Real results typed by the user -> dice for the next steps. Only inputs present produce outputs.
export function followAlong(card, { attacks, hits, crits = 0, wounds, critWounds = 0 } = {}) {
  const h = card.hit, out = { damagePerFail: card.damage.expr };
  if (attacks != null) {
    out.hitDice = h.auto ? 0 : attacks;
    if (h.auto && hits == null) hits = attacks;
  }
  if (hits != null) {
    const c = h.auto || h.only6 ? 0 : Math.min(crits, hits);
    out.autoWounds = h.lethal ? c : 0;
    out.woundDice = hits - out.autoWounds + c * h.sustained;
  }
  if (wounds != null) {
    const dc = card.wound.devastating ? Math.min(critWounds, wounds) : 0;
    out.saveDice = wounds - dc + (out.autoWounds ?? 0);
    out.devastatingCrits = dc;
    out.mortalWounds = isRandom(card.damage.expr) ? null : dc * Number(card.damage.expr);
  }
  return out;
}
