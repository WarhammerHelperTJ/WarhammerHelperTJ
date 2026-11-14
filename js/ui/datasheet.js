// Full datasheet(s) in the bottom sheet: profile, weapons, abilities. Several datasheets = an attached unit.
import { h, openSheet } from '../dom.js';

const plus = (v) => (v == null ? '-' : `${v}+`);
const table = (cols, rows) => h('div', { class: 'ds-scroll' }, h('table', { class: 'stats' },
  h('thead', null, h('tr', null, cols.map((c) => h('th', null, c)))),
  h('tbody', null, rows)));
const line = (label, text) => (text ? h('p', { class: 'sheet-text' }, h('strong', null, `${label}: `), text) : null);

function weapons(d, type) {
  const ws = d.weapons.filter((w) => w.type === type);
  if (!ws.length) return null;
  const melee = type === 'melee';
  const cols = [melee ? 'Melee' : 'Ranged', ...(melee ? [] : ['Range']), 'A', melee ? 'WS' : 'BS', 'S', 'AP', 'D'];
  return table(cols, ws.flatMap((w) => [
    h('tr', null, h('th', { class: 'ds-name' }, w.profile ? `${w.name} - ${w.profile}` : w.name),
      [...(melee ? [] : [w.range]), w.A, w.skill == null ? 'N/A' : `${w.skill}+`, w.S, w.AP, w.D].map((c) => h('td', null, c))),
    w.keywordsText && w.keywordsText !== '-'
      ? h('tr', { class: 'ds-kw' }, h('td', { colSpan: cols.length, class: 'muted' }, w.keywordsText)) : null,
  ]));
}

function one(d, heading) {
  return h('section', { class: 'stack' },
    heading ? h('h3', null, d.name) : null,
    h('p', { class: 'muted sheet-text' }, d.keywords.join(', ')),
    table(['Model', 'M', 'T', 'Sv', 'W', 'Ld', 'OC'], d.models.map((m) => h('tr', null, h('th', { class: 'ds-name' }, m.name),
      [m.M, m.T, plus(m.Sv), m.W, plus(m.Ld), m.OC ?? '-'].map((c) => h('td', null, c))))),
    line('Invulnerable save', d.invuln ? `${d.invuln}+` : null),
    weapons(d, 'ranged'), weapons(d, 'melee'),
    line('Core abilities', d.coreAbilities.join(', ')),
    line('Army rules', d.armyRules.join(', ')),
    d.abilities.map((a) => h('p', { class: 'sheet-text' }, h('strong', null, a.name), a.tag ? ` (${a.tag})` : '', `: ${a.text}`)),
    d.wargearOptions.length ? line('Wargear options', d.wargearOptions.map((o) => `\n• ${o}`).join('')) : null,
    line('Unit composition', d.composition),
    line('Leads', d.leads.join(', ')), line('Supports', d.supports.join(', ')));
}

export function openDatasheet(datasheets, title) {
  const ds = datasheets.filter(Boolean);
  if (ds.length) openSheet(title ?? ds[0].name, h('div', { class: 'stack' }, ds.map((d) => one(d, ds.length > 1))));
}
