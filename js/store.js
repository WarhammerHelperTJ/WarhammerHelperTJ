// Persisted app state. The only module that touches localStorage.
const KEY = 'dicehelper.v1';

const defaults = () => ({
  rosters: [],
  activeRosterId: null,
  game: null,   // the open game
  games: [],    // closed games, resumable from the Game tab
  targets: [],
  target: { name: '', T: 4, Sv: 3, InSv: null, W: 1, models: 1, fnp: null, keywords: [], cover: false, halfRange: false, onObjective: false, hidden: false },
  settings: { capModifiers: true },
});

function load() {
  try {
    const raw = globalThis.localStorage?.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch { /* storage blocked or corrupt: start fresh */ }
  return defaults();
}

let state = load();
const subs = new Set();

export const get = () => state;

// fn receives a draft copy; mutate it or return a new state.
export function update(fn) {
  const draft = structuredClone(state);
  state = fn(draft) ?? draft;
  try { globalThis.localStorage?.setItem(KEY, JSON.stringify(state)); } catch { /* quota/private mode */ }
  for (const s of subs) s(state);
}

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}
