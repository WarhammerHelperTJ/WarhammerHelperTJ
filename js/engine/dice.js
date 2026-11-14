// Dice expressions: "3", "D3", "D6+1", "2D6+2". Pure.

export function parseDice(expr) {
  const s = String(expr).trim().toUpperCase().replace(/\s+/g, '');
  const m = s.match(/^(?:(\d*)D(\d+))?([+-]?\d+)?$/);
  if (!s || !m || (!m[2] && m[3] == null)) throw new Error(`bad dice expression: ${expr}`);
  return { n: m[2] ? Number(m[1] || 1) : 0, sides: m[2] ? Number(m[2]) : 0, plus: Number(m[3] || 0) };
}

const P = (e) => (typeof e === 'object' ? e : parseDice(e));

export function formatDice(e) {
  const { n, sides, plus } = P(e);
  if (!n) return String(plus);
  const d = `${n > 1 ? n : ''}D${sides}`;
  return plus ? `${d}${plus > 0 ? '+' : ''}${plus}` : d;
}

export const isRandom = (e) => P(e).n > 0;
export const mean = (e) => { const { n, sides, plus } = P(e); return n * (sides + 1) / 2 + plus; };
export const min = (e) => { const { n, plus } = P(e); return n + plus; };
export const max = (e) => { const { n, sides, plus } = P(e); return n * sides + plus; };

export function roll(e, rng = Math.random) {
  const { n, sides, plus } = P(e);
  let t = plus;
  for (let i = 0; i < n; i++) t += 1 + Math.floor(rng() * sides);
  return t;
}

// Exact distribution: Map value -> probability.
export function dist(e) {
  const { n, sides, plus } = P(e);
  let d = new Map([[plus, 1]]);
  for (let i = 0; i < n; i++) {
    const next = new Map();
    for (const [v, p] of d) for (let f = 1; f <= sides; f++) next.set(v + f, (next.get(v + f) || 0) + p / sides);
    d = next;
  }
  return d;
}
