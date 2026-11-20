# Dice Helper — technical spec

Product requirements, dice rules and all rules data live in `docs/source/orks-11e.md` (called **the source** below). Sections 1–4 of the source are the product spec and are binding; this file only adds the technical decisions. Where they disagree, the source wins on rules, this file wins on tech.

## Goals (MVP)
- Phone-first static web app: build an Ork army, run a game, tap a unit to shoot/fight and see dice count, target number and crit effect per step, plus the stratagems usable right now.
- All 67 datasheets, 15 detachments, core stratagems as JSON, with original rules text readable in the UI.
- Structured effects (modifiers) encoded for War Horde, the core rules and the example roster (Warboss in Mega Armour, Meganobz, Deff Dread, Boyz, Mek, Gretchin). Everything else still works with weapon-profile maths and shows its rules text; the user applies those modifiers with manual chips.

## Non-goals (MVP)
- Factions beyond Orks, Emperor's Children (`docs/source/emperors-children-11e.md`) and Adepta Sororitas (`docs/source/adepta-sororitas-11e.md`), opponent datasheets, "defending" mode, Boarding Actions.
- Enforcing wargear-option legality (see Wargear below). Enforcing army-construction legality beyond DP, points total, leader/support attach lists and enhancement restrictions.
- Effects for the other 14 detachments and remaining datasheets (follow-up, JSON only).
- Animated dice roller (a plain "roll for me" button is in).
- Accounts, backend, sync.

## Stack
- Plain HTML + CSS + JavaScript ES modules. **No build step, no runtime dependencies, no framework.** Node 24 is used only for tooling.
- Tests: `node --test` (built in). Dev server: `tools/serve.mjs` (tiny static server, needed because modules and `fetch` do not run from `file://`).
- Offline: one network-first service worker (`sw.js`): online every load gets the latest files and refreshes the cache; offline the cache answers. `npm run sw` stamps it with a hash of all app files, so every deploy changes `sw.js`; the app checks for it when it comes back to the foreground and reloads itself once the new worker takes over.
- State: `localStorage`, every access in try/catch, one key `dicehelper.v1`.

## Layout
```
index.html            app shell, bottom tab bar, <main id="view">
css/app.css           tokens + shared components; css/<view>.css per view
js/main.js            boot, hash router (#/army #/game #/attack)
js/data.js            loads JSON, lookups (faction-agnostic)
js/store.js           persisted state + subscribe()
js/dom.js             h() element helper, sheet/modal for rules text
js/engine/parse.js    weapon keyword parser, dice expressions
js/engine/effects.js  which effects are active for a unit/attack
js/engine/attack.js   computeAttack(): the dice cards (pure)
js/engine/stratagems.js  which stratagems are usable now (pure)
js/ui/army.js game.js attack.js   one view per file (strats.js = stratagem pane of game)
data/core/abilities.json stratagems.json
data/<faction>/datasheets.json detachments.json effects.json
tools/build-data.mjs  source MD -> JSON (re-runnable)
tools/serve.mjs
tests/*.test.mjs
```
`js/engine/**` is pure: no DOM, no storage, no fetch. It takes plain objects and returns plain objects, so Node can test it.

## Data model

### data/<faction>/datasheets.json — generated, never hand-edited
```json
{ "id": "boyz", "name": "Boyz", "source": "Codex",
  "keywords": ["ORKS","INFANTRY","BATTLELINE","EXPLOSIVES","MOB"],
  "role": "Battleline",
  "models": [{"name":"Boy","M":"6\"","T":5,"Sv":5,"W":1,"Ld":7,"OC":2}],
  "invuln": null,
  "weapons": [{"id":"kombi-rokkit-shoota","name":"Kombi-rokkit","profile":"Shoota","type":"ranged",
               "range":"18\"","A":"2","skill":5,"S":4,"AP":0,"D":"1",
               "keywordsText":"LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1",
               "abilities":[{"name":"LETHAL HITS","notVs":["MONSTER","VEHICLE"]},{"name":"RAPID FIRE","value":1}]}],
  "wargearOptions": ["…text…"],
  "coreAbilities": ["Deadly Demise D3","Firing Deck 12"],
  "armyRules": ["Waaagh!"],
  "abilities": [{"id":"tide-of-muscle","name":"Tide of Muscle","tag":null,"text":"…"}],
  "composition": "…text…",
  "defaultLoadout": [{"model":"Nob","min":1,"max":2,"weapons":["Kustom Choppa","Kombi-skorcha"]}],
  "points": [{"fromCopy":1,"sizes":[{"models":10,"pts":85}]},{"fromCopy":4,"sizes":[{"models":10,"pts":95}]}],
  "leads": [], "supports": [] }
```
- `ORKS` is added to every datasheet's keywords. `skill: null` means [TORRENT] ("-" in the source). `A` and `D` stay strings (dice expressions). `AP` is a number ≤ 0. `Sv`, `Ld`, `invuln` are the number before the "+".
- `role`: first match of CHARACTER→Characters, BATTLELINE→Battleline, INFANTRY→Infantry, MOUNTED→Mounted, VEHICLE→Vehicles, MONSTER→Monsters, FORTIFICATION→Fortifications, else Other.
- Unknown `Label: text` lines inside a datasheet (Transport, Fortification, psyker lines…) become abilities so no text is lost.
- `weapon.name` is what wargear texts use; `name + profile` identifies a profile. A model equipped with "Kombi-rokkit" may fire any one of its profiles.

