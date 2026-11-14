// Use / undo a stratagem in the running game: CP, once per phase, one per unit per phase, game.usedBy. Shared by Strats and Attack.
import { update } from '../store.js';
import { useStratagem, undoStratagem } from '../engine/stratagems.js';

import { PHASE_LABEL } from './game.js';

const TURN = { your: 'Your turn', opponent: "Opponent's turn", either: 'Either turn' };
/** "Either turn · Fight phase" */
export const stratWhen = (s) => `${TURN[s.turn] ?? s.turn} · ${s.phases.includes('any') ? 'Any phase' : s.phases.map((p) => `${PHASE_LABEL[p] ?? p} phase`).join(', ')}`;

export const useStrat = (s, uid, key) => update((x) => {
  const n = useStratagem(x.game, s, uid, key);
  if (n) x.game = { ...n, usedBy: { ...n.usedBy, [s.id]: uid } };
});

export const undoStrat = (s, key) => update((x) => {
  const n = undoStratagem(x.game, s, x.game.usedBy?.[s.id] ?? null, key);
  if (n) { const usedBy = { ...n.usedBy }; delete usedBy[s.id]; x.game = { ...n, usedBy }; }
});
