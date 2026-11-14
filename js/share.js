// Roster <-> link code: JSON, deflate (CompressionStream), base64url. The code travels after "#", so it is never sent
// to the server. Decoding is a trust boundary: the result is checked and rebuilt field by field.
const FIELDS = ['uid', 'datasheetId', 'size', 'ptsOverride', 'groups', 'enhancement', 'enhancementWeapon', 'attachedTo', 'warlord'];
const MAX_CODE = 30000;

const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
const toB64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

/** roster -> short URL-safe code */
export async function encodeRoster(r) {
  const data = { v: 1, name: r.name, faction: r.faction, mode: r.mode, limit: r.limit, detachments: r.detachments,
    units: r.units.map((u) => Object.fromEntries(FIELDS.filter((k) => u[k] != null).map((k) => [k, u[k]]))) };
  return toB64u(await pipe(new TextEncoder().encode(JSON.stringify(data)), new CompressionStream('deflate-raw')));
}

const str = (v, max = 100) => (typeof v === 'string' && v.length <= max ? v : null);
const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);

/** code -> roster without an id (caller assigns one); throws on anything malformed. */
export async function decodeRoster(code) {
  if (typeof code !== 'string' || !code || code.length > MAX_CODE || !/^[A-Za-z0-9_-]+$/.test(code)) throw new Error('not a roster link');
  let d;
  try { d = JSON.parse(new TextDecoder().decode(await pipe(fromB64u(code), new DecompressionStream('deflate-raw')))); }
  catch { throw new Error('the roster link is damaged'); }
  if (!d || d.v !== 1 || !str(d.faction) || !Array.isArray(d.units) || d.units.length > 300) throw new Error('not a roster link');
  const units = d.units.map((u) => ({
    uid: str(u?.uid, 40), datasheetId: str(u?.datasheetId), size: int(u?.size, 1, 500) ?? 1,
    ptsOverride: int(u?.ptsOverride, 0, 100000), enhancement: str(u?.enhancement), enhancementWeapon: str(u?.enhancementWeapon),
    attachedTo: str(u?.attachedTo, 40), warlord: u?.warlord === true,
    groups: Array.isArray(u?.groups) ? u.groups.slice(0, 50).map((g) => ({ model: str(g?.model) ?? '', count: int(g?.count, 0, 500) ?? 0,
      weapons: Array.isArray(g?.weapons) ? g.weapons.map((w) => str(w)).filter(Boolean).slice(0, 50) : [] })) : [],
  })).filter((u) => u.uid && u.datasheetId);
  return { name: str(d.name) ?? 'Shared roster', faction: d.faction, mode: ['incursion', 'strike', 'custom'].includes(d.mode) ? d.mode : 'custom',
    limit: int(d.limit, 0, 100000) ?? 0, detachments: Array.isArray(d.detachments) ? d.detachments.map((x) => str(x)).filter(Boolean).slice(0, 20) : [], units };
}
