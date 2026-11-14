// Weapon keyword parser (source section 3 "Weapon keyword parsing"). Pure: no DOM, no fetch.

// Ability names from source Part A3; Part C keyword columns use nothing else (checked by tools/build-data.mjs).
export const KNOWN_ABILITIES = [
  'ANTI', 'ASSAULT', 'BLAST', 'CLEAVE', 'CLOSE-QUARTERS', 'PISTOL', 'DEADLY DEMISE',
  'DEVASTATING WOUNDS', 'EXTRA ATTACKS', 'FEEL NO PAIN', 'HAZARDOUS', 'HEAVY', 'IGNORES COVER',
  'INDIRECT FIRE', 'LANCE', 'LETHAL HITS', 'MELTA', 'ONE SHOT', 'PRECISION', 'PSYCHIC',
  'RAPID FIRE', 'STEALTH', 'SUSTAINED HITS', 'TORRENT', 'TWIN-LINKED', 'DAMAGED',
];
// Longest names first so "LETHAL HITS" wins over a one-word prefix.
const NAMES = KNOWN_ABILITIES.map(n => n.split(' ')).sort((a, b) => b.length - a.length);

/**
 * "LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2" -> [{name:"LETHAL HITS", notVs:["MONSTER","VEHICLE"]}, {name:"RAPID FIRE", value:2}]
 * Space- or comma-separated, case-insensitive. Words it does not know are pushed to `unknown` (if given)
 * and kept as {name: WORD} so no text is lost.
 */
export function parseWeaponAbilities(text, unknown) {
  const words = String(text ?? '').toUpperCase().split(/[\s,]+/).filter(w => w && w !== '-');
  const out = [];
  let i = 0;
  while (i < words.length) {
    let ab, colon = false;
    const anti = /^ANTI-(.+)$/.exec(words[i]);
    if (anti) {
      ab = { name: 'ANTI', onlyVs: anti[1].split('/') };
      i++;
    } else {
      const n = NAMES.find(p => p.every((x, k) => (words[i + k] ?? '').replace(/:$/, '') === x));
      if (!n) {
        unknown?.push(words[i]);
        out.push({ name: words[i++] });
        continue;
      }
      ab = { name: n.join(' ') };
      i += n.length;
      colon = words[i - 1].endsWith(':');
    }
    if (!colon && /^\d+\+?:?$/.test(words[i] ?? '')) {
      ab.value = parseInt(words[i], 10);
      colon = words[i++].endsWith(':');
    }
    if (colon && words[i]) {
      const q = words[i++];
      if (q.startsWith('NON-')) ab.notVs = q.slice(4).split('/');
      else ab.onlyVs = q.split('/');
    }
    if (ab.name === 'BLAST' && ab.value === undefined) ab.value = 1;
    out.push(ab);
  }
  return out;
}
