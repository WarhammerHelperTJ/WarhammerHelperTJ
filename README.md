# Dice Helper

Phone-first web app for Warhammer 40k (11th edition, Orks, Emperor's Children and Adepta Sororitas): build an army, track the game, and get dice-by-dice attack cards.
Plain ES modules, no build step, no dependencies. Works offline after the first visit.

## Run

    npm start        # http://localhost:5173

## Test

    npm test         # engine, data and rules tests
    npm run smoke    # every tab in headless Chrome/Edge (set CHROME_PATH if it is not found)

## Regenerate data

    npm run data     # source markdown -> data/**/*.json
    npm run sw       # refresh the service worker precache list (also after adding/removing any css/js/data file)

## Deploy

Any static host. For GitHub Pages, serve the repo root; all paths are relative, so a sub-path like `/repo/` works.
Offline works after the first visit over https (the service worker is skipped on localhost so development is never stale).

## Score a battle

Game → **Score**: pick both players' Force Dispositions (your options come from your detachments) and Tactical or Fixed Secondaries. The pane then shows the Primary and Secondary lines that can score at this point of the turn (end of your Command phase = your Command phase, end of a turn = its Fight phase), with the VP caps applied. The opponent's VP is a counter you set by hand.

## Share a roster

Army → open a roster → **Share roster link**. Opening the link on another device adds a copy of the roster there. The roster is inside the part after `#`, which browsers never send to the server.

## Add a faction

1. Write `docs/source/<faction>-11e.md` (Parts B and C, same format as the Orks file), add it to `FACTIONS` in `tools/build-data.mjs` and run `npm run data`. Optional hand-written files: `data/<faction>/game.json`, `example-roster.json`.
2. Add `{ "id", "name" }` to `data/factions.json`.
3. Encode rule effects in `data/<faction>/effects.json`.
4. Run `npm run sw`.

## Known limits

- Effects cover the attack-side rules of all 15 Ork detachments, Ork unit abilities and Emperor's Children. Not modelled: Hunta Rig (+2 A per embarked model), Dreadherder (buffs another unit), Mekwaaagh! Mastermind and Da Boss is Watchin' (use the Riled up toggle). Defensive rules ("subtract 1 from the Hit roll" against your unit) are reminders only (Strats pane, Abilities pane), not dice.
- Emperor's Children: extra points for optional wargear (Defiler) are not added; the Legions of Excess points cap in Carnival of Excess is not checked.
- Adepta Sororitas: Miracle dice and Acts of Faith are rules text only (no dice pool); the REVEREND detachment limit is not checked. Choices made in play (Vows of Atonement, Righteous units, the quarry, a judged target, "within 6\"" auras) are toggles in the Attack view. Blood of Martyrs reads the models (or wounds) left from the Game view.
- Wargear legality is not enforced.
- No defending mode.