### data/<faction>/detachments.json — generated
`{ armyRules:[{id,name,text}], detachments:[{id,name,dp,rule:{name,text},enhancements:[{id,name,pts,restriction,text,upgrade,weapons:[]}],stratagems:[S]}] }`

Stratagem `S` (same shape in `data/core/stratagems.json`):
`{id,name,cp,detachment,turn:"your"|"opponent"|"either",phases:["fight"]|["any"],when,target,effect,restrictions,text}`. Text fields are verbatim.

### data/core/abilities.json — generated from source A3
`[{name, text}]` for weapon and core abilities (tap-to-read).

### data/<faction>/effects.json — hand-written overlay, keyed to generated ids
```json
{ "source": "detachment:war-horde",          // or stratagem:<id> / enhancement:<id> / ability:<datasheetId>:<abilityId> / armyrule:<id>
  "label": "Get Stuck In (War Horde)",
  "scope": "unit",                             // unit | model (bearer only) | weapon:<name>
  "attack": "melee",                           // melee | ranged | any
  "when": { "riledUp": true, "charged": true, "phase": "fight", "targetHas": ["MONSTER","VEHICLE"],
            "targetNot": [], "halfRange": true, "onObjective": true, "attached": true, "minModels": 11,
            "unitHas": ["BOYZ"], "targetMaxT": 6, "belowStart": true, "belowHalf": true },             // every key optional, all must hold
  "mods": { "a": 1, "hit": 1, "wound": 1, "ap": 1, "s": 2, "d": 1, "critHit": 5, "critWound": 3, "ignoreMods": ["hit","wound"],
            "rerollHit": "ones"|"all", "rerollWound": "ones"|"all",
            "abilities": ["SUSTAINED HITS 1"], "bump": {"RAPID FIRE": 1} },
  "weaponHas": "SUSTAINED HITS",               // optional: only weapons that already have this ability
  "chosenWeapon": true,                        // enhancement: only the bearer's weapon picked in the Army view (unit.enhancementWeapon)
  "manual": true }                             // true = user toggles it (stratagem, once per battle, random table); one toggle per source
```
`ap: 1` means "+1 AP" as printed: AP −1 becomes −2. `bump` implements "has [X 1], or +1 to its value if it already has [X]". Unit-state effects (riled up → 5+ InSv, [ASSAULT]) are data too.

### State (localStorage)
- `rosters[]`: `{id,name,faction,mode:"incursion"|"strike"|"custom",limit,detachments:[id],units:[U]}`
- `U`: `{uid,datasheetId,size,ptsOverride,groups:[{model,count,weapons:[weaponName]}],enhancement,attachedTo,warlord}`
- `game`: `{rosterId,round,turn:"me"|"opp",phase,cp,waaagh:{used,activeUntil},units:{[uid]:{riled,charged,advanced,stationary,shocked,models,wounds}},used:{[stratId]:phaseKey},unitStrat:{[uid]:phaseKey},once:{[key]:true}}`
- `targets[]` presets + `target`: `{name,T,Sv,InSv,W,models,fnp,keywords:[],cover,halfRange,onObjective,hidden,mods:{hit,wound,ap}}`; `mods` are the Attack view's hand-set "Other modifiers" (hit/wound −1..+1, AP −3..+3), applied as one always-on effect labelled "Other abilities"
- `settings`: `{capModifiers:true}`

