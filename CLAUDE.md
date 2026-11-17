# Warhammer 40k dice helper

Static phone-first web app. Plain HTML/CSS/JS ES modules, no build step, no dependencies, no framework. Node 24 for tooling only.

## Commands
- `npm start` — dev server on http://localhost:5173 (`tools/serve.mjs`)
- `npm test` — `node --test`
- `npm run smoke` — opens every tab for every faction in headless Chrome/Edge; fails on page errors (`tools/smoke.mjs`, set `CHROME_PATH` if not found)
- `npm run sw` — restamp `sw.js` (version + file list) after changing any app file; `npm test` fails until you do. The new version is what makes phones update.
- `npm run data` — regenerate `data/**/*.json` from `docs/source/*-11e.md`

## Rules
- Do not add npm packages or a bundler.
- `data/*/datasheets.json`, `data/*/detachments.json`, `data/core/*.json` (incl. `missions.json`) are generated: change `tools/build-data.mjs`, never the JSON. `data/orks/effects.json` is hand-written.
- `js/engine/**` is pure: no DOM, no `localStorage`, no `fetch`. Tests import it directly in Node.
- Code stays faction-agnostic: no unit, detachment or stratagem name in `js/`. Ork specifics live in `data/orks/`.
- Rules text shown to the user is the verbatim source text; never paraphrase it in data.
- UI: dark only, tap targets ≥ 48px, tokens from `css/app.css`, real buttons/labels. Design details in `docs/SPEC.md` "Design".
- Every `localStorage` access goes through `js/store.js`.
- Add or move a file → update `filemap.md`.

## Docs
- `docs/SPEC.md` — tech spec, data model, engine contract, design
- `docs/PLAN.md` — tasks and status
- `docs/source/orks-11e.md` — product spec (sections 1–4) and all rules data (Parts A–C); the authority on rules
- `docs/source/missions-11e.md` — Primary/Secondary Mission cards and how scoring works
- `filemap.md` — where things live
