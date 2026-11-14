# Dice Helper

Phone-first web app for Warhammer 40k (11th edition, Orks): build an army, track the game, and get dice-by-dice attack cards.
Plain ES modules, no build step, no dependencies. Works offline after the first visit.

## Run

    npm start        # http://localhost:5173

## Test

    npm test

## Regenerate data

    npm run data     # source markdown -> data/**/*.json
    npm run sw       # refresh the service worker precache list (also after adding/removing any css/js/data file)

## Deploy

Any static host. For GitHub Pages, serve the repo root; all paths are relative, so a sub-path like `/repo/` works.
Offline works after the first visit over https (the service worker is skipped on localhost so development is never stale).

## Add a faction

1. Write `docs/source/<faction>-11e.md` (Parts B and C, same format as the Orks file), add it to `FACTIONS` in `tools/build-data.mjs` and run `npm run data`. Optional hand-written files: `data/<faction>/game.json`, `example-roster.json`.
2. Add `{ "id", "name" }` to `data/factions.json`.
3. Encode rule effects in `data/<faction>/effects.json`.
4. Run `npm run sw`.

## Known limits

- Effects are encoded only for the War Horde detachment and six Ork units, and for the Emperor's Children attack-side rules. Defensive rules ("subtract 1 from the Hit roll" against your unit) are reminders only (Strats pane, Abilities pane), not dice.
- Emperor's Children: extra points for optional wargear (Defiler) are not added; the Legions of Excess points cap in Carnival of Excess is not checked.
- Wargear legality is not enforced.
- No defending mode.
