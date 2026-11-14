// Which effects (data/<faction>/effects.json) hold for one attack, and what they do to a weapon. Pure.
import { parseDice, formatDice } from './dice.js';

const up = (list) => (list ?? []).map((k) => String(k).toUpperCase());

function whenHolds(when = {}, ctx, target, unitKw) {
  const tk = up(target.keywords);
  return Object.entries(when).every(([k, v]) => {
    switch (k) {
      case 'phase': return [].concat(v).includes(ctx.phase);
      case 'targetHas': return up(v).some((x) => tk.includes(x));   // "MONSTER/VEHICLE" = either
      case 'targetNot': return !up(v).some((x) => tk.includes(x));
      case 'unitHas': return up(v).some((x) => unitKw.includes(x));
      case 'minModels': return (ctx.modelCount ?? 0) >= v;
      case 'targetMaxT': return target.T != null && target.T <= v;   // "no models with a T of 7+": the panel has one T per unit
      default: {
        const actual = ctx[k] ?? target[k];   // riledUp, charged, attached, turn… in ctx; halfRange, onObjective on target
        return typeof v === 'boolean' ? !!actual === v : actual === v;
      }
    }
  });
}

function scopeHolds(e, weapon, modelName) {
  const scope = e.scope ?? 'unit';
  if (scope === 'unit') return true;
  if (scope === 'model') return (modelName == null || e.model === modelName)   // bearer named in effect.model
    && (e.weapon == null || !weapon || e.weapon.toUpperCase() === String(weapon.name).toUpperCase());   // and its chosen weapon
  if (scope.startsWith('weapon:')) return !weapon || scope.slice(7).toUpperCase() === String(weapon.name).toUpperCase();
  return false;
}

// weapon / modelName may be omitted to list the unit-level effects.
export function activeEffects(effects = [], { type, ctx = {}, target = {}, unitKeywords = [], weapon, modelName } = {}) {
  const unitKw = up(unitKeywords);
  const enabled = ctx.enabled ?? [];
  return effects.filter((e) =>
    (!e.manual || enabled.includes(e.source)) &&
    (!e.attack || e.attack === 'any' || !type || e.attack === type) &&
    scopeHolds(e, weapon, modelName) &&
    (!e.weaponHas || !weapon || (weapon.abilities ?? []).some((a) => a.name.toUpperCase() === e.weaponHas.toUpperCase())) &&
    whenHolds(e.when, ctx, target, unitKw));
}

// "SUSTAINED HITS 1", "LETHAL HITS: non-MONSTER/VEHICLE", "ANTI-INFANTRY 4+" -> {name, value?, onlyVs?, notVs?}.
// shortcut: private twin of js/engine/parse.js, unify once that parser is settled.
function parseAbility(str) {
  const [head, cond] = String(str).split(':').map((s) => s.trim().toUpperCase());
  const anti = head.match(/^ANTI-(.+?)\s+(\d)\+$/);
  const m = head.match(/^(.+?)(?:\s+(\d+))?$/);
  const a = anti ? { name: 'ANTI', onlyVs: anti[1].split('/'), value: Number(anti[2]) } : { name: m[1] };
  if (!anti && m[2]) a.value = Number(m[2]);
  if (cond) a[cond.startsWith('NON-') ? 'notVs' : 'onlyVs'] = cond.replace(/^NON-/, '').split('/');
  return a;
}

const applies = (a, tk) =>
  (!a.onlyVs || up(a.onlyVs).some((k) => tk.includes(k))) && !(a.notVs && up(a.notVs).some((k) => tk.includes(k)));

const sign = (v) => (v > 0 ? `+${v}` : String(v));

// Weapon profile + active effects -> final characteristics, abilities that apply vs this target, and modifier lists.
// Chips: {text, source}. Weapon-printed abilities have source "weapon".
export function applyEffects(weapon, active = [], target = {}) {
  const tk = up(target.keywords);
  const out = {
    skill: weapon.skill, S: weapon.S, AP: weapon.AP, A: String(weapon.A), D: String(weapon.D),
    abilities: new Map(),           // name -> {name, value?, sources:[]}
    hit: [], wound: [], critHit: [], critWound: [], rerollHit: [], rerollWound: [], ignoreMods: [],
    chips: { attacks: [], wound: [], save: [], damage: [] },
  };
  const add = (a, source) => {
    if (!applies(a, tk)) return;
    const old = out.abilities.get(a.name);
    if (!old) return void out.abilities.set(a.name, { name: a.name, value: a.value, onlyVs: a.onlyVs, sources: [source] });
    const better = a.name === 'ANTI' ? (a.value ?? 7) < (old.value ?? 7) : (a.value ?? 0) > (old.value ?? 0);
    if (better) Object.assign(old, { value: a.value, onlyVs: a.onlyVs });
    if (!old.sources.includes(source)) old.sources.push(source);
  };
  for (const a of weapon.abilities ?? []) add({ ...a, name: a.name.toUpperCase() }, 'weapon');

  const dice = (expr, n) => { const d = parseDice(expr); return formatDice({ ...d, plus: d.plus + n }); };
  for (const e of active) {
    const m = e.mods ?? {}, src = e.label ?? e.source;
    if (m.a) { out.A = dice(out.A, m.a); out.chips.attacks.push({ text: `${sign(m.a)} A`, source: src }); }
    if (m.s) { out.S += m.s; out.chips.wound.push({ text: `${sign(m.s)} S`, source: src }); }
    if (m.ap) { out.AP = Math.min(0, out.AP - m.ap); out.chips.save.push({ text: `${sign(m.ap)} AP`, source: src }); }
    if (m.d) { out.D = dice(out.D, m.d); out.chips.damage.push({ text: `${sign(m.d)} D`, source: src }); }
    if (m.hit) out.hit.push({ v: m.hit, text: `${sign(m.hit)} hit`, source: src });
    if (m.wound) out.wound.push({ v: m.wound, text: `${sign(m.wound)} wound`, source: src });
    if (m.critHit) out.critHit.push({ v: m.critHit, text: `crit on ${m.critHit}+`, source: src });
    if (m.ignoreMods) out.ignoreMods.push({ rolls: m.ignoreMods, label: src, source: src });   // ["hit", "wound"]: negative modifiers ignored
    if (m.critWound) out.critWound.push({ v: m.critWound, text: `crit wound on ${m.critWound}+`, source: src });
    if (m.rerollHit) out.rerollHit.push({ v: m.rerollHit, source: src });
    if (m.rerollWound) out.rerollWound.push({ v: m.rerollWound, source: src });
    for (const s of m.abilities ?? []) add(parseAbility(s), src);
  }
  // bump after de-duplication: "+1 to its value if it already has [X], else it has [X 1]"
  for (const e of active) {
    for (const [name, n] of Object.entries(e.mods?.bump ?? {})) {
      const key = name.toUpperCase(), src = e.label ?? e.source, old = out.abilities.get(key);
      if (old) { old.value = (old.value ?? 0) + n; old.sources.push(`${src} (+${n})`); }
      else out.abilities.set(key, { name: key, value: n, sources: [src] });
    }
  }
  return out;
}

const title = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
export const abilityText = (a) =>
  a.name === 'ANTI' ? `Anti-${(a.onlyVs ?? []).join('/')} ${a.value}+` : `${title(a.name)}${a.value != null ? ` ${a.value}` : ''}`;