## Engine contract (`js/engine/attack.js`)
```
computeAttack({ type:"ranged"|"melee",
  groups:[{ weapon, models, modelName }],      // what the user selected
  target, ctx:{riledUp,charged,advanced,stationary,attached,modelCount,phase,turn,overwatch},
  effects:[…active effect objects], settings }) -> { cards:[Card], after:[{label,text}] }
```
Groups whose final BS/WS, S, AP, D and applicable abilities match are merged into one Card.
```
Card = { title, weapons:[{name,models}],
  attacks:{ fixed:int|null, expr:"D3+3"|null, perModel, models, bonus:[Chip], total:int|null, mean },
  hit:{ auto:bool, need, crit, chips:[Chip], rerolls:[…], sustained, lethal, only6:bool },
  wound:{ need, crit, chips, rerolls, devastating },
  save:{ need:int|null, chips }, damage:{ expr, mean, chips, fnp, spill:false },
  expected:{ hits, wounds, unsaved, damage, kills } }
Chip = { text:"+1 hit", source:"Krumpin' Time" }
followAlong(card,{attacks,hits,crits,wounds,critWounds}) -> dice count for the next step
```
Rules are exactly section 3 of the source. Details the source leaves implicit:
- Modifier cap (always on, user-confirmed): net hit modifier and net wound modifier are each clamped to ±1, so +1 and -1 cancel. BS/WS-changing rules (cover) count as hit modifiers for the clamp.
- Same ability from two sources: keep the highest value, chip names both.
- Unmodified 1 always fails, so "need" never shows better than 2+; worse than 6+ on a hit shows "only crits hit (6)".
- Expected values include re-rolls that are certain (twin-linked, "re-roll 1s") but not Command Re-roll.

## Wargear (deliberate shortcut)
The builder shows the datasheet's wargear-option text and a per-model-type loadout editor: split the models into groups, pick weapons for each group from the datasheet's weapon list. Defaults come from `defaultLoadout`. Legality is **not** enforced; the option text is right there. Upgrade path: parse option sentences into rules.

## Design
Dark only (table use), phone first, usable one-handed; on desktop the view is a centred 480 px column.
- Tokens: `--bg #14160f`, `--surface #1f2318`, `--surface-2 #2a2f20`, `--line #3a4130`, `--text #ecefe2`, `--muted #9aa38a`, `--accent #7bc043` (ork green: primary actions, active tab), `--dice #f2c230` (numbers of dice and target numbers), `--crit #e2572b` (crit effects, warnings, mortal wounds), radius 12px, spacing scale 4/8/12/16/24.
- System font stack. Dice counts and target numbers are 28px bold tabular numerals in `--dice`; body 16px; chips 13px.
- Every tap target ≥ 48px high. Bottom tab bar (Army, Game, Attack, Strats), fixed, with safe-area padding. Primary actions sit in the lower half of the screen.
- Components: card, chip (text + muted source), toggle pill, stepper (− n +), bottom sheet for rules text, segmented control, fold (`fold()` in dom.js: a `<details>` card that keeps its open state across repaints). In the Game view the turn tracker, ability cards and stratagem rules text are folds, closed by default; a stratagem keeps its name, CP and Use button visible.
- Attack card: one row per step, left = step name, centre = big "roll N" and "need X+", right/below = chips; an input (stepper) under hit/wound to type the real result in follow-along mode; "Expected" line at the bottom; a Math / Follow-along segmented switch at the top of the screen.
- Attack view: one dice card at a time, the weapon picked in the row above it; "Whole unit" and "Compare targets" still count every selected weapon. Wide screens (≥1000 px): abilities + stratagems | unit, target, situation | dice.
- Any rule, ability or stratagem name is tappable and opens the full original text in a bottom sheet.
- Accessibility: real `<button>`/`<input>`/`<label>`, visible focus ring, contrast ≥ 4.5:1, state never by colour alone, `prefers-reduced-motion` respected.

## Definition of done (MVP)
- `npm test` green: 67 datasheets / 15 detachments / 10 core stratagems present; engine tests incl. the source's Power Klaw example.
- The example 500 pt War Horde roster can be built (495 pts), a game started, and Meganobz fighting a T4 Sv3+ 5-model target produce the card from source 2.3.
- Stratagem tab filters by phase/turn/detachment/eligible unit and "Use" spends CP.
- Reload keeps roster and game; app loads with the network off after one visit.
