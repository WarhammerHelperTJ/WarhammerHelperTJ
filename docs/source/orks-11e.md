# Warhammer 40,000 (11th edition) Dice Helper — Orks
## Build spec + full rules data for Claude Code

Data captured from Wahapedia (wahapedia.ru, 11th edition core rules + Orks faction pack/codex, app version 1.2) on 12 November 2026.
Goal: a website where I pick my army, my units and their weapons, then click a unit to shoot or fight and instantly see **which dice to roll, how many, and what I need on each roll**, plus **which stratagems I can use right now and what they do**.

This file has four parts:
- **This spec**: what to build and how the dice logic works.
- **Part A**: core rules the calculator must follow (attack sequence, wound chart, weapon abilities, core stratagems).
- **Part B**: Orks army rules, all 15 matched-play detachments with their rules, enhancements and stratagems.
- **Part C**: every Orks datasheet: profiles, every weapon profile, wargear options, abilities, leaders/supports, points.

---

## 1. Tech and general requirements
- Static web app, no backend. Plain HTML/CSS/JavaScript (or Vite + vanilla JS/TypeScript). Must work offline once loaded.
- **Mobile first**: I use it on my phone at the table. Big tap targets, one-hand use, dark mode.
- Save rosters and game state in `localStorage` (wrap in try/catch).
- Step 1 for Claude Code: **convert Parts B and C of this file into JSON data files** (`data/orks/datasheets.json`, `data/orks/detachments.json`, `data/core/stratagems.json`, `data/core/abilities.json`). Keep the code faction-agnostic so I can add other armies later by adding JSON only. Write a small script/test that checks every datasheet in Part C made it into the JSON (there are 67).
- Keep the original rules text in the data and show it in the UI (tap a rule/ability/stratagem name to read the full text).

## 2. Screens

### 2.1 Army builder
1. Choose faction (only **Orks** for now).
2. Choose detachment(s). Show each detachment's DP cost. Battle sizes: Incursion 1,000 pts = 2 DP, Strike Force 2,000 pts = 3 DP. A 3 DP detachment (War Horde) can be taken as the ONLY detachment in a 2 DP game. Also allow a "casual / custom" mode with any points limit (I play 500 pt games).
3. Add units from the datasheet list (group by role: Characters, Battleline, Infantry, Vehicles, etc.; mark Legends/Forge World units).
4. For each unit: choose unit size (from the points table), then **wargear per model** following the "Wargear options" text (e.g. a 20 Boyz mob: 2 Nobz with Power Klaws, 1 Boy with Rokkit Launcha per 10 models…). The default loadout comes from "Unit composition".
5. Attach Leaders / Support characters to a bodyguard unit (only units listed under "Leads"/"Supports"; max one leader + one support per bodyguard).
6. Add enhancements (from the chosen detachment, check the "X model only" restriction).
7. Show running points total. Note: some units cost more for the 2nd/3rd/4th copy ("Points (3rd+ unit)").

Example roster I will use first (War Horde, 500 pts): Warboss in Mega Armour (115) leading 2 Meganobz (70); Deff Dread (130); 10 Boyz (85) with a Mek (55) attached; 10 Gretchin (45).

### 2.2 Game screen
- Turn tracker: battle round, whose turn, current phase (Command → Movement → Shooting → Charge → Fight). CP counter (+/−).
- Global toggles: **Waaagh! called** (riles up all units with the Waaagh! ability until the end of the next turn), per-unit toggles: **riled up**, **charged this turn**, **advanced**, **remained stationary / moved ≤3"** (for [HEAVY]), **battle-shocked**, models remaining / wounds remaining.
- **Target panel** (opponent's unit, entered by hand because only Ork data exists): T, Sv, InSv, W per model, number of models, Feel No Pain, keywords (INFANTRY, MONSTER, VEHICLE, CHARACTER, FLY, PSYKER…), "in cover", "within half range", "within range of an objective", "hidden". Allow saving target presets.

### 2.3 Attack screen (the core feature)
Pick attacking unit → Shoot or Fight → pick weapons (per model group, respecting "one melee weapon per model + all [EXTRA ATTACKS] weapons" and the [CLOSE-QUARTERS] rule) → pick target. For each **group of identical attacks** show a card like:

```
Power Klaw ×2 models (Meganobz)          vs  Space Marine Intercessors (T4 Sv3+)
1. ATTACKS: roll 6 dice  (3 A × 2 models)            [+0 Cleave: target <5 models]
2. HIT:     need 3+  (WS3+, riled up: Krumpin' Time +1 → 2+)   crit on 6 → Sustained Hits 1 (Get Stuck In): +1 hit per 6
3. WOUND:   need 2+  (S10 vs T4: S ≥ 2×T)            crit on 6
4. SAVE (opponent): needs 5+  (Sv3+ worsened by AP-2)
5. DAMAGE: 2 per failed save; damage does not spill over between models
After attacking: 0 hazard rolls
Expected: ~X hits, ~Y wounds, ~Z unsaved, ~N models killed
```
Rules for the card:
- Always show the **number of dice to roll** at every step, the **target number**, and **what a 6 (or crit) does**.
- Random A or D (D3, D6, D3+3, 2D6+2, D6+1…): show "roll D3+3 per model" first, then let me type in the result, or tap "roll for me" (dice roller with animation is a nice-to-have).
- Let me type the actual number of hits / wounds rolled to get the next step's dice count (mode "follow along"), and also show **expected values** (mode "math").
- Show every modifier as a chip with its source (e.g. "+1 hit: Krumpin' Time", "Sustained Hits 1: Get Stuck In (War Horde)"), so I learn why.
- Show re-roll options (Twin-linked, Command Re-roll, "re-roll hit rolls of 1", etc.).
- After the attack, list follow-up rolls: [HAZARDOUS] hazard rolls, Deadly Demise, abilities like Krushin' Impetus (D6 per model, 3+ = mortal wound), Explosives stratagem (6 D6, 4+).

### 2.4 Stratagem helper
- Shows the stratagems I can use **right now**: filter by current phase and whose turn it is (each stratagem header in Part B/Part A shows `[Your turn / Opponent's turn / Either turn, Phase]`), by my chosen detachment(s), and by whether I have an eligible unit (keyword match on TARGET, e.g. "ORKS VEHICLE (excluding WALKER)").
- Card shows name, CP, WHEN, TARGET, EFFECT, RESTRICTIONS. Button "Use" subtracts CP and remembers "used this phase" (same stratagem max once per phase; normally max one stratagem per unit per phase).
- Stratagems that change attacks (Hit 'Em Harder, Close-Range Dakka, Mow 'Em Down, etc.) should be selectable on the attack screen and apply their effect to the calculation.
- Also show "reminders" per phase for my units' abilities (e.g. Command phase: Waaagh! War Cry available? Painboy heals; Movement phase: Intimidating Motivation, Clever Know-wotz on the Deff Dread; Gretchin Thievin' Scavengers at end of Movement).

## 3. Dice logic (implement exactly, see Part A for the source text)

For each weapon group (identical BS/WS, S, AP, D and abilities vs the same target):
1. **Number of attacks** = A × models using that weapon (roll random A per model). Then add:
   - [RAPID FIRE X]: +X per weapon if target within half range.
   - [BLAST X] (X=1 if no number): +X per weapon for every 5 models in the target unit (round down).
   - [CLEAVE X] (melee): +X per weapon for every 5 models in the target, only if all that weapon's attacks go to one target.
   - Ability/stratagem "+N A".
   - [TORRENT]: attacks auto-hit (skip step 2, no crits).
2. **Hit roll**: need BS/WS (after modifiers, e.g. cover worsens BS by 1 for ranged unless [IGNORES COVER]; [HEAVY] +1; abilities ±1). Unmodified 1 always fails; unmodified 6 = critical hit (some rules lower the crit number). Crit triggers [SUSTAINED HITS X] (+X hits) and [LETHAL HITS] (auto-wound, skips wound roll). Snap shooting (Fire Overwatch): only unmodified 6s hit and they are not crits.
3. **Wound roll**: compare S vs T: S≥2T → 2+, S>T → 3+, S=T → 4+, S<T → 5+, S≤T/2 → 6+. Unmodified 1 fails, unmodified 6 = critical wound. [ANTI-KEYWORD X+] makes unmodified X+ a crit vs that keyword. [LANCE] +1 if charged. [TWIN-LINKED] re-roll wound. Critical wound with [DEVASTATING WOUNDS] → no save, mortal wounds = D, max one model per crit.
4. **Save** (opponent rolls): needed = min(Sv − AP, InSv) where AP is negative (Sv 3+ vs AP −2 → 5+). If that is worse than 6+, there is no save (show "no save" unless InSv). Unmodified 1 always fails. Defender abilities that change AP (e.g. "attacks that target this unit have −1 AP" = worsen the attack's AP by 1, so AP −2 becomes −1) must be applied when it is MY unit being attacked; add a "defending" mode later.
5. **Damage**: each failed save = D wounds to one model; excess damage on that model is lost (no spill-over). Mortal wounds DO spill over. Feel No Pain X+: roll one D6 per wound, X+ ignores it. "−1 D" abilities (e.g. Deff Dread's Dread 'Ard, Battlewagon's Mobile Fortress vs ranged) reduce D (minimum 1 unless the rule says otherwise).
6. **After attacking**: hazard rolls = number of [HAZARDOUS] weapons selected (D6 each, 1–2 = 1 mortal wound, 3 if all models are MONSTER/VEHICLE).

Weapon keyword parsing: the "Keywords" column in Part C is plain text such as `LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2` or `ANTI-MONSTER/VEHICLE 4+ CLOSE-QUARTERS DEVASTATING WOUNDS: MONSTER/VEHICLE`. Parse case-insensitively into structured abilities `{name, value?, onlyVs?: [keywords], notVs?: [keywords]}`. "ABILITY: KEYWORD" means the ability only applies vs targets with that keyword; "ABILITY: non-KEYWORD" means only vs targets without it. Abilities that are already in the list do not stack with the same ability from a rule (player picks one; pick the best automatically and show it).

**Modifiers**: encode every ability, detachment rule, enhancement and stratagem from Parts B and C that changes A, hit, wound, AP, S, D, re-rolls, crit thresholds or adds weapon abilities as structured "effects" with conditions (phase, charged this turn, riled up, target keyword, target within X", within range of objective, unit is attached, model count ≥ N). Start with the units in my example roster and War Horde, then the rest.
**Unverified**: the 11th edition rule for capping hit/wound roll modifiers (section 02.02.01 "Modifiers") was not captured. Add a setting "Cap hit/wound modifiers at ±1" (default ON) and show a note in the UI until I confirm it.

## 4. Known gaps in the data
- A few datasheets refer to text printed elsewhere on Wahapedia that was not captured: Weirdboy and Kill Rig psychic abilities, Wazdakka Gutsmek's "Throttlerokkit Shokka Engine" abilities.
- Boarding Actions detachments (Kaptin Killers, Ramship Raiders) are left out on purpose.
- Opponent datasheets are not included: the target is entered by hand.
- Points come from Wahapedia's app data. Always let me edit points manually.

---
# PART A — CORE RULES (only what the dice helper needs)

Source: Wahapedia, Warhammer 40,000 11th edition Core Rules (sections 04, 05, 06.02–06.03, 13.08, 15, 24).
Note: Wahapedia shows some numbers in the hit/wound/save tables as images. Those values are filled in below (unmodified 1 always fails, unmodified 6 is always a critical, standard S-vs-T chart).

## A1. Making attacks (04)
Each time a unit shoots or fights: 1) Select weapons, 2) Select targets, 3) Resolve attacks.
- Shooting: each model can select one or more of its ranged weapons. Targets must be visible, in range and unengaged.
- Fighting: each model must select ONE melee weapon (plus all its [EXTRA ATTACKS] weapons). Targets must be engaged with that model. A weapon can split its attacks over several targets, at most one target per attack (declare how many attacks go to each).
- [CLOSE-QUARTERS] / [PISTOL]: unless the unit uses close-quarters shooting, each non-MONSTER/VEHICLE model picks EITHER its close-quarters weapons OR its other ranged weapons.
- Gather attack dice: per weapon, gather D6 equal to its A. Weapons that make IDENTICAL attacks (same BS/WS, S, AP, D and same applicable abilities) against the same target are rolled together.
- "+1 A" rules increase the weapon's A characteristic (they are not "one extra die per attack").

## A2. Attack sequence (05)
For each attack die: HIT ROLL → WOUND ROLL → SAVE ROLL → INFLICT DAMAGE. If an attack fails or inflicts damage, its sequence ends. Roll all dice of a step at the same time.

### Hit roll (05.01)
| Roll | Result |
|---|---|
| Unmodified 1 | Fails |
| Unmodified 6 | Critical hit (still a hit; triggers [LETHAL HITS], [SUSTAINED HITS]) |
| ≥ BS/WS (after modifiers) | Hit |
| Anything else | Fails |
- A rule may make crits happen on e.g. 5+; a crit is always a hit (except in snap shooting).
- [TORRENT] weapons auto-hit: skip the hit roll (no crits possible).
- Benefit of cover (13.08): worsen the attack's BS by 1 (e.g. 5+ becomes 6+). [IGNORES COVER] cancels this.

### Wound roll (05.02)
| Roll | Result |
|---|---|
| Unmodified 1 | Fails |
| Unmodified 6 | Critical wound (still a wound; triggers [DEVASTATING WOUNDS]) |
| ≥ required result below | Wound |

| Attack Strength vs target Toughness | Required |
|---|---|
| S ≥ 2 × T | 2+ |
| S > T | 3+ |
| S = T | 4+ |
| S < T | 5+ |
| S ≤ T ÷ 2 | 6+ |
- [ANTI-X Y+]: vs a target with keyword X, an unmodified wound roll of Y+ is a critical wound.
- [TWIN-LINKED]: may re-roll the wound roll.
- [LANCE]: +1 to wound if the attacker's unit charged this turn.
- [LETHAL HITS]: a critical hit can automatically wound (no wound roll, so it cannot become a critical wound).

### Save roll (05.03) and damage (05.04)
- The defender groups models (one group per CHARACTER, one group per same W/Sv/InSv), declares allocation order (wounded non-characters first, characters last) and rolls one D6 per wound.
- Save check, in this order: unmodified 1 = damage; if the model has an invulnerable save (InSv) and the roll ≥ InSv = fails (saved; AP is ignored for InSv); if roll modified by AP ≥ Sv = fails (saved); otherwise damage.
  - In practice: the save needed is the better of (Sv worsened by AP) and InSv.
- Damage: the model loses wounds equal to D. Excess damage on a destroyed model is lost (it does not carry over to the next model).
- Feel No Pain X+ is rolled in the Resolve Damage step: one D6 per wound that would be lost; on X+ that wound is not lost.

### Mortal wounds (06.02) and hazard rolls (06.03)
- Mortal wounds: no save; each mortal wound removes 1 wound, allocated to wounded non-characters first, characters last. Unlike normal damage, mortal wounds DO spill over to the next model. If an attack does both, resolve normal damage first, then mortal wounds.
- Hazard roll: roll one D6 per hazard roll; on 1–2 the unit suffers 1 mortal wound (3 mortal wounds if every model in the unit is a MONSTER/VEHICLE). [HAZARDOUS]: after the unit has shot or fought, make one hazard roll per [HAZARDOUS] weapon selected.

## A3. Weapon abilities that change the dice (24)
Duplicated abilities do not stack: if a weapon gets e.g. [SUSTAINED HITS 1] twice, or [SUSTAINED HITS 1] and [SUSTAINED HITS 2], the player picks one.
A weapon ability followed by keywords (e.g. [LETHAL HITS: non-MONSTER/VEHICLE]) only applies against targets with (or, for "non-", without) those keywords.

| Ability | Effect on dice |
|---|---|
| [ANTI-X Y+] | Unmodified wound roll of Y+ vs keyword X = critical wound |
| [ASSAULT] | Unit can use assault shooting (shoot after advancing) |
| [BLAST] / [BLAST X] | +1 (or +X) attack dice for every 5 models in the target unit (round down) |
| [CLEAVE X] (melee) | If ALL of that weapon's attacks target one unit: +X attack dice for every 5 models in the target unit (round down) |
| [CLOSE-QUARTERS] / [PISTOL] | See A1 |
| Deadly Demise X | When the model is destroyed, roll D6: on a 6, every unit within 6" suffers X mortal wounds |
| [DEVASTATING WOUNDS] | Critical wound: no save, target suffers mortal wounds equal to D. These mortal wounds can only damage ONE model per critical wound (excess lost). Resolved after normal damage |
| [EXTRA ATTACKS] | Used in addition to the model's other melee weapon |
| Feel No Pain X+ | See A2 |
| [HAZARDOUS] | See A2 |
| [HEAVY] | Your Shooting phase: +1 to hit if unit is unengaged, was not set up this turn, and no model moved more than 3" |
| [IGNORES COVER] | Target can't get the benefit of cover (incl. Stealth) |
| [INDIRECT FIRE] | Can use indirect shooting |
| [LANCE] | +1 to wound if the attacker charged this turn |
| [LETHAL HITS] | Critical hit can auto-wound |
| [MELTA X] | Target within half range: +X to D |
| [ONE SHOT] | Usable once per battle |
| [PRECISION] | Attacker can allocate to a visible CHARACTER group |
| [PSYCHIC] | Can ignore any modifiers to BS/WS and to the hit roll |
| [RAPID FIRE X] | Target within half range: +X attack dice |
| Stealth | Every model in the unit has it: the unit has the benefit of cover vs ranged attacks |
| [SUSTAINED HITS X] | Critical hit = X extra hits |
| [TORRENT] | Auto-hits |
| [TWIN-LINKED] | Can re-roll the wound roll |
| Damaged X | While the model has X or fewer wounds left: its attacks have -1 to hit |

## A4. Stratagems (15)
- Each stratagem has CP cost, WHEN, TARGET, EFFECT and maybe RESTRICTIONS.
- You can't use the same stratagem more than once per phase.
- Unless stated otherwise, you can't target the same unit with more than one stratagem in the same phase.
- Some stratagems have an optional "+1CP" section; you must pay it to use that section.
- A battle-shocked unit can't be targeted by its own player's stratagems (unless the stratagem says otherwise, e.g. Breakin' Heads).

### Core stratagems (usable by every army)
#### COMMAND RE-ROLL — 1CP — [Either turn, Any phase]
WHEN: Any phase, just after you make one of these rolls for a friendly unit/model: advance, charge, damage, hazard, hit, save, wound, or a roll for the number of attacks of a weapon.
EFFECT: Re-roll that roll. If you rolled several dice together, re-roll one of them (charge rolls are re-rolled in full).
#### EPIC CHALLENGE — 1CP — [Either turn, Fight]
WHEN: Fight phase, just after a friendly CHARACTER unit is selected to fight.
EFFECT: One CHARACTER model in your unit: its melee weapons have [PRECISION] until end of phase.
#### INSANE BRAVERY — 1CP — [Your turn, Command]
WHEN: Battle-shock step of your Command phase, just before a battle-shock roll for a friendly unit.
EFFECT: That battle-shock roll automatically succeeds. Once per battle.
#### EXPLOSIVES (also called Grenades) — 1CP — [Your turn, Shooting]
TARGET: One friendly unengaged EXPLOSIVES/GRENADES unit that is eligible to shoot and did not advance this turn.
EFFECT: Pick one EXPLOSIVES/GRENADES model in it and one unengaged enemy unit within 8" and visible. Roll six D6: each 4+ = 1 mortal wound.
#### CRUSHING IMPACT (also called Tank Shock) — 1CP — [Your turn, Charge]
WHEN: Just after a friendly MONSTER/VEHICLE unit ends a charge move.
EFFECT: Pick one engaged enemy unit and one of your models engaged with it. Roll D6 equal to that model's T: each 1 = 1 mortal wound to YOUR unit; each 5+ = 1 mortal wound to the enemy (max 6).
#### RAPID INGRESS — 1CP — [Opponent's turn, Movement]
WHEN: End of opponent's Movement phase. TARGET: One unit in strategic reserves (not AIRCRAFT).
EFFECT: It makes an ingress move. Not in battle round 1.
#### FIRE OVERWATCH — 1CP — [Opponent's turn, Movement]
WHEN: End of opponent's Movement phase. TARGET: One friendly unengaged unit (not TITANIC).
EFFECT: Your unit shoots using snap shooting: one visible eligible enemy unit within 24"; every attack only hits on an unmodified 6 (not a critical hit), no hit re-rolls.
#### SMOKESCREEN — 1CP — [Opponent's turn, Shooting]
WHEN: Start of opponent's Shooting phase. TARGET: One friendly SMOKE unit.
EFFECT: Until end of phase, attacks targeting that unit (or a unit hidden behind it) give the target the benefit of cover.
#### HEROIC INTERVENTION — 1CP (+1CP for "Into the Fray") — [Opponent's turn, Charge]
WHEN: End of opponent's Charge phase. TARGET: One friendly unengaged unit within 12" of an enemy (VEHICLE only if CHARACTER/WALKER).
EFFECT: Your unit charges. Leap to Defend: can only target enemy units that charged this phase. Into the Fray (+1CP): charge roll max 6, can target any enemy within 6".
#### COUNTEROFFENSIVE — 2CP — [Opponent's turn, Fight]
WHEN: Fight step of opponent's Fight phase, just after an enemy unit has resolved its attacks.
EFFECT: One friendly unit eligible to fight gets Fights First until end of phase and must be the next unit you select to fight.

# PART B — ORKS ARMY RULES, DETACHMENTS, ENHANCEMENTS & STRATAGEMS

Source: Wahapedia, Orks faction page (11th edition). Stratagem headers show: NAME — CP — detachment — [which turn, which phase].

## Army Rules
### Waaagh!
Friendly ORKS units with this ability can:
• Re-roll advance rolls.
• Become riled up, as stated in other rules.
While a unit is riled up:
• That unit has 5+ InSv.
• That unit's ranged attacks have [ASSAULT].
• When that unit is selected to make an advance move, that advance move does not prevent that unit from being eligible to declare a charge.
War Cry (Once per battle, per army): At the start of the Command phase, you can use this ability. If you do, friendly ORKS units with the Waaagh! ability are riled up until the end of the next turn.
### Da Boss
At the start of the battle round, if a model with this ability is your WARLORD, gain 1CP.
### Unstable Energies
ORKS PSYKER units with this ability have a psyker level of 1 or higher, specified in that unit's abilities. Each psychic ability has a psychic level of 1 or higher, specified in that ability's name.
In a battle round, a friendly ORKS PSYKER unit can use a number of psychic abilities whose total psychic level does not exceed that PSYKER unit's psyker level.
### Special Move Types
#### PULSE JET MOVE
MAXIMUM DISTANCE: Pulse roll + 18"
ELIGIBLE IF: As stated in the rule allowing this move type.
BEFORE MOVING: Make a pulse roll by rolling one D6.
WHILE MOVING: Ignore all vertical distance for how far your unit has moved. Your unit can move through all types of model and horizontally and vertically through all categories of terrain feature.
AFTER MOVING: Your unit must be unengaged. Until the end of the turn, your unit is not eligible to declare a charge or start an action. Until the start of your next turn, attacks that target your unit have -1 to hit rolls.
#### ASSAULT DISEMBARK MOVE
SET-UP DISTANCE: 3"
ELIGIBLE IF: Embarked within a TRANSPORT on the battlefield; did not embark within that TRANSPORT this phase; that TRANSPORT has not made an advance/fall-back move this phase.
WHILE MOVING: Set up each model wholly within the set-up distance of that TRANSPORT.

## War Horde (3 DP)
Force Disposition: Take and Hold; Purge the Foe
### Detachment Rule: Get Stuck In
Friendly ORKS units' melee attacks have [Sustained Hits 1].
### Enhancements
• Headwoppa's Killchoppa 15 pts — ORKS model only. If this unit made a charge move this turn, this model's melee attacks have +1 AP.
• Da Boss is Watchin' 25 pts — ORKS model only. (Once per battle, per army) In your Movement phase, you can use this ability. If you do, this unit is riled up until the start of your next turn.
• Kunnin' But Brutal 20 pts — ORKS model only. When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to shoot/declare a charge.
• Follow Me Ladz 20 pts — ORKS model only. This unit has +2" M.
### Stratagems
#### BREAKIN' HEADS — 1CP — War Horde — [Either turn, Any]
WHEN: Any phase, when a friendly attached ORKS INFANTRY unit becomes battle-shocked.
TARGET: That ORKS INFANTRY unit. You can target that unit with this stratagem even though it is battle-shocked.
EFFECT: Roll one D3:
• Your unit suffers a number of mortal wounds equal to the result.
• Your unit is no longer battle-shocked.
#### HIT 'EM HARDER — 1CP — War Horde — [Either turn, Fight]
WHEN: Fight phase, when a friendly ORKS unit is selected to fight.
TARGET: That ORKS unit.
EFFECT: Your unit's melee attacks have [Lethal Hits].
#### ORKS IS NEVER BEATEN — 1CP — War Horde — [Either turn, Fight]
WHEN: Fight phase, when an enemy unit targets a friendly ORKS unit (excluding TITANIC units).
TARGET: That ORKS unit.
EFFECT: When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if your unit is riled up:
• On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.
#### MOW 'EM DOWN — 1CP — War Horde — [Either turn, Fight]
WHEN: Fight phase, when a friendly ORKS VEHICLE unit (excluding WALKER units) that made a charge move this turn is selected to fight.
TARGET: That ORKS VEHICLE unit.
EFFECT: Your unit's melee attacks have [Cleave 1], or if that attack already has [CLEAVE], +1 to the value of that [CLEAVE].
#### FUNGUS-FUEL INJECTION — 1CP — War Horde — [Your turn, Movement]
WHEN: Your Movement phase, when a friendly ORKS MOUNTED/VEHICLE unit is selected to move.
TARGET: That ORKS MOUNTED/VEHICLE unit.
EFFECT: Your unit has +2" M.
#### CLOSE-RANGE DAKKA — 1CP — War Horde — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly ORKS unit is selected to shoot.
TARGET: That ORKS unit.
EFFECT: Your unit's ranged attacks have [Rapid Fire 1], or if that attack already has [RAPID FIRE], +1 to the value of that [RAPID FIRE].

## Green Tide (1 DP)
Force Disposition: Take and Hold
### Detachment Rule: Mob-handed Brutality
• Friendly BOYZ units' melee attacks have [Sustained Hits 1].
• If a friendly ORKS INFANTRY unit made a charge move this turn, that unit's melee attacks have [Lethal Hits: non-Monster/Vehicle].
### Enhancements
• Ferocious Show-off 15 pts — ORKS INFANTRY model only. This model's melee attacks have +1 A, or +2 A if this unit has 11+ models.
• 'Ardboyz (Upgrade) 25 pts — BOYZ unit only. This unit has 4+ Sv.
### Stratagems
#### UNBRIDLED CARNAGE — 1CP — Green Tide — [Either turn, Fight]
WHEN: Fight phase, when a friendly BOYZ unit that made a charge move this turn is selected to fight.
TARGET: That BOYZ unit.
EFFECT: Your unit's melee attacks have +1 A.
#### MOB MENTALITY — 1CP — Green Tide — [Your turn, Command]
WHEN: Start of the Battle-shock step of your Command phase.
TARGET: One friendly ORKS INFANTRY unit of 13+ models.
EFFECT: Select one visible friendly ORKS unit within 12" of your unit. That unit's battle-shock rolls are automatically successful.
#### 'ERE WE GO — 1CP — Green Tide — [Your turn, Movement]
WHEN: Your Movement phase, when a friendly BEAST SNAGGA BOYZ/BOYZ unit is selected to move.
TARGET: That BEAST SNAGGA BOYZ/BOYZ unit.
EFFECT: Your unit has +2 to advance rolls.

## Bully Boyz (1 DP)
Force Disposition: Purge the Foe
### Detachment Rule: Displays of Savagery
Friendly MEGANOBZ/NOBZ units' melee attacks have [Sustained Hits 1].
### Enhancements
• Wimp-kickaz (Upgrade) 15 pts — NOBZ unit only. When an enemy unit engaged with this unit is selected to make a fall-back move, that enemy unit must select the desperate escape mode; if this unit is riled up, that enemy unit has -1 to the hazard rolls made for that desperate escape.
• Tellyporta Boss 20 pts — MEGA ARMOUR model only. This unit (excluding VEHICLE units) has Deep Strike.
### Stratagems
#### TOO ARROGANT TO DIE — 1CP — Bully Boyz — [Either turn, Fight]
WHEN: Fight phase, when an enemy unit targets a friendly MEGANOBZ/NOBZ unit.
TARGET: That MEGANOBZ/NOBZ unit.
EFFECT: When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +1 to that roll if your unit is riled up:
• On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.
#### ARMED TO DA TEEF — 1CP — Bully Boyz — [Either turn, Shooting/Fight]
WHEN: Your Shooting phase or the Fight phase, when a friendly MEGANOBZ/NOBZ unit is selected to attack.
TARGET: That MEGANOBZ/NOBZ unit.
EFFECT: Your unit's attacks can re-roll hit rolls of 1, or re-roll hit rolls if your unit is riled up.
#### HULKING BRUTES — 1CP (+1CP option) — Bully Boyz — [Opponent's turn, Shooting]
WHEN: Your opponent's Shooting phase, when an enemy unit targets a friendly MEGANOBZ/NOBZ unit.
TARGET: That MEGANOBZ/NOBZ unit.
EFFECT: Ranged attacks that target your unit with a S greater than your unit's T have -1 to wound rolls.
+1CP: Or: Ranged attacks that target your unit have -1 to wound rolls.

## Runt Swarm (1 DP)
Force Disposition: Priority Assets
### Detachment Rule: Sneaky Little Gitz
• Friendly GRETCHIN units have BATTLELINE.
• When a friendly GRETCHIN unit is selected to make an advance/fall-back move, that move does not prevent this unit from being eligible to start an action.
### Enhancements
• Extra Sneaky (Upgrade) 10 pts — GRETCHIN unit only. This unit has -3" detection range.
• Minefield Detail (Upgrade) 10 pts — GRETCHIN unit only. While this unit is not embarked, this unit has Scouts 6".
### Stratagems
#### INFESTED WAR ZONE — 2CP — Runt Swarm — [Either turn, Any]
WHEN: Any phase, when an enemy unit has attacked.
TARGET: One friendly GRETCHIN unit that was just destroyed.
EFFECT: Add a new GRETCHIN unit to your army identical to your destroyed unit, in strategic reserves, at its starting strength, with its full wounds remaining.
#### SCARPER! — 1CP — Runt Swarm — [Opponent's turn, Movement]
WHEN: Your opponent's Movement phase, when an enemy unit ends a move within 8" of a friendly unengaged GRETCHIN unit.
TARGET: That GRETCHIN unit.
EFFECT: Your unit can make a normal move of up to D6", or up to 6" instead if your unit is an attached unit.
#### GROT SHIELDS — 1CP — Runt Swarm — [Opponent's turn, Shooting]
WHEN: Your opponent's Shooting phase, when an enemy unit targets a friendly ORKS INFANTRY unit (excluding GRETCHIN units).
TARGET: One friendly GRETCHIN unit within 3" of that ORKS INFANTRY unit.
EFFECT: When a hit roll for that enemy unit's ranged attacks that target that ORKS unit results in a hit, if a model in your GRETCHIN unit is on the battlefield, end the attack sequence for that attack and your GRETCHIN unit suffers 1 mortal wound. (FAQ: [TORRENT] hits are not hit rolls, so they are not stopped.)

## Shoota Boyz (1 DP)
Force Disposition: Purge the Foe
### Detachment Rule: Dakka! Dakka! Dakka!
Friendly ORKS INFANTRY units' ranged attacks have [Assault], and while this unit is riled up, +3" range.
### Enhancements
• Supa-glowy Fing 25 pts — ORKS INFANTRY model only (excluding WEIRDBOY models). This model's ranged attacks have [Anti-Infantry 4+], [Devastating Wounds] and [SUPA-HAZARDOUS] (after shooting, make two hazard rolls per [SUPA-HAZARDOUS] weapon selected).
• Targetin' Squigs 20 pts — BIG MEK/BIGBOSS/WARBOSS model only. This unit's ranged attacks (excluding [Torrent] attacks) have +3" range.
### Stratagems
#### KUSTOM DAKKA — 1CP — Shoota Boyz — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly ORKS INFANTRY unit is selected to shoot.
TARGET: That ORKS INFANTRY unit.
EFFECT: Your unit's ranged attacks that target a unit (excluding MONSTER/VEHICLE units) have +1 to wound rolls.
#### GLOWIN' DAKKA — 1CP — Shoota Boyz — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly ORKS INFANTRY unit is selected to shoot.
TARGET: That ORKS INFANTRY unit.
EFFECT: Your unit's ranged attacks that target a unit within 9" have +1 AP.
#### NEVER ENOUGH DAKKA — 1CP — Shoota Boyz — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly ORKS INFANTRY unit is selected to shoot.
TARGET: That ORKS INFANTRY unit.
EFFECT: Your unit's ranged attacks have [Sustained Hits 1].

## Taktikal Brigade (1 DP)
Force Disposition: Take and Hold
### Detachment Rule: Suspiciously Well Organised
• Friendly STORMBOYZ units have BATTLELINE.
• When a friendly BOYZ/KOMMANDOS/STORMBOYZ unit is selected to make a fall-back move, that fall-back move does not prevent that unit from being eligible to declare a charge.
### Enhancements
• Kill Kommanda 20 pts — LEADER: KOMMANDOS. BIG MEK/WARBOSS INFANTRY model only. While this model is part of an attached unit, this model has Infiltrators and Stealth.
• Throat-slittas (Upgrade) 15 pts — KOMMANDOS/STORMBOYZ unit only. This unit's melee attacks have [Lethal Hits: non-Monster/Vehicle].
### Stratagems
#### DUBIOUS RESTRAINT — 1CP — Taktikal Brigade — [Your turn, Movement]
WHEN: Start/end of your Movement phase.
TARGET: One friendly BOYZ/KOMMANDOS/STORMBOYZ unit.
EFFECT: Select one objective your unit is controlling. That objective is secured.
#### MIND MOSTLY ON THE MISSION — 1CP — Taktikal Brigade — [Your turn, Movement]
WHEN: Your Movement phase, when a friendly BOYZ/KOMMANDOS/STORMBOYZ unit is selected to make an advance/fall-back move.
TARGET: That BOYZ/KOMMANDOS/STORMBOYZ unit.
EFFECT: That move does not prevent your unit from being eligible to start an action.
#### WHILE THEIR BACKS ARE TURNED — 1CP — Taktikal Brigade — [Opponent's turn, Movement]
WHEN: End of your opponent's Movement phase.
TARGET: One friendly unengaged BOYZ/KOMMANDOS/STORMBOYZ unit that was engaged at the start of the phase.
EFFECT: Your unit can make a normal move of up to 6".

## Wreckas (1 DP)
Force Disposition: Priority Assets
### Detachment Rule: Wreckin' and Lootin'
In your Shooting phase, when a friendly BREAKA BOYZ/FLASH GITZ/TANKBUSTAS unit is selected to shoot, if that unit is within range of an objective, or the target of that attack is within range of an objective, that unit's attacks can re-roll hit rolls of 1.
### Enhancements
• Kaptin's Hat 25 pts — LEADER: FLASH GITZ. BIG MEK/WARBOSS INFANTRY model only. When both players have deployed their armies, you can redeploy up to three friendly ORKS INFANTRY units, including into strategic reserves regardless of how many units are already there.
• Supa-snazz Dakka (Upgrade) 25 pts — FLASH GITZ unit only. This unit's Snazzgun weapons have [Rapid Fire 1].
### Stratagems
#### DRIVE-BY BUSTIN' — 1CP — Wreckas — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly ORKS TRANSPORT unit is selected to shoot.
TARGET: That ORKS TRANSPORT unit.
EFFECT: Your unit's ranged attacks with weapons selected for the Firing Deck ability have +1 to hit rolls.
#### GRAB IT — 1CP — Wreckas — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly unengaged BREAKA BOYZ/FLASH GITZ/TANKBUSTAS unit has shot.
TARGET: That BREAKA BOYZ/FLASH GITZ/TANKBUSTAS unit.
EFFECT: Your unit can make a normal move of up to 6", and must end that move within range of an objective. Your unit is not eligible to declare a charge until the end of the turn.
#### GUN-CRAZY SHOW-OFFS — 1CP — Wreckas — [Opponent's turn, Shooting]
WHEN: Your opponent's Shooting phase, when an enemy unit has shot.
TARGET: One friendly FLASH GITZ/TANKBUSTAS unit hit by those attacks.
EFFECT: Your unit shoots using normal shooting, but can only target that enemy unit.

## Da Big Hunt (1 DP)
Force Disposition: Purge the Foe
### Detachment Rule: Da Hunt is On
Friendly BEAST SNAGGA units' attacks that target a MONSTER/VEHICLE unit have +1 AP.
### Enhancements
• Glory Hog 25 pts — BEAST SNAGGA model only. When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to declare a charge.
• It Came from da Drops 20 pts — BEASTBOSS ON SQUIGOSAUR model only. This model has +1 T.
### Stratagems
#### WHERE D'YA FINK YOU'RE GOING? — 1CP — Da Big Hunt — [Opponent's turn, Movement]
WHEN: Your opponent's Movement phase, when an enemy unit engaged with a friendly BEAST SNAGGA unit is selected to make a fall-back move.
TARGET: That BEAST SNAGGA unit.
EFFECT: That enemy unit must use the desperate escape mode. If it is a MONSTER/VEHICLE unit, it makes three additional hazard rolls for each BEAST SNAGGA unit it is engaged with, with -1 to those hazard rolls if it is battle-shocked.
#### GOADED INTO ACTION — 1CP — Da Big Hunt — [Opponent's turn, Shooting]
WHEN: Your opponent's Shooting phase, when an enemy unit has shot.
TARGET: One friendly unengaged BEAST SNAGGA unit that lost a wound as a result of those attacks.
EFFECT: Your unit can make a surge move of up to D6". If your unit is riled up, it can re-roll that D6.
#### INSTINCTIVE HUNTERS — 1CP — Da Big Hunt — [Opponent's turn, Fight]
WHEN: End of your opponent's Fight phase.
TARGET: One friendly unengaged BEAST SNAGGA unit within 6" of a battlefield edge.
EFFECT: Place your unit in strategic reserves.

## Madcap Meks (1 DP)
Force Disposition: Disruption
### Detachment Rule: Unpredictable Genius
In your Shooting phase, when all of a friendly BIG MEK/MEK GUNZ/MORKANAUT/WAZBOM BLASTAJET unit's ranged attacks target a single enemy unit, roll one D6:
| D6 | Result |
|---|---|
| 1 | Dat's Weird: The target unit has 4+ InSv until your unit has shot. |
| 2-3 | Hop Splat: Select one other enemy unit within 3" of the target. That unit suffers D3 mortal wounds. |
| 4 | Seekerz: Those attacks have +1 to hit rolls. |
| 5 | Lifted: The target unit has FLY, and cannot have the benefit of cover, until your unit has shot. |
| 6 | Runtified: The target unit has -1 T until your unit has shot. |
### Stratagems
#### VINDICTIVE ARTILLERISTS — 1CP — Madcap Meks — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly MEK GUNZ unit is selected to shoot.
TARGET: That MEK GUNZ unit.
EFFECT: Your unit's ranged attacks have [Lethal Hits]; or [Sustained Hits 1]; or [Hazardous], [Lethal Hits] and [Sustained Hits 1].
### Enhancements
• Mekwaaagh! Mastermind 30 pts — BIG MEK model only. This unit is riled up.
• Temperamental Shokka (Upgrade) 20 pts — BIG MEK WITH SHOKK ATTACK GUN model only. In your Shooting phase, when this unit is selected to shoot, you can roll one D6: on a 1, this model's Shokk Attack Gun has [Torrent], and when this unit has shot, this model is destroyed; on a 2-5, the Shokk Attack Gun has +1 A; on a 6, the Shokk Attack Gun has [Sustained Hits 2].
• Enhanced Runt-maw (Upgrade) 10 pts — BIG MEK WITH SHOKK ATTACK GUN model only. When this unit has shot, select one enemy unit hit by those attacks. That unit is infested with Snotlings until the start of your next turn (-1 to its leadership rolls).

## Dread Mob (1 DP)
Force Disposition: Purge the Foe
### Detachment Rule: Try Dat Button!
In your Shooting phase or the Fight phase, when a friendly ORKS WALKER unit (excluding TITANIC units) is selected to attack, you can use this ability. If you do, roll either one D6 or two D6 (keep re-rolling duplicate results). This unit's attacks have the relevant rule(s):
| D6 | Result |
|---|---|
| 1-2 | +1 A |
| 3-4 | +2 S |
| 5-6 | +1 AP |
If you rolled two D6, when this unit has attacked, this unit makes one hazard roll.
### Enhancements
• Cybork Boosta 10 pts — BIG MEK/MEK model only. This model has +2" M.
• Dreadherder 30 pts — BIG MEK model only. While this model is within 3" of a friendly ORKS WALKER unit (excluding BIG MEK units): this model has Lone Operative; in your Shooting phase, you can select one friendly ORKS WALKER unit within 3" of this model, and that unit's attacks can re-roll hit rolls of 1 until the end of the turn.
### Stratagems
#### CRAZED RAMPAGE — 1CP — Dread Mob — [Either turn, Fight]
WHEN: Fight phase, when an enemy unit targets a friendly ORKS WALKER unit (excluding TITANIC units).
TARGET: That ORKS WALKER unit.
EFFECT: When a model in your unit is destroyed, if your unit has not been selected to fight this phase, roll one D6, with +3 to the result if your unit has DEFF DREAD:
• On a 4+, do not remove that model from the battlefield. When your unit has fought, or at the end of the phase (whichever comes first), that model is removed from the battlefield.
#### DREAD POWER — 1CP — Dread Mob — [Your turn, Movement]
WHEN: Your Movement phase.
TARGET: One friendly ORKS WALKER unit.
EFFECT: Your unit is riled up until the start of your next turn.
#### STOMPING JUGGERNAUT — 1CP — Dread Mob — [Your turn, Movement/Charge]
WHEN: Your Movement/Charge phase, when a friendly ORKS WALKER unit is selected to move or declares a charge.
TARGET: That ORKS WALKER unit.
EFFECT: Your unit has MOBILE.

## Blitz Brigade (1 DP)
Force Disposition: Take and Hold
### Detachment Rule: Unstoppable Momentum
• Friendly WAGON units can re-roll charge rolls.
• When a friendly WAGON unit is selected to make an advance move, that unit can change advance rolls to a 6.
### Enhancements
• Targetin' Gizmos (Upgrade) 25 pts — WAGON unit only. While a BIG MEK model is embarked within this unit, this unit's ranged attacks have [Ignores Cover], and if this unit is riled up, [Sustained Hits 1].
• Boss Boomer (Upgrade) 10 pts — WAGON unit only. While a WARBOSS model is embarked within this unit, this unit has that WARBOSS model's Intimidating Motivation/Keep Huntin' ability.
### Stratagems
#### KEEP IT RUNNIN' — 1CP — Blitz Brigade — [Either turn, Fight]
WHEN: End of the Fight phase.
TARGET: One friendly unengaged ORKS INFANTRY unit that was eligible to fight this phase and is wholly within 6" of a friendly TRANSPORT unit it is able to embark within.
EFFECT: Your INFANTRY unit embarks within that TRANSPORT unit.
#### READIED BRAWLERS — 1CP — Blitz Brigade — [Your turn, Movement]
WHEN: Your Movement phase, when a friendly WAGON unit ends a normal move.
TARGET: That WAGON unit.
EFFECT: Units embarked within your unit can make an assault disembark move.
#### IMPENDING KRUNCH — 1CP — Blitz Brigade — [Your turn, Charge]
WHEN: Your Charge phase, when a friendly WAGON unit ends a charge move.
TARGET: That WAGON unit.
EFFECT: Each enemy unit engaged with your unit makes a battle-shock roll, with -1 to that battle-shock roll.

## Kult of Speed (1 DP)
Force Disposition: Reconnaissance
### Detachment Rule: Adrenaline Junkies
• Friendly WARBIKERS units have BATTLELINE.
• When a friendly SPEED FREEKS unit is selected to make an advance/fall-back move, that unit's ranged attacks have [Assault] until the end of the turn, and that move does not prevent that unit from being eligible to declare a charge.
### Enhancements
• Smoky Gubbinz (Upgrade) 10 pts — SPEED FREEKS unit only (excluding AIRCRAFT units). When an attack targets a unit that is not fully visible to the attacking model because of a model in this unit, the target has the benefit of cover against that attack.
• Competitive Streak 15 pts — DEFFKILLA WARTRIKE model only. This unit can re-roll charge rolls.
### Stratagems
#### DELICIOUS EATING SQUIGS — 1CP — Kult of Speed — [Your turn, Movement]
WHEN: Your Movement phase.
TARGET: One friendly RUKKATRUKK SQUIGBUGGIES unit.
EFFECT: Select any number of friendly ORKS INFANTRY units within 3" of your unit. Each selected unit heals 3 wounds.
#### DAKKASTORM — 1CP — Kult of Speed — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly SPEED FREEKS unit is selected to shoot.
TARGET: That SPEED FREEKS unit.
EFFECT: Your unit's ranged attacks have [Sustained Hits 1].
#### SPEEDIEST FREEKS — 1CP — Kult of Speed — [Opponent's turn, Shooting]
WHEN: Your opponent's Shooting phase, when an enemy unit targets a friendly SPEED FREEKS unit.
TARGET: That SPEED FREEKS unit.
EFFECT: Ranged attacks that target your unit fail on an unmodified hit roll of 1-3.

## Flyboyz (1 DP)
Force Disposition: Reconnaissance
### Detachment Rule: Skyborne Loons
• Friendly ORKS AIRCRAFT units do not count towards the combined points value of your strategic reserves units.
• While a friendly ORKS AIRCRAFT/DEFFKOPTAS unit is riled up, this unit's ranged attacks have +1 to hit rolls.
### Enhancements
• Flyboss (Upgrade) 20 pts — ORKS AIRCRAFT unit only. This unit has CHARACTER. When this unit ends an ingress move, each friendly ORKS AIRCRAFT/DEFFKOPTAS unit within 6" of this unit is riled up until the start of your next turn.
• Impulsive Recon (Upgrade) 15 pts — ORKS AIRCRAFT unit only. In your first Movement phase, this unit can make an ingress move.
### Stratagems
#### FLYIN' HEADBUTT — 1CP — Flyboyz — [Either turn, Any]
WHEN: Any phase, when a friendly ORKS AIRCRAFT unit is destroyed, before rolling for any Deadly Demise.
TARGET: That ORKS unit.
EFFECT: Your unit does not have the Deadly Demise ability. Select one enemy unit within 12" of your unit and roll eight D6: for each 4+, that enemy unit suffers 1 mortal wound. Then remove your unit from the battlefield.
#### LONG, UNCONTROLLED BURSTS — 1CP — Flyboyz — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly ORKS AIRCRAFT/DEFFKOPTAS unit is selected to shoot.
TARGET: That ORKS AIRCRAFT/DEFFKOPTAS unit.
EFFECT: When your unit's ranged attacks target a FLY unit, those attacks can re-roll hit rolls.
#### WHIRLIGIG EVASION — 1CP — Flyboyz — [Opponent's turn, Movement]
WHEN: Your opponent's Movement phase, when an enemy unit ends a move.
TARGET: One friendly unengaged DEFFKOPTAS unit within 8" of that enemy unit.
EFFECT: Your unit can make a normal move of up to D6", or up to 6" if your unit is riled up.

## Brute Bosses (1 DP)
Force Disposition: Purge the Foe
### Detachment Rule: 'Ard as Nails
When a friendly WARBOSS model is destroyed, if this unit has not been selected to fight this phase, roll one D6, with +1 to the roll if your unit is riled up:
• On a 3+, do not remove this WARBOSS model from the battlefield. When this unit has fought, or at the end of the phase (whichever comes first), this WARBOSS model is removed from the battlefield.
### Enhancements
• Surly as a Squiggoth 25 pts — INFANTRY WARBOSS model only. (Once per battle, per army) At the end of a phase in which this model is destroyed, roll one D6: on a 2+, set this model back up as close as possible to where it was destroyed, unengaged, with 3 wounds remaining.
• Brutal But Kunnin' 30 pts — WARBOSS model only. This model's melee attacks have +1 D.
• Blitzboss 20 pts — WARBOSS model only. A TRANSPORT unit (excluding WALKER units) this unit is embarked within has +2" M and 5+ InSv.
• Proper Killy 15 pts — WARBOSS model only. This model can re-roll hit rolls of 1.
• Morgog's Finkin' Cap 50 pts — WARBOSS model only. (Once per battle, per army) At the end of your opponent's Movement phase, if this unit is unengaged, this unit can make a normal move of up to D6" (re-rollable if riled up).
• Da Gobshot Thunderbuss 20 pts — WARBOSS model only. This model has the following weapon:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Da Gobshot Thunderbuss | 24" | 6 | 4+ | 7 | -2 | 2 | LETHAL HITS: non-MONSTER/VEHICLE, RAPID FIRE 6 |

## Wurrband (1 DP)
Force Disposition: Disruption
### Detachment Rule: Powers of da Waaagh!
Friendly ORKS PSYKER models' [Psychic] attacks have +1 S, and +1 S for every 5 models in this unit (or embarked within this model).
Friendly ORKS PSYKER models have the following psychic abilities:
Roar of Mork (psychic level 1): In your Movement phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. On a 1, this unit is battle-shocked. Select one enemy unit (excluding MONSTER/VEHICLE units) within 12" of this unit. That enemy unit makes a battle-shock roll, with -1 for every 10 models in this unit.
Visions of Violence (psychic level 1): At the start of the Fight phase, if this unit is not battle-shocked, you can make a psychic roll for this unit by rolling one D6. On a 1, this unit is battle-shocked. This unit has Fights First.
### Enhancements
• Da Krunch 10 pts — ORKS PSYKER model only. This model has the following weapon:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Da Krunch | 24" | 3 | 4+ | 5 | -1 | 1 | BLAST 3, HAZARDOUS, LETHAL HITS, PSYCHIC |
• 'Eadbanger 15 pts — ORKS PSYKER model only. This model has the following weapon:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| 'Eadbanger | 24" | 2 | 4+ | 6 | -3 | 3 | HAZARDOUS, PRECISION, PSYCHIC |

• Warphead 25 pts — ORKS PSYKER model only. This model has psyker level 2, has Deadly Demise D6, and can re-roll psychic rolls.

# PART C — ORKS DATASHEETS (all units)

Source: Wahapedia, Orks datasheets (11th edition, app version 1.2). "Source: Legends" = Warhammer Legends datasheet. Points are per unit size; some units cost more from their 2nd/3rd/4th copy onwards.
Weapon profile names like "Kombi-rokkit - Shoota" are one weapon with several profiles: the player picks ONE profile per attack.
BS/WS "-" = [TORRENT] (auto-hit). Keywords column lists weapon abilities exactly as printed.

### Boss Snikrot
Source: Codex · Keywords: INFANTRY; CHARACTER; EPIC HERO; EXPLOSIVES; SMOKE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Boss Snikrot | 6" | 5 | 5+ | 6 | 6+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE Precision |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Mork's Teef | 6 | 2+ | 6 | -2 | 2 | Anti-Infantry 2+ Precision |

Core abilities: Infiltrators, Leader, Lone Operative, Stealth
Army rules: Waaagh!
Abilities:
Kunnin' Infiltrator: At the end of your opponent's Fight phase, if each model in this unit is hidden and unengaged, you can place this unit in strategic reserves.
Deff from the Shadows (First battle round onwards): At the end of your opponent's Movement phase, if this unit is in strategic reserves, this unit can make an ingress move.
Unit composition: 1 Boss Snikrot model, equipped with: 1 Mork's Teef; 1 Slugga.
Points: 1 model: 80 pts
Leads: KOMMANDOS

### Ghazghkull Thraka
Source: Codex · Keywords: INFANTRY; CHARACTER; EPIC HERO; EXPLOSIVES; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Ghazghkull Thraka | 8" | 10 | 2+ | 16 | 6+ | 4 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Mork's Roar - Aimed | 36" | 12 | 5+ | 6 | -1 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Mork's Roar - Point Blank | 9" | 2D6+2 | - | 6 | -1 | 1 | CLOSE-QUARTERS Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Adamantine 'Eadbutt | 1 | 2+ | 14 | -2 | D3+3 | Devastating Wounds Extra Attacks Precision |
| Gork's Klaw | 7 | 2+ | 14 | -3 | 4 | CLEAVE 2 Devastating Wounds |

Army rules: Da Boss, Waaagh!
Abilities:
Da Grand Warlord's Ladz: While this unit is within 3" of another friendly ORKS INFANTRY unit, this unit has Lone Operative.
Makari, Hoist Dat Banner! (Once per battle, per army): In your Movement phase, you can select a number of friendly ORKS units equal to or less than the current battle round number. Those units are riled up until the start of your next turn.
Prophet of da Great Waaagh! (Aura): While a friendly ORKS unit is within 6" of this unit, that unit's melee attacks have +1 to hit rolls and +1 to wound rolls.
Unit composition: 1 Ghazghkull Thraka model, equipped with: 1 Adamantine 'Eadbutt; 1 Gork's Klaw; 1 Mork's Roar.
Points: 1 model: 290 pts

### Nazdreg
Source: Codex · Keywords: INFANTRY; CHARACTER; EPIC HERO; MEGA ARMOUR; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Nazdreg | 5" | 7 | 2+ | 8 | 6+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kustom Blasta X - Gatler | 24" | 6 | 4+ | 9 | -2 | 3 | Hazardous |
| Kustom Blasta X - Shoota | 18" | 4 | 4+ | 5 | -1 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Kustom Blasta X - Skorcha | 12" | 3 | - | 5 | -1 | 1 | BLAST 1 Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Kustom Blasta X | 6 | 2+ | 5 | -1 | 1 | CLEAVE 1 Extra Attacks |
| Moonchewa | 5 | 2+ | 12 | -2 | 3 | CLEAVE 1 Twin-linked |

Core abilities: Deep Strike, Leader
Army rules: Da Boss, Waaagh!
Abilities:
Intimidating Motivation (Once per battle round, per army): In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS unit within 6" of this unit. That unit is no longer battle-shocked and is riled up until the start of your next turn.
Nazdreg's Know-wotz: This unit has Deep Strike. This unit's ranged attacks have [Ignores Cover].
Supreme Kunnin' (Once per phase, per army): In your opponent's Movement phase, when an enemy unit ends a move within 8" of this unit, if this unit is unengaged, this unit can make a normal move of up to D6", or up to 5" if this unit is riled up.
Unit composition: 1 Nazdreg model, equipped with: 1 Kustom Blasta X; 1 Moonchewa. The Kustom Blasta X has three separate ranged profiles, each of which can be selected to make attacks with.
Points: 1 model: 165 pts
Leads: MEGANOBZ

### Zodgrod Wortsnagga
Source: Codex · Keywords: INFANTRY; CHARACTER; EPIC HERO; RUNTHERD

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Zodgrod Wortsnagga | 6" | 5 | 5+ | 5 | 7+ | 1 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Squigstoppa | 12" | 1 | 5+ | 4 | -1 | 1 | ANTI-MONSTER/VEHICLE 4+ CLOSE-QUARTERS DEVASTATING WOUNDS: MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Da Grabzappa | 5 | 2+ | 7 | -2 | 2 | - |

Core abilities: Leader
Army rules: Waaagh!
Abilities:
Super Runts: This unit is riled up. This unit's Scavenged Shivs weapons have +1 A, WS and S.
Unit composition: 1 Zodgrod Wortsnagga model, equipped with: 1 Da Grabzappa; 1 Squigstoppa.
Points: 1 model: 50 pts
Leads: GRETCHIN

### Boss Zagstruk
Source: Legends · Keywords: CHARACTER; EPIC HERO; FLY; INFANTRY; JUMP PACK

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Boss Zagstruk | 12" | 5 | 4+ | 6 | 6+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Da Vulcha's Klaws and Choppa | 6 | 2+ | 8 | -2 | 2 | - |

Core abilities: Leader, Deep Strike, Feel No Pain 6+
Army rules: Waaagh!
Abilities:
Drill Boss: This unit's melee attacks have +1 to hit rolls.
Plummeting Descent: If this unit made an ingress move this turn, this unit can re-roll charge rolls.
Unit composition: 1 Boss Zagstruk model, equipped with: 1 Da Vulcha's Klaws and Choppa; 1 Slugga.
Points: 1 model: 90 pts
Leads: STORMBOYZ

### Kaptin Badrukk
Source: Legends · Keywords: CHARACTER; EPIC HERO; INFANTRY

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Kaptin Badrukk | 6" | 5 | 3+ | 6 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Da Rippa - Standard | 24" | 3 | 5+ | 7 | -2 | 2 | Heavy Sustained Hits 1 |
| Da Rippa - Supercharge | 24" | 3 | 5+ | 8 | -3 | 3 | Hazardous Heavy Sustained Hits 1 |
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa | 3 | 3+ | 5 | -1 | 1 | - |

Core abilities: Leader
Army rules: Waaagh!
Abilities:
Flashiest Gitz: This unit's ranged attacks can re-roll hit rolls.
Ded Glowy Ammo: Enemy units within 6" of this model have -1 T.
Unit composition: 1 Kaptin Badrukk model, equipped with: 1 Choppa; 1 Da Rippa; 1 Slugga.
Points: 1 model: 80 pts
Leads: FLASH GITZ

### Mad Dok Grotsnik
Source: Legends · Keywords: CHARACTER; EPIC HERO; INFANTRY; PAINBOY

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Mad Dok Grotsnik | 6" | 5 | 5+ | 4 | 7+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Power Klaw | 4 | 3+ | 10 | -2 | 2 | - |
| 'Urty Syringe | 1 | 3+ | 2 | 0 | D6 | anti-infantry 4+ DEVASTATING WOUNDS: INFANTRY Extra Attacks Precision |

Core abilities: Leader, Feel No Pain 5+
Army rules: Waaagh!
Abilities:
One Scalpel Short of a Medpack: When this unit is selected to make a fall-back move, that fall-back move does not prevent this unit from being eligible to declare a charge.
Mad Dok: In your Command phase, select one friendly ORKS INFANTRY unit within 6" of this model, and either: that unit heals 3 wounds; or, if all models in that unit have their starting number of wounds, revive one CHARACTER model in that unit.
Unit composition: 1 Mad Dok Grotsnik model, equipped with: 1 Power Klaw; 1 Slugga; 1 'Urty Syringe.
Points: 1 model: 65 pts
Leads: BOYZ, BURNA BOYZ, LOOTAS, NOBZ, TANKBUSTAS

### Mozrog Skragbad
Source: Codex · Keywords: MONSTER; BEAST SNAGGA; CHARACTER; EPIC HERO

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Mozrog Skragbad | 10" | 9 | 3+ | 10 | 6+ | 3 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Thump Gun | 18" | 3 | 5+ | 6 | 0 | 2 | ANTI-MONSTER/VEHICLE 4+ |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Chompa's Jaws | 3 | 3+ | 7 | -2 | 4 | ANTI-MONSTER/VEHICLE 3+ Extra Attacks |
| Gutrippa - Standard | 6 | 2+ | 9 | -2 | 2 | CLEAVE 1 |
| Gutrippa - Hunter | 6 | 2+ | 12 | -2 | D6+1 | Lethal Hits |

Core abilities: Feel No Pain 5+
Army rules: Waaagh!
Abilities:
One Last Kill: In the Fight phase, when this model is destroyed, if this unit has not been selected to fight this phase, roll one D6: on a 2+, do not remove this model from the battlefield. When this unit has fought, or at the end of the phase (whichever comes first), this model is removed from the battlefield.
Da Bigger Dey Iz…: This unit's melee attacks that target a MONSTER/VEHICLE unit can re-roll wound rolls.
Beast Snagga Following: While this unit is within 3" of a friendly BEAST SNAGGA unit (excluding MONSTER CHARACTER units), this unit has Lone Operative.
Unit composition: 1 Mozrog Skragbad model, equipped with: 1 Big Chompa's Jaws; 1 Gutrippa; 1 Thump Gun.
Points: 1 model: 170 pts

### Wazdakka Gutsmek
Source: Codex · Keywords: MOUNTED; VEHICLE; CHARACTER; EPIC HERO; SMOKE; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Wazdakka Gutsmek | 14" | 8 | 3+ | 10 | 6+ | 3 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Grabba Dragga | 12" | 1 | 2+ | 10 | -2 | 3 | ASSAULT Precision |
| Psyko-gatler | 24" | 12 | 4+ | 6 | -2 | 2 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE Sustained Hits 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Speeding Bulk and Flaming Exhaust | 3 | 2+ | 5 | -1 | 1 | CLEAVE 1 Extra Attacks |
| Fixit's Wrench | 1 | 4+ | 3 | 0 | 1 | Extra Attacks |
| Grabba Dragga | 6 | 2+ | 10 | -2 | 3 | CLEAVE 2 Lance |

Core abilities: Deadly Demise D3, Deep Strike, Lone Operative
Army rules: Waaagh!
Abilities:
Full Throttle: In your Command phase, select one Throttlerokkit Shokka Engine ability (printed elsewhere on Wahapedia's datasheet; not captured here). This unit has that ability until the start of your next Command phase.
Unit composition: 1 Wazdakka Gutsmek model, equipped with: 1 Speeding Bulk and Flaming Exhaust; 1 Fixit's Wrench; 1 Grabba Dragga; 1 Psyko-gatler.
Points: 1 model: 200 pts

### Bannernob
Source: Codex · Keywords: INFANTRY; CHARACTER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Bannernob | 6" | 5 | 4+ | 4 | 7+ | 3 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Kustom Choppa | 4 | 3+ | 5 | -2 | 2 | - |

Core abilities: Support
Army rules: Waaagh!
Abilities:
Waaagh! Banner: This unit has +1 to charge rolls.
Unit composition: 1 Bannernob model, equipped with: 1 Kustom Choppa; 1 Shoota.
Points: 1 model: 30 pts
Supports: BOYZ, NOBZ

### Beastboss
Source: Codex · Keywords: INFANTRY; BEAST SNAGGA; CHARACTER; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Beastboss | 6" | 6 | 4+ | 6 | 6+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Shoota | 18" | 2 | 4+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Beast Snagga Klaw and Beastchoppa | 6 | 2+ | 12 | -2 | 2 | SUSTAINED HITS 2: MONSTER/VEHICLE |

Core abilities: Feel No Pain 6+, Leader
Army rules: Da Boss, Waaagh!
Abilities:
Keep Huntin'! (Once per battle round, per army): In your Movement phase, at the start or end of this unit's move, you can select one friendly BEAST SNAGGA unit within 6" of this unit. That unit is no longer battle-shocked and is riled up until the start of your next turn.
Dodge Dis!: This unit's attacks have +1 to hit rolls.
Unit composition: 1 Beastboss model, equipped with: 1 Shoota; 1 Beast Snagga Klaw and Beastchoppa.
Points: 1 model: 85 pts
Leads: BEAST SNAGGA BOYZ

### Big Mek
Source: Codex · Keywords: INFANTRY; CHARACTER; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Big Mek | 6" | 5 | 3+ | 6 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kustom Mega-blasta | 24" | 3 | 4+ | 9 | -2 | 3 | Hazardous |
| Traktor Blasta | 24" | 3 | 4+ | 6 | -2 | D3+3 | Anti-Fly 2+ |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Drilla | 3 | 3+ | 12 | -3 | 3 | - |
| Power Klaw | 5 | 3+ | 10 | -2 | 2 | - |

Wargear options:
• This model's Power Klaw can be replaced with 1 Drilla.
• This model's Kustom Mega-blasta can be replaced with 1 Traktor Blasta.

Core abilities: Leader
Army rules: Waaagh!
Abilities:
More Dakka: This unit's ranged attacks have [Ignores Cover], and if this unit is riled up, [Sustained Hits 1].
Shokk-boosta: In your Movement phase, when this unit is selected to make an advance move, you can use this ability. If you do: this unit can change that advance roll to a 6; this unit can move through all types of model; when this unit ends that advance move, make a hazard roll for each model in this unit.
Unit composition: 1 Big Mek model, equipped with: 1 Kustom Mega-blasta; 1 Power Klaw.
Points: 1st–2nd unit: 100 pts · 3rd+ unit: 115 pts
Leads: BOYZ, BREAKA BOYZ, FLASH GITZ, MEK GUNZ, NOBZ, TANKBUSTAS

### Big Mek In Mega Armour
Source: Codex · Keywords: INFANTRY; BIG MEK; CHARACTER; EXPLOSIVES; MEGA ARMOUR

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Big Mek In Mega Armour | 5" | 6 | 2+ | 5 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kombi-weapon - Shoota | 18" | 2 | 4+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kombi-weapon - Kill Shot | 24" | 1 | 4+ | 10 | -2 | 3 | - |
| Kombi-weapon - Point Blank | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |
| Kustom Mega-blasta | 24" | 3 | 4+ | 9 | -2 | 3 | Hazardous |
| Kustom Shoota - Aimed | 18" | 4 | 4+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Kustom Shoota - Point Blank | 6" | D3+3 | - | 4 | 0 | 1 | CLOSE-QUARTERS Torrent |
| Tellyport Blasta | 12" | 6 | 4+ | 9 | -2 | 3 | BLAST 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Killsaw | 3 | 4+ | 10 | -2 | 3 | - |
| Power Klaw | 3 | 3+ | 10 | -2 | 2 | - |

Wargear options:
• This model can be equipped with one of the following: 1 Tellyport Blasta; 1 Kustom Force Field.
• This model's Kustom Shoota can be replaced with one of the following: 1 Killsaw; 1 Kombi-weapon; 1 Kustom Mega-blasta.

Core abilities: Leader
Army rules: Waaagh!
Abilities:
Fix Dat Armour Up (Once per battle, per unit): In your Command phase, this unit heals 3 wounds.
More Dakka: This unit's ranged attacks have [Ignores Cover], and if this unit is riled up, [Sustained Hits 1].
Kustom Force Field: This unit has 4+ InSv against ranged attacks.
Unit composition: 1 Big Mek in Mega Armour model, equipped with: 1 Kustom Shoota; 1 Power Klaw.
Points: 1 model: 90 pts
Leads: MEGANOBZ, MEK GUNZ

### Big Mek With Shokk Attack Gun
Source: Codex · Keywords: INFANTRY; BIG MEK; CHARACTER; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Big Mek With Shokk Attack Gun | 6" | 5 | 4+ | 5 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Shokk Attack Gun | 60" | D3+3 | 5+ | 12 | -4 | D6+1 | BLAST 1 Heavy |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Mek's Toolz | 4 | 3+ | 5 | 0 | 1 | - |

Core abilities: Leader
Army rules: Waaagh!
Abilities:
More Dakka: This unit's ranged attacks have [Ignores Cover], and if this unit is riled up, [Sustained Hits 1].
Support Shokka: While this model is within 3" of a friendly ORKS INFANTRY unit (excluding BIG MEK WITH SHOKK ATTACK GUN units), this model has Lone Operative.
Unit composition: 1 Big Mek with Shokk Attack Gun model, equipped with: 1 Big Mek's Toolz; 1 Shokk Attack Gun.
Points: 1st unit: 110 pts · 2nd+ unit: 125 pts
Leads: BOYZ, MEK GUNZ, NOBZ, TANKBUSTAS

### Bigboss
Source: Codex · Keywords: INFANTRY; CHARACTER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Bigboss | 6" | 5 | 4+ | 5 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Choppa | 5 | 3+ | 7 | -2 | 2 | Precision |

Core abilities: Support
Army rules: Waaagh!
Abilities:
Sumfin' to Prove: This unit's melee attacks have +1 to hit rolls.
Unit composition: 1 Bigboss model, equipped with: 1 Big Choppa; 1 Slugga.
Points: 1 model: 50 pts
Supports: BOYZ, BREAKA BOYZ, NOBZ

### Mek
Source: Codex · Keywords: INFANTRY; CHARACTER; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Mek | 6" | 5 | 5+ | 4 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kustom Mega-slugga | 12" | 3 | 4+ | 8 | -2 | 3 | CLOSE-QUARTERS Hazardous |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Mek's Toolz | 3 | 3+ | 5 | 0 | 1 | - |

Core abilities: Support
Army rules: Waaagh!
Abilities:
Kustom Dakka: This unit's ranged attacks have [Ignores Cover].
Clever Know-wotz: In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS VEHICLE model (excluding AIRCRAFT/TITANIC models) within 3" of this model: that VEHICLE model heals D3 wounds, or that VEHICLE model's attacks have +1 to hit rolls until the start of your next Movement phase.
Unit composition: 1 Mek model, equipped with: 1 Kustom Mega-slugga; 1 Mek's Toolz.
Points: 1 model: 55 pts
Supports: BOYZ, FLASH GITZ, MEK GUNZ, NOBZ, TANKBUSTAS

### Painboss
Source: Codex · Keywords: INFANTRY; BEAST SNAGGA; CHARACTER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Painboss | 6" | 5 | 4+ | 4 | 7+ | 1 |

Invulnerable save: 6+

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Beast Snagga Klaw | 3 | 3+ | 10 | -2 | 2 | ANTI-MONSTER/VEHICLE 4+ |

Core abilities: Support
Army rules: Waaagh!
Abilities:
Push Dat Bit Back In (Once per battle, per unit): In your Command phase, select one friendly BEAST SNAGGA unit within 6" of this unit. That unit heals 3 wounds.
Hardy Bioniks: Attacks that target this unit with a S greater than this unit's T have -1 to wound rolls.
Runnin' wiv da Herd: While this model is attached to a MOUNTED unit, this model does not have INFANTRY, has MOBILE and MOUNTED, and has +4" M.
Unit composition: 1 Painboss model, equipped with: 1 Beast Snagga Klaw.
Points: 1st–2nd unit: 60 pts · 3rd+ unit: 70 pts
Supports: BEAST SNAGGA BOYZ, SQUIGHOG BOYZ

### Painboy
Source: Codex · Keywords: INFANTRY; CHARACTER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Painboy | 6" | 5 | 5+ | 3 | 7+ | 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| 'Urty Syringe | 1 | 3+ | 2 | 0 | D6 | anti-infantry 4+ DEVASTATING WOUNDS: INFANTRY Extra Attacks |
| Dok's Toolz | 3 | 3+ | 10 | -2 | 2 | - |

Core abilities: Support
Army rules: Waaagh!
Abilities:
Crude Surgery: In your Command phase, this unit heals 3 wounds.
Catch Dat Red Bit (Once per battle, per unit): When this model uses its Crude Surgery ability, you can add D3 to the number of wounds healed.
Unit composition: 1 Painboy model, equipped with: 1 Dok's Toolz; 1 'Urty Syringe.
Points: 1 model: 45 pts
Supports: BOYZ, BREAKA BOYZ, FLASH GITZ, NOBZ, TANKBUSTAS

### Runtherd
Source: Codex · Keywords: INFANTRY; CHARACTER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Runtherd | 6" | 5 | 5+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Runtherd's Toolz | 3 | 3+ | 5 | 0 | 1 | - |

Core abilities: Support
Army rules: Waaagh!
Abilities:
That'll Learn Ya (Once per battle round, per unit): When this unit becomes battle-shocked, if this unit contains 4+ Gretchin models, you can roll one D3: that number of Gretchin models in this unit are destroyed, and this unit is no longer battle-shocked.
Unit composition: 1 Runtherd model, equipped with: 1 Runtherd's Toolz; 1 Slugga.
Points: 1 model: 10 pts
Supports: GRETCHIN

### Warboss
Source: Codex · Keywords: INFANTRY; CHARACTER; EXPLOSIVES; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Warboss | 6" | 6 | 4+ | 6 | 6+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kombi-rokkit - Busta Rokkit | 24" | 1 | 5+ | 10 | -2 | 3 | - |
| Kombi-rokkit - Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kombi-skorcha - Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kombi-skorcha - Skorcha | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |
| Kustom Shoota | 18" | 4 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Kustom Choppa | 6 | 2+ | 7 | -2 | 2 | CLEAVE 2 |
| Power Klaw | 6 | 2+ | 12 | -2 | 2 | - |

Wargear options:
• This model's Kustom Choppa can be replaced with 1 Power Klaw.
• This model's Kustom Shoota can be replaced with one of the following: 1 Kombi-rokkit; 1 Kombi-skorcha.

Core abilities: Leader
Army rules: Da Boss, Waaagh!
Abilities:
Boss' Ammo Runt (Once per battle, per unit): In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this model's ranged attacks have +1 to hit rolls.
Might Is Right: If this unit made a charge move this turn, this model's melee attacks have +3 A and +2 S.
Intimidating Motivation (Once per battle round, per army): In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS unit within 6" of this unit. That unit is no longer battle-shocked and is riled up until the start of your next turn.
Unit composition: 1 Warboss model, equipped with: 1 Kustom Choppa; 1 Kustom Shoota.
Points: 1 model: 100 pts
Leads: BOYZ, BREAKA BOYZ, NOBZ

### Warboss In Mega Armour
Source: Codex · Keywords: INFANTRY; CHARACTER; MEGA ARMOUR; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Warboss In Mega Armour | 5" | 7 | 2+ | 7 | 6+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 4+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| 'Uge Choppa | 5 | 2+ | 12 | -2 | 3 | CLEAVE 2 |

Core abilities: Leader
Army rules: Da Boss, Waaagh!
Abilities:
Krushin' Impetus: When this unit ends a charge move, you can select one enemy unit engaged with this unit. If you do, roll one D6 for each model in this unit engaged with that enemy unit: for each 3+, that enemy unit suffers 1 mortal wound.
Intimidating Motivation (Once per battle round, per army): In your Movement phase, at the start or end of this unit's move, you can select one friendly ORKS unit within 6" of this unit. That unit is no longer battle-shocked and is riled up until the start of your next turn.
Unit composition: 1 Warboss in Mega Armour model, equipped with: 1 Big Shoota; 1 'Uge Choppa.
Points: 1st–2nd unit: 115 pts · 3rd+ unit: 130 pts
Leads: MEGANOBZ

### Weirdboy
Source: Codex · Keywords: INFANTRY; CHARACTER; PSYKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Weirdboy | 6" | 5 | 5+ | 4 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Power Vomit | 12" | 3 | - | 5 | -3 | 2 | BLAST 1 Hazardous PSYCHIC Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Copper Staff | 3 | 3+ | 8 | -1 | 2 | PSYCHIC |

Core abilities: Deadly Demise D3, Support
Army rules: Unstable Energies, Waaagh!
Abilities:
Waaagh! Energy (psyker level 1): This model has the psychic abilities listed in the Psychic Abilities section of the datasheet (not captured here; the Wurrband detachment also grants psychic abilities, see Part B).
Unit composition: 1 Weirdboy model, equipped with: 1 Power Vomit; 1 Copper Staff.
Points: 1 model: 60 pts
Supports: BEAST SNAGGA BOYZ, BOYZ

### Beastboss on Squigosaur
Source: Codex · Keywords: MONSTER; BEAST SNAGGA; CHARACTER; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Beastboss on Squigosaur | 10" | 9 | 3+ | 10 | 6+ | 3 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |
| Thump Gun | 18" | 3 | 5+ | 6 | 0 | 2 | ANTI-MONSTER/VEHICLE 4+ |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Beastchoppa - Standard | 6 | 2+ | 6 | -2 | 2 | CLEAVE 1 |
| Beastchoppa - Hunter | 6 | 2+ | 12 | -2 | D6 | - |
| Squigosaur's Jaws | 3 | 3+ | 7 | -2 | 3 | ANTI-MONSTER/VEHICLE 3+ Extra Attacks |

Wargear options:
• This model can be equipped with 1 Thump Gun.

Core abilities: Feel No Pain 5+
Army rules: Da Boss, Waaagh!
Abilities:
Thundering Stampede (Aura): Friendly BEAST SNAGGA units within 6" of this unit have +1 to charge rolls.
Keep Huntin'! (Once per battle round, per army): In your Movement phase, at the start or end of this unit's move, you can select one friendly BEAST SNAGGA unit within 6" of this unit. That unit is no longer battle-shocked and is riled up until the start of your next turn.
Boss of da Hunt: While this unit is within 3" of a friendly BEAST SNAGGA unit (excluding MONSTER CHARACTER units), this unit has Lone Operative.
Unit composition: 1 Beastboss on Squigosaur model, equipped with: 1 Beastchoppa; 1 Slugga; 1 Squigosaur's Jaws.
Points: 1st–2nd unit: 140 pts · 3rd+ unit: 155 pts

### Deffkilla Wartrike
Source: Codex · Keywords: MOUNTED; CHARACTER; SPEED FREEKS; WARBOSS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Deffkilla Wartrike | 12" | 6 | 4+ | 9 | 6+ | 3 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Boomstikks | 12" | 6 | 5+ | 5 | 0 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE |
| Snagga Klaw | 12" | 1 | 5+ | 7 | -2 | 2 | ASSAULT Precision |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Killa Jet - Burna | 3 | 3+ | 5 | -1 | 1 | CLEAVE 1 Extra Attacks |
| Killa Jet - Cutta | 1 | 3+ | 10 | -3 | D6+2 | Extra Attacks |
| Snagga Klaw | 5 | 2+ | 7 | -2 | 2 | CLEAVE 2 |

Core abilities: Deadly Demise 1, Leader
Army rules: Da Boss, Waaagh!
Abilities:
Get Back in da Race! (Once per battle round, per army): In your Movement phase, at the start or end of this unit's move, you can select one friendly SPEED FREEKS unit within 6" of this unit. That unit (and any units embarked within it) is no longer battle-shocked and is riled up until the start of your next turn.
Fuel-mixa Grot: This unit has +1 to advance rolls.
Unit composition: 1 Deffkilla Wartrike model, equipped with: 1 Boomstikks; 1 Killa Jet; 1 Snagga Klaw.
Points: 1 model: 80 pts
Leads: WARBIKERS

### Warboss on Warbike
Source: Legends · Keywords: CHARACTER; EXPLOSIVES; MOUNTED; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Warboss on Warbike | 12" | 6 | 4+ | 7 | 6+ | 2 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Dakkagun | 18" | 6 | 5+ | 5 | 0 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Killsaw | 6 | 3+ | 12 | -2 | 3 | - |
| Power Klaw | 6 | 2+ | 12 | -2 | 2 | - |
| Big Choppa | 6 | 2+ | 9 | -1 | 2 | CLEAVE 2 |

Wargear options:
• This model's Killsaw can be replaced with one of the following: 1 Big Choppa, 1 Power Klaw.

Core abilities: Leader
Army rules: Waaagh!, Da Boss
Abilities:
Get Back in Da Race: In your Movement phase, at the start or end of this unit's move, you can select one friendly SPEED FREEKS unit within 6" of this unit. That unit (and any units embarked within it) is no longer battle-shocked and is riled up until the start of your next turn.
Speedboss: This unit's melee attacks have +1 to hit rolls.
Unit composition: 1 Warboss on Warbike model, equipped with: 1 Dual Dakkagun; 1 Killsaw.
Points: 1 model: 75 pts
Leads: WARBIKERS

### Big Mek Dakkarig
Source: Codex · Keywords: VEHICLE; BIG MEK; CHARACTER; WALKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Big Mek Dakkarig | 8" | 8 | 3+ | 11 | 7+ | 3 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Blitzkannon | 24" | 8 | 4+ | 7 | -2 | 2 | Ignores Cover LETHAL HITS: non-MONSTER/VEHICLE |
| Multi-busta Launcha | 24" | 6 | 5+ | 10 | -2 | 3 | Ignores Cover Lethal Hits |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Stompy Feet | 4 | 3+ | 6 | -1 | 1 | - |

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Even More Dakka: If this unit is riled up, this unit's ranged attacks have [Sustained Hits 1].
Blitz Dem Gitz!: In your Shooting phase, if this unit's Blitzkannon weapon targets a unit (excluding MONSTER/VEHICLE units), that weapon has +6 A.
Unit composition: 1 Big Mek Dakkarig model, equipped with: 1 Blitzkannon; 1 Multi-busta Launcha; 1 Stompy Feet.
Points: 1st–2nd unit: 160 pts · 3rd+ unit: 180 pts

### Beast Snagga Boyz
Source: Codex · Keywords: INFANTRY; BATTLELINE; BEAST SNAGGA; MOB

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Beast Snagga Boy | 6" | 5 | 5+ | 1 | 7+ | 2 |
| Nob | 6" | 5 | 5+ | 3 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |
| Thump Gun | 18" | 3 | 5+ | 6 | 0 | 2 | ANTI-MONSTER/VEHICLE 4+ |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa - Standard | 3 | 3+ | 5 | -1 | 1 | - |
| Choppa - Hunter | 3 | 3+ | 6 | -2 | 1 | - |
| Power Snappa | 3 | 3+ | 8 | -2 | 2 | ANTI-MONSTER/VEHICLE 4+ |

Wargear options:
• For every 10 models in this unit, 1 Beast Snagga Boy model can be equipped with 1 Thump Gun.

Army rules: Waaagh!
Abilities:
Mobbed: When this unit ends a charge move, each enemy MONSTER/VEHICLE unit engaged with this unit makes a battle-shock roll, with -1 to that roll, or -2 if this unit has 13+ models.
Unit composition: 1-2 Nob models; 9-18 Beast Snagga Boy models. Every Nob: 1 Power Snappa; 1 Slugga. Every Beast Snagga Boy: 1 Choppa; 1 Slugga.
Points (1st–3rd units): 10 models: 80 pts · 20 models: 160 pts. Points (4th+ unit): 10 models: 90 pts · 20 models: 170 pts

### Boyz
Source: Codex · Keywords: INFANTRY; BATTLELINE; EXPLOSIVES; MOB

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Boy | 6" | 5 | 5+ | 1 | 7+ | 2 |
| Nob | 6" | 5 | 5+ | 3 | 7+ | 2 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Burna | 12" | 3 | - | 4 | 0 | 1 | BLAST 1 Torrent |
| Kombi-rokkit - Busta Rokkit | 24" | 1 | 5+ | 10 | -2 | 3 | - |
| Kombi-rokkit - Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kombi-skorcha - Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kombi-skorcha - Skorcha | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |
| Kustom Shoota | 18" | 4 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |
| Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Choppa | 4 | 3+ | 7 | -1 | 2 | CLEAVE 2 |
| Choppa | 3 | 3+ | 5 | -1 | 1 | - |
| Kustom Choppa | 4 | 3+ | 5 | -2 | 2 | - |
| Power Klaw | 3 | 3+ | 10 | -2 | 2 | - |

Wargear options:
• Any number of Nob models can each have their Kustom Choppa and Kombi-skorcha replaced with 1 Big Choppa.
• Any number of Nob models can each have their Kustom Choppa replaced with 1 Power Klaw.
• Any number of Nob models can each have their Kombi-skorcha replaced with one of the following: 1 Kombi-rokkit; 1 Kustom Shoota.
• For every 10 models in this unit, 1 Boy model can have their Shoota replaced with 1 Big Shoota.
• For every 10 models in this unit, 1 Boy model can have their Shoota replaced with 1 Rokkit Launcha.
• For every 10 models in this unit, 1 Boy model can have their Shoota replaced with 1 Burna.

Army rules: Waaagh!
Abilities:
Ammo Runts (Once per battle, per unit): In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have +1 to hit rolls.
Tide of Muscle: In the Fight phase, if this unit made a charge move this turn, this unit's melee attacks have [Lethal Hits].
Never Too Busy to Fight: Being engaged does not prevent this unit from being eligible to start an action.
Unit composition: 1-2 Nob models; 9-18 Boy models. Every Nob: 1 Kustom Choppa; 1 Kombi-skorcha. Every Boy: 1 Choppa; 1 Shoota; 1 Slugga.
Points (1st–3rd units): 10 models: 85 pts · 20 models: 170 pts. Points (4th+ unit): 10 models: 95 pts · 20 models: 180 pts

### Trukk
Source: Codex · Keywords: VEHICLE; DEDICATED TRANSPORT; FRAME; SPEED FREEKS; TRANSPORT

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Trukk | 12" | 8 | 4+ | 10 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Big Shoota | 36" | 6 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Buzzsaw | 2 | 3+ | 6 | -1 | 2 | CLEAVE 1 Extra Attacks |
| Grabbin' Klaw | 2 | 3+ | 10 | -2 | 2 | Extra Attacks |
| Spiked Ram | 3 | 3+ | 6 | 0 | 1 | CLEAVE 1 |

Wargear options:
• This model's Dual Big Shoota can be replaced with 1 Rokkit Launcha.
• This model can be equipped with one of the following: 1 Buzzsaw; 1 Grabbin' Klaw.

Core abilities: Deadly Demise D3, Firing Deck 12
Army rules: Waaagh!
Abilities:
Pilin' Out: In your opponent's Movement phase, when an enemy unit ends a move within 8" of this model, units embarked within this model can make a disembark move using the rapid disembark mode.
Transport: capacity 12 ORKS INFANTRY models. Cannot transport GHAZGHKULL THRAKA/JUMP PACK models. Each MEGA ARMOUR model takes up the space of 2 models.
Unit composition: 1 Trukk model, equipped with: 1 Dual Big Shoota; 1 Spiked Ram.
Points (1st–3rd units): 1 model: 60 pts · Points (4th+ unit): 1 model: 70 pts

### Blitza-bommer
Source: Codex · Keywords: VEHICLE; AIRCRAFT; FLY; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Blitza-bommer | - | 9 | 3+ | 12 | 7+ | - |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Dual Supa-shoota | 36" | 8 | 5+ | 6 | -1 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured Impact | 3 | 4+ | 6 | 0 | 1 | - |

Core abilities: Damaged 4, Deadly Demise D3
Army rules: Waaagh!
Abilities:
Boom Bomb: At the end of your opponent's Fight phase, select one visible enemy unit (excluding Lone Operative units) within 24" of this unit, and roll one D6: on a 1-3, that enemy unit suffers D3 mortal wounds; on a 4-5, 3 mortal wounds; on a 6, D3+3 mortal wounds.
Unit composition: 1 Blitza-bommer model, equipped with: 1 Armoured Impact; 1 Big Shoota; 1 Dual Supa-shoota.
Points: 1 model: 115 pts

### Burna-bommer
Source: Codex · Keywords: VEHICLE; AIRCRAFT; FLY; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Burna-bommer | - | 9 | 3+ | 12 | 7+ | - |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Big Shoota | 36" | 6 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Dual Supa Shoota | 36" | 8 | 5+ | 6 | -1 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 Sustained Hits 1 |
| Skorcha Missile Rack | 36" | 6 | 5+ | 5 | 0 | 1 | BLAST 2 Ignores Cover |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured Impact | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model can be equipped with 1 Skorcha Missile Rack.

Core abilities: Damaged 4, Deadly Demise D3
Army rules: Waaagh!
Abilities:
Burna Bomb: At the end of your opponent's Fight phase, select one visible enemy unit (excluding Lone Operative and MONSTER/VEHICLE units) within 36" of this unit, and roll one D6. On a 2+: that enemy unit suffers D3 mortal wounds; it cannot be hidden until the end of your next turn; ranged attacks that target it have [IGNORES COVER] until the end of your next turn.
Unit composition: 1 Burna-bommer model, equipped with: 1 Armoured Impact; 1 Dual Big Shoota; 1 Dual Supa Shoota.
Points: 1 model: 125 pts

### Dakkajet
Source: Codex · Keywords: VEHICLE; AIRCRAFT; FLY; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Dakkajet | - | 9 | 3+ | 12 | 7+ | - |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Supa-shoota | 36" | 8 | 5+ | 6 | -1 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured Impact | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model can be equipped with 1 Dual Supa-shoota.

Core abilities: Damaged 4, Deadly Demise D3
Army rules: Waaagh!
Abilities:
Strafing Run: In your Shooting phase, this unit's ranged attacks that target a unit (excluding FLY units) have +1 to hit rolls.
Unit composition: 1 Dakkajet model, equipped with: 1 Armoured Impact; 2 Dual Supa-shoota.
Points: 1 model: 125 pts

### Wazbom Blastajet
Source: Codex · Keywords: VEHICLE; AIRCRAFT; FLY; SMOKE; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Wazbom Blastajet | - | 9 | 3+ | 12 | 7+ | - |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Supa-shoota | 36" | 8 | 4+ | 6 | -1 | 1 | Ignores Cover LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Dual Tellyport Mega-blasta | 24" | 6 | 4+ | 9 | -2 | 3 | BLAST 1 Ignores Cover Rapid Fire 6 |
| Dual Wazbom Mega-kannon | 36" | 4 | 4+ | 12 | -2 | 4 | Hazardous Ignores Cover |
| Smasha Gun | 48" | 4 | 4+ | 6 | -3 | 3 | Ignores Cover |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured Impact | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model's Dual Wazbom Mega-kannon can be replaced with 1 Dual Tellyport Mega-blasta.
• This model can be equipped with 1 Blastajet Force Field.
• This model can be equipped with 1 Dual Supa-shoota.

Core abilities: Damaged 4, Deadly Demise D3
Army rules: Waaagh!
Abilities:
Go fer da Weak Spot: In your Shooting phase, this unit's ranged attacks that target a MONSTER/VEHICLE unit have +1 to wound rolls.
Blastajet Force Field: Models in this unit have 5+ InSv and do not have SMOKE.
Unit composition: 1 Wazbom Blastajet model, equipped with: 1 Armoured Impact; 1 Smasha Gun; 1 Dual Wazbom Mega-kannon.
Points (1st–2nd units): 1 model: 215 pts · Points (3rd+ unit): 1 model: 235 pts

### Breaka Boyz
Source: Codex · Keywords: INFANTRY; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Breaka Boy | 6" | 5 | 4+ | 2 | 7+ | 1 |
| Nob | 6" | 5 | 4+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Rokkit Pistol | 12" | 1 | 5+ | 10 | -2 | 3 | CLOSE-QUARTERS |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Smash Hammer - Standard | 3 | 3+ | 7 | -2 | 2 | - |
| Smash Hammer - Hunter | 3 | 3+ | 12 | -2 | 3 | - |
| Choppa | 4 | 3+ | 5 | -1 | 1 | - |
| Knucklebustas | 4 | 3+ | 5 | -2 | 2 | ANTI-MONSTER/VEHICLE 4+ |
| Tankhammer | 3 | 4+ | 12 | -2 | 3 | Devastating Wounds Hazardous |

Wargear options:
• The Nob can have their Smash Hammer replaced with 1 Rokkit Pistol.
• 1 Breaka Boy model can have their Smash Hammer replaced with 1 Knucklebustas.
• 1 Breaka Boy model can have their Smash Hammer replaced with 1 Tankhammer.

Army rules: Waaagh!
Abilities:
Bomb Squigs (Once per turn, twice per battle, per unit): In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12" of this unit and roll one D6: on a 3+, that enemy unit suffers D3 mortal wounds.
Trophy Hunters: This unit has +1 to charge rolls.
Unit composition: 1 Nob model; 5 Breaka Boy models. The Nob: 1 Choppa; 1 Rokkit Pistol; 1 Smash Hammer. Every Breaka Boy: 1 Smash Hammer.
Points (1st–2nd units): 6 models: 120 pts · Points (3rd+ unit): 6 models: 130 pts

### Flash Gitz
Source: Codex · Keywords: INFANTRY; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Flash Git | 6" | 5 | 4+ | 3 | 7+ | 1 |
| Kaptin | 6" | 5 | 4+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Snazzgun - Cutta | 12" | 1 | 4+ | 9 | -3 | D3+2 | Hazardous Melta 2 |
| Snazzgun - Dakka | 24" | 3 | 4+ | 6 | -1 | 2 | LETHAL HITS: non-MONSTER/VEHICLE Sustained Hits 1 |
| Snazzgun - Kill Shot | 36" | 2 | 4+ | 8 | -2 | 2 | Hazardous |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa | 4 | 3+ | 5 | -1 | 1 | - |

Army rules: Waaagh!
Abilities:
Finderz Keeperz: In your Shooting phase, if this unit is within range of an objective, or the target of that attack is within range of an objective, this unit's ranged attacks have +1 AP.
Unit composition: 1 Kaptin model; 4-9 Flash Git models. Every model: 1 Choppa; 1 Snazzgun.
Points (1st–2nd units): 5 models: 110 pts · 10 models: 220 pts. Points (3rd+ unit): 5 models: 150 pts · 10 models: 260 pts

### Gretchin
Source: Codex · Keywords: INFANTRY; GROTS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Gretchin | 6" | 2 | 6+ | 1 | 8+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Grot Blasta | 12" | 1 | 4+ | 3 | 0 | 1 | CLOSE-QUARTERS |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Scavenged Shivs | 1 | 5+ | 2 | 0 | 1 | - |

Army rules: Waaagh!
Abilities:
Downtrodden: For the purposes of transport capacity, each 2 Gretchin models (rounding up) take up the space of 1 model.
Thievin' Scavengers: At the end of your Movement phase, if this unit is controlling an objective, that objective is secured.
Unit composition: 10-20 Gretchin models. Every model: 1 Scavenged Shivs; 1 Grot Blasta.
Points: 10 models: 45 pts · 20 models: 80 pts

### Kommandos
Source: Codex · Keywords: INFANTRY; EXPLOSIVES; SMOKE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Kommando | 6" | 5 | 5+ | 1 | 7+ | 1 |
| Nob | 6" | 5 | 5+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Burna | 12" | 3 | - | 4 | 0 | 1 | BLAST 1 Torrent |
| Kustom Shoota | 18" | 4 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Choppa | 4 | 3+ | 7 | -1 | 2 | CLEAVE 2 |
| Breacha Ram | 2 | 4+ | 8 | -2 | 2 | - |
| Choppa | 3 | 3+ | 5 | -1 | 1 | - |
| Power Klaw | 3 | 3+ | 10 | -2 | 2 | - |

Wargear options:
• The Nob can have their Choppa replaced with one of the following: 1 Big Choppa; 1 Power Klaw.
• 1 Kommando model can be equipped with 1 Burna.
• 1 Kommando model can be equipped with 1 Rokkit Launcha.
• 1 Kommando model can have their Choppa replaced with 1 Breacha Ram.
• Up to 2 Kommando models can each be equipped with 1 Kustom Shoota.

Core abilities: Infiltrators, Stealth
Army rules: Waaagh!
Abilities:
Found 'Em!: In your Movement phase, you can select one enemy unit within 12" of this unit. That unit has +3" detection range until the end of the turn.
Taktikal Know-wotz: In the Declare Battle Formations step, you can split this unit into two units, each with a starting strength of 5. If you do, select which one of those units will have the Bomb Squig ability and which one will have the Found 'Em! ability.
Nowhere to Hide: This unit's attacks that target a hidden unit have +1 to hit rolls.
Bomb Squig (Once per battle, per unit): In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12" of this unit and roll one D6: on a 3+, that enemy unit suffers D3 mortal wounds.
Unit composition: 1 Nob model; 9 Kommando models. Every model: 1 Choppa; 1 Slugga.
Points: 10 models: 125 pts

### Meganobz
Source: Codex · Keywords: INFANTRY; EXPLOSIVES; MEGA ARMOUR

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Meganob | 5" | 6 | 2+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kombi-weapon - Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kombi-weapon - Kill Shot | 24" | 1 | 5+ | 10 | -2 | 3 | - |
| Kombi-weapon - Point Blank | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |
| Kustom Shoota - Aimed | 18" | 4 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Kustom Shoota - Point Blank | 6" | D3+3 | - | 4 | 0 | 1 | CLOSE-QUARTERS Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Killsaw | 3 | 4+ | 10 | -2 | 3 | - |
| Power Klaw | 3 | 3+ | 10 | -2 | 2 | - |
| Twin Killsaws | 3 | 4+ | 10 | -2 | 3 | Twin-linked |

Wargear options:
• Any number of models can each have their Power Klaw replaced with 1 Killsaw (+5 pts each).
• Any number of models can each have their Kustom Shoota replaced with 1 Kombi-weapon.
• Any number of models can each have their Power Klaw and Kustom Shoota replaced with 1 Twin Killsaws (+5 pts each).

Army rules: Waaagh!
Abilities:
Arrogant Invulnerability: Attacks that target this unit have -1 AP.
Krumpin' Time: In the Fight phase, if this unit is riled up, this unit has +1 to hit rolls.
Unit composition: 2-6 Meganob models. Every model: 1 Kustom Shoota; 1 Power Klaw.
Points (1st–2nd units): 2 models: 70 · 3 models: 105 · 5 models: 175 · 6 models: 210 pts. Points (3rd+ unit): 2 models: 110 · 3 models: 145 · 5 models: 215 · 6 models: 250 pts

### Nobz
Source: Codex · Keywords: INFANTRY; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Nob | 6" | 5 | 4+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Skorcha | 18" | 3 | - | 5 | -1 | 1 | BLAST 2 Torrent |
| Kustom Big Shoota | 18" | 8 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE |
| Kombi-rokkit - Busta Rokkit | 24" | 1 | 5+ | 10 | -2 | 3 | - |
| Kombi-rokkit - Shoota | 18" | 2 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 1 |
| Kustom Shoota | 18" | 4 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Choppa | 4 | 3+ | 7 | -1 | 2 | CLEAVE 2 |
| Kustom Choppa | 4 | 3+ | 5 | -2 | 2 | - |
| Kustom Krumpa | 3 | 3+ | 10 | -2 | 2 | - |

Wargear options:
• For every 5 models in this unit, 1 model can have their Kustom Krumpa and Kustom Shoota replaced with 1 Big Skorcha and 1 Kustom Choppa.
• For every 5 models in this unit, 1 model can have their Kustom Krumpa and Kustom Shoota replaced with 1 Kustom Big Shoota and 1 Kustom Choppa.
• For every 5 models in this unit, 1 model can have their Kustom Krumpa and Kustom Shoota replaced with 1 Big Choppa.
• For every 5 models in this unit, 1 model can have their Kustom Shoota replaced with 1 Paired Krumpas (+5 pts each).
• Any number of models can each have their Kustom Shoota replaced with 1 Kombi-rokkit.

Army rules: Waaagh!
Abilities:
Get Out da Way!: While making a charge move, this unit can move through models (excluding MONSTER/VEHICLE models).
Ammo Runts (Once per battle, per unit): In your Shooting phase, when this unit is selected to shoot, you can use this ability. If you do, this unit's ranged attacks have +1 to hit rolls.
Paired Krumpas: Attacks made with this model's Kustom Krumpa weapon can re-roll hit rolls and wound rolls.
Unit composition: 5-10 Nob models. Every model: 1 Kustom Krumpa; 1 Kustom Shoota.
Points (1st–2nd units): 5 models: 115 pts · 10 models: 230 pts. Points (3rd+ unit): 5 models: 145 pts · 10 models: 260 pts

### Stormboyz
Source: Codex · Keywords: INFANTRY; EXPLOSIVES; FLY; JUMP PACK

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Stormboy | 12" | 5 | 5+ | 1 | 7+ | 1 |
| Nob | 12" | 5 | 5+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa | 3 | 3+ | 5 | -1 | 1 | - |
| Kustom Choppa | 4 | 3+ | 5 | -2 | 2 | - |
| Power Klaw | 3 | 3+ | 10 | -2 | 2 | - |

Wargear options:
• The Nob can have their Kustom Choppa replaced with 1 Power Klaw.

Core abilities: Deep Strike
Army rules: Waaagh!
Abilities:
Rokkit Charge: When this unit is selected to fight, if this unit made a charge move this turn, you can use this ability. If you do, this unit's melee attacks have +1 A and S, and [Hazardous].
Unit composition: 1 Nob model; 4-9 Stormboy models. The Nob: 1 Kustom Choppa; 1 Slugga. Every Stormboy: 1 Choppa; 1 Slugga.
Points: 5 models: 70 pts · 10 models: 140 pts

### Tankbustas
Source: Codex · Keywords: INFANTRY; EXPLOSIVES

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Tankbusta | 6" | 5 | 4+ | 2 | 7+ | 1 |
| Nob | 6" | 5 | 4+ | 3 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Busta Rokkit Launcha - Standard | 24" | 2 | 4+ | 10 | -2 | 3 | - |
| Busta Rokkit Launcha - Hunter | 24" | 3 | 4+ | 12 | -2 | 3 | - |
| Rokkit Pistol | 12" | 1 | 4+ | 10 | -2 | 3 | CLOSE-QUARTERS |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa | 4 | 3+ | 5 | -1 | 1 | - |
| Gitstikka | 3 | 3+ | 5 | 0 | 1 | - |
| Smash Hammer - Standard | 3 | 3+ | 7 | -2 | 2 | - |
| Smash Hammer - Hunter | 3 | 3+ | 12 | -2 | 3 | - |

Wargear options:
• The Nob can have their Rokkit Pistol replaced with 1 Smash Hammer.
• 1 Tankbusta model can be equipped with one of the following: 1 Busta Rokkit Launcha; 1 Pulsa Rokkit.

Army rules: Waaagh!
Abilities:
Rokkit Barrage: In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. That unit makes a battle-shock roll, with -1 to that battle-shock roll.
Bomb Squigs (Once per turn, twice per battle, per unit): In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12" of this unit and roll one D6: on a 3+, that enemy unit suffers D3 mortal wounds.
Pulsa Rokkit (Once per battle, per unit): In your Shooting phase, when this unit is selected to shoot, you can select one enemy MONSTER/VEHICLE unit within 24" of this unit. If you do, this unit's attacks that target that unit have +1 AP and [LETHAL HITS].
Unit composition: 1 Nob model; 5 Tankbusta models. The Nob: 1 Choppa; 2 Rokkit Pistol. Every Tankbusta: 1 Busta Rokkit Launcha; 1 Gitstikka.
Points (1st–2nd units): 6 models: 160 pts · Points (3rd+ unit): 6 models: 170 pts

### Burna Boyz
Source: Legends · Keywords: INFANTRY

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Burna Boy | 6" | 5 | 5+ | 1 | 7+ | 1 |
| Spanner | 6" | 5 | 5+ | 1 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Burna | 12" | 3 | - | 4 | 0 | 1 | BLAST 1 Torrent |
| Kustom Mega-blasta | 24" | 3 | 5+ | 9 | -2 | 3 | Hazardous |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Gun Stock and Fists | 2 | 3+ | 5 | 0 | 1 | - |
| Cuttin' Flames | 2 | 4+ | 4 | -2 | 1 | - |

Wargear options:
• Any number of Spanner models can each have their Big Shoota replaced with one of the following: 1 Kustom Mega-blasta, 1 Rokkit Launcha.

Army rules: Waaagh!
Abilities:
Pyromaniaks: This unit's attacks that target a unit within 6" of this unit can re-roll wound rolls of 1.
Unit composition: 1-2 Spanner models; 4-8 Burna Boy models. Every Spanner: 1 Big Shoota; 1 Gun Stock and Fists. Every Burna Boy: 1 Burna; 1 Cuttin' Flames.
Points: 5 models: 60 pts · 10 models: 120 pts

### Lootas
Source: Legends · Keywords: INFANTRY

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Spanner | 6" | 5 | 5+ | 1 | 7+ | 1 |
| Loota | 6" | 5 | 5+ | 1 | 7+ | 1 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Deffgun | 48" | 2 | 6+ | 8 | -1 | 2 | Heavy Rapid Fire 1 |
| Kustom Mega-blasta | 24" | 3 | 5+ | 9 | -2 | 3 | Hazardous |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Gun Stock and Fists | 2 | 3+ | 5 | 0 | 1 | - |

Wargear options:
• Any number of Spanner models can each have their Big Shoota replaced with one of the following: 1 Kustom Mega-blasta, 1 Rokkit Launcha.

Army rules: Waaagh!
Abilities:
Dat's Our Loot: This unit's ranged attacks can re-roll hit rolls of 1. This unit's ranged attacks that target a unit within range of an objective can re-roll hit rolls.
Unit composition: 1-2 Spanner models; 4-8 Loota models. Every Spanner: 1 Big Shoota; 1 Gun Stock and Fists. Every Loota: 1 Deffgun; 1 Gun Stock and Fists.
Points (1st–2nd units): 5 models: 50 pts · 10 models: 100 pts. Points (3rd+ unit): 5 models: 60 pts · 10 models: 110 pts

### Hunta Rig
Source: Codex · Keywords: MONSTER; BEAST SNAGGA; TRANSPORT; WAGON

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Hunta Rig | 10" | 10 | 3+ | 16 | 7+ | 5 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| 'Eavy Lobba | 48" | 3 | 5+ | 6 | 0 | 2 | BLAST 2 Indirect Fire |
| Stikka Kannon | 12" | 1 | 5+ | 12 | -2 | 3 | ANTI-MONSTER/VEHICLE 2+ |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Butcha Boyz | 4 | 3+ | 5 | -1 | 1 | ANTI-MONSTER/VEHICLE 4+ |
| Savage Horns and Hooves | 4 | 4+ | 8 | -1 | 3 | Extra Attacks Lance |
| Saw Blades | 6 | 3+ | 10 | -2 | 2 | CLEAVE 1 Extra Attacks |

Core abilities: Damaged 6, Deadly Demise D6, Feel No Pain 5+, Firing Deck 11
Army rules: Waaagh!
Abilities:
Fully Loaded Butchery: This unit's Butcha Boyz weapon has +2 A for each model embarked within this unit (to a maximum of +22 A).
Tramplasquig Charge: When you target this unit with the Crushing Impact stratagem, that use is -1 CP.
Transport: capacity 22 BEAST SNAGGA INFANTRY models.
Unit composition: 1 Hunta Rig model, equipped with: 1 Butcha Boyz; 1 'Eavy Lobba; 1 Savage Horns and Hooves; 1 Saw Blades; 1 Stikka Kannon.
Points (1st–2nd units): 1 model: 165 pts · Points (3rd+ unit): 1 model: 185 pts

### Kill Rig
Source: Codex · Keywords: MONSTER; BEAST SNAGGA; PSYKER; TRANSPORT; WAGON

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Kill Rig | 10" | 10 | 3+ | 16 | 7+ | 5 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| 'Eavy Lobba | 48" | 3 | 5+ | 6 | 0 | 2 | BLAST 2 Indirect Fire |
| Stikka Kannon | 12" | 1 | 5+ | 12 | -2 | 3 | ANTI-MONSTER/VEHICLE 2+ |
| Wurrtower | 24" | 1 | - | 12 | -3 | 6 | Hazardous PSYCHIC Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Butcha Boyz | 4 | 3+ | 5 | -1 | 1 | ANTI-MONSTER/VEHICLE 4+ Extra Attacks |
| Savage Horns and Hooves | 4 | 4+ | 8 | -1 | 3 | Extra Attacks Lance |
| Saw Blades | 6 | 3+ | 10 | -2 | 2 | CLEAVE 1 Extra Attacks |

Core abilities: Damaged 6, Deadly Demise D6, Feel No Pain 5+
Army rules: Unstable Energies, Waaagh!
Abilities:
Wurrboy (psyker level 1): This model has the psychic abilities listed in the Psychic Abilities section of the datasheet (not captured here).
Transport: capacity 12 BEAST SNAGGA INFANTRY models.
Unit composition: 1 Kill Rig model, equipped with: 1 Butcha Boyz; 1 'Eavy Lobba; 1 Savage Horns and Hooves; 1 Saw Blades; 1 Stikka Kannon; 1 Wurrtower.
Points (1st–2nd units): 1 model: 175 pts · Points (3rd+ unit): 1 model: 195 pts

### Gargantuan Squiggoth
Source: Forge World · Keywords: FRAME; MONSTER; TITANIC; TOWERING; TRANSPORT

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Gargantuan Squiggoth | 10" | 13 | 3+ | 30 | 7+ | 12 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kannon - frag | 36" | 6 | 5+ | 5 | 0 | 1 | Rapid Fire 6 Blast 1 |
| Kannon - shell | 36" | 2 | 5+ | 10 | -2 | D6+1 | Rapid Fire 2 |
| Supa-kannon | 60" | 8 | 5+ | 12 | -2 | 3 | Blast 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Huge tusks | 6 | 3+ | 14 | -3 | 12 | CLEAVE 2 |

Wargear options:
• This model's Kannon can be replaced with 1 Supa-kannon.
• This model can be equipped with one of the following: 1 kannon; 1 supa-kannon.

Core abilities: Deadly Demise 2D6, Firing Deck 11, Damaged 10, Super-heavy Walker
Army rules: Waaagh!
Abilities:
Walking Bastion: This unit's attacks can ignore modifiers to BS/WS and to hit rolls.
Transport: capacity 22 ORKS INFANTRY models. Each MEGA ARMOUR or JUMP PACK model takes up the space of 2 models. GHAZGHKULL THRAKA takes up the space of 4 models.
Unit composition: 1 Gargantuan Squiggoth, equipped with: 1 Huge Tusks; 1 Kannon.
Points (1st unit): 1 model: 500 pts · Points (2nd+ unit): 1 model: 600 pts

### Deffkoptas
Source: Codex · Keywords: MOUNTED; EXPLOSIVES; FLY; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Deffkopta | 12" | 6 | 4+ | 4 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | Lethal Hits |
| Kustom Mega-blasta | 24" | 3 | 5+ | 9 | -2 | 3 | Hazardous Lethal Hits |
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa | 3 | 4+ | 5 | -1 | 1 | - |
| Spinnin' Blades | 4 | 3+ | 5 | -1 | 1 | CLEAVE 1 Hazardous |

Wargear options:
• For every 3 models in this unit, 1 model can have their Rokkit Launcha replaced with 1 Kustom Mega-blasta.

Core abilities: Deep Strike
Army rules: Waaagh!
Abilities:
Deff from Above: In your Shooting phase, if this unit made an ingress move this turn, this unit's ranged attacks have +1 to hit rolls.
Aerial Manoover: At the end of your opponent's Fight phase, if this unit is unengaged, you can place this unit in strategic reserves.
Unit composition: 3-6 Deffkopta models. Every model: 1 Choppa; 1 Rokkit Launcha; 1 Slugga; 1 Spinnin' Blades.
Points (1st–2nd units): 3 models: 85 pts · 6 models: 170 pts. Points (3rd+ unit): 3 models: 95 pts · 6 models: 180 pts

### Squighog Boyz
Source: Codex · Keywords: MOUNTED; BEAST SNAGGA; EXPLOSIVES; MOBILE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Squighog Boy | 10" | 6 | 4+ | 3 | 7+ | 2 |
| Nob on Smasha Squig | 10" | 6 | 4+ | 4 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Saddlegit's Shiv | 9" | 1 | 4+ | 3 | 0 | 1 | ASSAULT |
| Slugga | 12" | 1 | 5+ | 4 | 0 | 1 | CLOSE-QUARTERS LETHAL HITS: non-MONSTER/VEHICLE |
| Stikka | 9" | 1 | 5+ | 5 | -1 | 2 | ANTI-MONSTER/VEHICLE 4+ ASSAULT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Big Choppa | 4 | 3+ | 7 | -1 | 2 | ANTI-MONSTER/VEHICLE 4+ CLEAVE 2 |
| Squig's Jaws | 3 | 4+ | 6 | -1 | 2 | Extra Attacks |
| Stikka | 3 | 3+ | 5 | -1 | 2 | ANTI-MONSTER/VEHICLE 4+ |

Army rules: Waaagh!
Abilities:
Bomb Squig (Once per battle, per unit): In your Movement phase, when this unit ends a normal move, you can select one visible enemy unit within 12" of this unit and roll one D6: on a 3+, that enemy unit suffers D3 mortal wounds.
Brutal Impact: If this unit made a charge move this turn, this unit's attacks have +1 D.
Unit composition: 1-2 Nob on Smasha Squig models; 3-6 Squighog Boy models. Every Nob on Smasha Squig: 1 Big Choppa; 1 Slugga; 1 Squig's Jaws. Every Squighog Boy: 1 Saddlegit's Shiv; 1 Squig's Jaws; 1 Stikka.
Points (1st–2nd units): 4 models: 130 pts · 8 models: 260 pts. Points (3rd+ unit): 4 models: 160 pts · 8 models: 290 pts

### Warbikers
Source: Codex · Keywords: MOUNTED; EXPLOSIVES; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Warbiker | 12" | 6 | 4+ | 3 | 7+ | 2 |
| Biker Nob | 12" | 6 | 4+ | 4 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Kombi-rokkit - Dakkagun | 18" | 6 | 5+ | 5 | 0 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE |
| Dual Kombi-rokkit - Busta Rokkit | 24" | 2 | 5+ | 10 | -2 | 3 | ASSAULT |
| Dual Dakkagun | 18" | 6 | 5+ | 5 | 0 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Choppa | 3 | 3+ | 5 | -1 | 1 | - |
| Kustom Choppa | 4 | 3+ | 5 | -2 | 2 | - |

Army rules: Waaagh!
Abilities:
High-speed Carnage: If this unit made a charge move this turn, this unit's melee attacks have +1 S and D.
Unit composition: 1 Biker Nob model; 2-5 Warbiker models. The Biker Nob: 1 Kustom Choppa; 1 Dual Kombi-rokkit. Every Warbiker: 1 Choppa; 1 Dual Dakkagun.
Points: 3 models: 75 pts · 6 models: 140 pts

### Wartrakks
Source: Codex · Keywords: MOUNTED; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Wartrakk | 12" | 6 | 4+ | 7 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kustom Shoota | 18" | 4 | 5+ | 4 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Multi-busta Launcha | 24" | D3+3 | 5+ | 10 | -2 | 3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Kustom Choppa | 4 | 3+ | 5 | -2 | 2 | - |

Army rules: Waaagh!
Abilities:
Speednob Support: While each model in this unit is within 3" of a friendly SPEED FREEKS unit (excluding WARTRAKK units), this unit has Lone Operative.
Bust 'Em: In your Shooting phase, when this unit has shot, select one enemy unit hit by those attacks. That unit is busted until the end of the turn: friendly SPEED FREEKS units' attacks that target a busted unit have [Lethal Hits].
Unit composition: 1-2 Wartrakk models. Every model: 1 Kustom Choppa; 1 Kustom Shoota; 1 Multi-busta Launcha.
Points: 1 model: 70 pts · 2 models: 130 pts

### Gorkanaut
Source: Codex · Keywords: VEHICLE; TITANIC; TOWERING; TRANSPORT; WALKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Gorkanaut | 9" | 12 | 2+ | 20 | 7+ | 8 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Deffstorm Mega-shoota - Aimed | 36" | 20 | 5+ | 6 | -1 | 1 | LETHAL HITS: non-MONSTER/VEHICLE |
| Deffstorm Mega-shoota - Point Blank | 12" | 3D6 | - | 6 | -1 | 1 | Torrent |
| Dual Big Shoota | 36" | 6 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 5 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |
| Skorcha | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Klaw of Gork | 6 | 3+ | 18 | -3 | 6 | CLEAVE 3 |

Core abilities: Damaged 7, Deadly Demise D6, Super-heavy Walker
Army rules: Waaagh!
Abilities:
Gut Hatch: In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move.
Big an' Stompy: This unit's melee attacks can re-roll hit rolls of 1.
Transport: capacity 12 ORKS INFANTRY models. Cannot transport GHAZGHKULL THRAKA. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models.
Unit composition: 1 Gorkanaut model, equipped with: 1 Deffstorm Mega-shoota; 2 Dual Big Shoota; 1 Klaw of Gork; 2 Rokkit Launcha; 1 Skorcha.
Points (1st–2nd units): 1 model: 325 pts · Points (3rd+ unit): 1 model: 355 pts

### Morkanaut
Source: Codex · Keywords: VEHICLE; TITANIC; TOWERING; TRANSPORT; WALKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Morkanaut | 9" | 12 | 2+ | 20 | 7+ | 8 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Big Shoota | 36" | 6 | 4+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Kustom Mega-blasta | 24" | 3 | 4+ | 9 | -2 | 3 | Hazardous |
| Kustom Mega-zappa | 36" | 3 | 4+ | 12 | -2 | 4 | BLAST 1 Hazardous |
| Rokkit Launcha - Blasta | 24" | 2 | 4+ | 5 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 4+ | 10 | -2 | 3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Klaw of Mork | 5 | 3+ | 18 | -3 | 6 | CLEAVE 2 |

Core abilities: Damaged 7, Deadly Demise D6, Super-heavy Walker
Army rules: Waaagh!
Abilities:
Gut Hatch: In your Movement phase, when this unit ends a normal move, units embarked within this unit can make an assault disembark move.
Big an' Shooty: In your Shooting phase, this unit's ranged attacks can re-roll hit rolls of 1.
Transport: capacity 12 ORKS INFANTRY models. Cannot transport GHAZGHKULL THRAKA. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models.
Unit composition: 1 Morkanaut model, equipped with: 2 Dual Big Shoota; 1 Klaw of Mork; 1 Kustom Mega-blasta; 1 Kustom Mega-zappa; 2 Rokkit Launcha.
Points (1st–2nd units): 1 model: 345 pts · Points (3rd+ unit): 1 model: 375 pts

### Stompa
Source: Codex · Keywords: VEHICLE; FRAME; TITANIC; TOWERING; TRANSPORT; WALKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Stompa | 10" | 14 | 2+ | 30 | 6+ | 12 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Deffkannon and Supa-rokkits | 72" | 12 | 5+ | 14 | -3 | D6+2 | BLAST 2 |
| Skorcha | 12" | 3 | - | 5 | -1 | 1 | BLAST 2 Torrent |
| Supa-gatler - Aimed | 24" | 30 | 5+ | 7 | -2 | 2 | LETHAL HITS: non-MONSTER/VEHICLE Sustained Hits 1 |
| Supa-gatler - Point Blank | 12" | 3D6+3 | - | 7 | -2 | 2 | Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Mega-choppa | 6 | 3+ | 24 | -4 | 10 | CLEAVE 4 |

Core abilities: Damaged 10, Deadly Demise 2D6, Super-heavy Walker
Army rules: Waaagh!
Abilities:
Idol of Belligerence: In your Movement phase, when a unit embarked within this unit is selected to make a disembark move, that unit is riled up until the start of your next turn.
Waaagh! Effigy: This unit is riled up.
Transport: capacity 22 ORKS INFANTRY models. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models. GHAZGHKULL THRAKA takes up the space of 4 models.
Unit composition: 1 Stompa model, equipped with: 5 Big Shoota; 1 Deffkannon and Supa-rokkits; 1 Mega-choppa; 1 Skorcha; 1 Supa-gatler.
Points (1st unit): 1 model: 700 pts · Points (2nd+ unit): 1 model: 800 pts

### Battlewagon
Source: Codex · Keywords: VEHICLE; FRAME; TRANSPORT; WAGON

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Battlewagon | 10" | 11 | 3+ | 16 | 7+ | 5 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Crushin' Bulk | 6 | 3+ | 8 | -2 | 2 | CLEAVE 1 |
| Grabbin' Klaw | 2 | 3+ | 10 | -2 | 2 | Extra Attacks |
| Wreckin' Ball | 1 | 3+ | 10 | 0 | D6 | CLEAVE 2 Extra Attacks |

Wargear options:
• This model can be equipped with 1 Wreckin' Ball.
• This model can be equipped with up to 4 Big Shoota.
• This model can be equipped with 1 Grabbin' Klaw.

Core abilities: Damaged 6, Deadly Demise D6, Firing Deck 11
Army rules: Waaagh!
Abilities:
Mobile Fortress: Ranged attacks that target this unit have -1 D.
Transport: capacity 22 ORKS INFANTRY models. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models. GHAZGHKULL THRAKA takes up the space of 4 models.
Unit composition: 1 Battlewagon model, equipped with: 1 Crushin' Bulk.
Points (1st–2nd units): 1 model: 160 pts · Points (3rd+ unit): 1 model: 180 pts

### Gunwagon
Source: Codex · Keywords: VEHICLE; FRAME; TRANSPORT; WAGON

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Gunwagon | 10" | 12 | 3+ | 16 | 7+ | 5 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Kannon - Frag | 36" | 4 | 4+ | 5 | 0 | 1 | BLAST 3 Rapid Fire 4 |
| Kannon - Shell | 36" | 2 | 4+ | 10 | -2 | D6+1 | Rapid Fire 2 |
| Killkannon | 24" | 4 | 4+ | 6 | -3 | 2 | Anti-Infantry 3+ BLAST 1 Rapid Fire 4 |
| Lobba | 48" | 3 | 4+ | 5 | 0 | 1 | BLAST 3 Indirect Fire |
| Zzap Gun | 36" | 2 | 4+ | 8 | -2 | 4 | ANTI-MONSTER/VEHICLE 4+ DEVASTATING WOUNDS: MONSTER/VEHICLE Rapid Fire 2 Sustained Hits 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Crushin' Bulk | 6 | 3+ | 8 | -2 | 2 | CLEAVE 2 |
| Grabbin' Klaw | 2 | 3+ | 10 | -2 | 2 | Extra Attacks |
| Wreckin' Ball | 1 | 3+ | 10 | 0 | D6 | CLEAVE 2 Extra Attacks |

Wargear options:
• This model can be equipped with 1 Wreckin' Ball.
• This model can be equipped with 1 Grabbin' Klaw.
• This model can be equipped with 1 Lobba.
• This model can be equipped with up to 4 Big Shoota.
• This model's Kannon can be replaced with one of the following: 1 Killkannon; 1 Zzap Gun (+10 pts).

Core abilities: Damaged 6, Deadly Demise D6
Army rules: Waaagh!
Abilities:
Mobile Arsenal: In your Shooting phase, this unit's ranged attacks can re-roll hit rolls of 1.
Transport: capacity 12 ORKS INFANTRY models. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models. GHAZGHKULL THRAKA takes up the space of 4 models.
Unit composition: 1 Gunwagon model, equipped with: 1 Crushin' Bulk; 1 Kannon.
Points (1st–2nd units): 1 model: 150 pts · Points (3rd+ unit): 1 model: 160 pts

### Big Trakk
Source: Legends · Keywords: FRAME; TRANSPORT; VEHICLE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Big Trakk | 12" | 9 | 4+ | 12 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Kannon - Frag | 36" | 3 | 5+ | 5 | 0 | 1 | BLAST 1 |
| Kannon - Shell | 36" | 1 | 5+ | 9 | -2 | D3+3 | - |
| Supa-kannon - Frag | 36" | D6+3 | 5+ | 5 | 0 | 1 | BLAST 2 |
| Supa-kannon - Shell | 36" | 1 | 5+ | 12 | -3 | D6+3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured Hull | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model can be equipped with one of the following: 1 Kannon, 1 Supa-kannon.

Core abilities: Deadly Demise D3, Firing Deck 12, Damaged 4
Army rules: Waaagh!
Abilities:
Spiked Ram: When this unit ends a charge move, you can select one enemy unit engaged with this unit. If you do, roll one D6: on a 2-5, that enemy unit suffers D3 mortal wounds; on a 6, 3 mortal wounds.
Transport: capacity 12 ORKS INFANTRY models. Cannot transport GHAZGHKULL THRAKA. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models.
Unit composition: 1 Big Trakk model, equipped with: 1 Armoured Hull; 2 Big Shoota.
Points: 1 model: 90 pts

### Kill Tank
Source: Legends · Keywords: VEHICLE; FRAME; WAGON; TRANSPORT

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Kill Tank | 12" | 12 | 3+ | 24 | 6+ | 10 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | Rapid Fire 2 LETHAL HITS: non-MONSTER/VEHICLE |
| Dual Big Shoota | 36" | 6 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Kannon - Frag | 48" | 2D6 | 5+ | 6 | -1 | 1 | BLAST 2 |
| Kannon - Shell | 48" | 2 | 5+ | 12 | -3 | D3+3 | Heavy |
| Lobba | 48" | 3 | 5+ | 5 | 0 | 1 | Indirect Fire BLAST 3 |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |
| Skorcha | 12" | 3 | - | 5 | 0 | 1 | Torrent BLAST 1 |
| Tank Kannon - Blasta | 48" | 10 | 5+ | 6 | -1 | 1 | BLAST 2 |
| Tank Kannon - Tankhamma | 48" | 2 | 5+ | 16 | -3 | D6+6 | Heavy |
| Zzap Gun | 36" | 2 | 5+ | 8 | -2 | 4 | Sustained Hits 2 DEVASTATING WOUNDS: MONSTER/VEHICLE ANTI-MONSTER/VEHICLE 4+ Rapid Fire 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Crushin' Bulk | 6 | 3+ | 8 | -2 | 2 | CLEAVE 2 |
| Deff Rolla | 6 | 3+ | 10 | -2 | 3 | - |

Wargear options:
• This model's Dual Big Shoota can be replaced with one of the following: 1 Rokkit Launcha, 1 Skorcha.
• This model's Skorcha can be replaced with one of the following: 1 Dual Big Shoota, 1 Rokkit Launcha.
• This model's Tank Kannon and Crushin' Bulk can be replaced with 1 Deff Rolla and three of the following: 1 Kannon; 1 Lobba; 1 Zzap Gun.
• If this model is equipped with 1 Deff Rolla, it can be equipped with up to 5 Big Shootas.

Core abilities: Deadly Demise D6, Damaged 6, Firing Deck 12
Army rules: Waaagh!
Abilities:
Rolling Fortress: When an attack targets a friendly ORKS unit that is not fully visible to the attacking model because of this unit, the target has the benefit of cover against that attack.
Da Biggest Boom: In your Shooting phase, when this unit has shot, you can select one enemy unit hit by this unit's Tank Kannon attacks. If you do, enemy units (excluding MONSTER/VEHICLE units) within 3" of that enemy unit make a battle-shock roll.
Transport: capacity 12 ORKS INFANTRY models. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models. GHAZGHKULL THRAKA takes up the space of 4 models.
Unit composition: 1 Kill Tank model, equipped with: 1 Crushin' Bulk; 1 Dual Big Shoota; 1 Skorcha; 1 Tank Kannon.
Points: 1 model: 300 pts

### Mek Gunz
Source: Codex · Keywords: VEHICLE; FRAME; GROTS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Mek Gun | 5" | 6 | 4+ | 6 | 8+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Smasha Gun | 48" | 4 | 4+ | 7 | -3 | 3 | BLAST 1 |
| Bubblechukka | 48" | 8 | 4+ | 3 | -3 | 1 | BLAST 3 Lethal Hits |
| Kustom Mega-kannon | 36" | D3+1 | 4+ | 12 | -2 | 4 | BLAST 1 Hazardous |
| Traktor Kannon | 48" | 2 | 4+ | 6 | -2 | D3+3 | Anti-Fly 2+ |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Scavenged Shivs | 5 | 5+ | 2 | 0 | 1 | - |

Wargear options:
• Any number of models can each have their Smasha Gun replaced with one of the following: 1 Bubblechukka; 1 Kustom Mega-kannon; 1 Traktor Kannon.

Army rules: Waaagh!
Abilities:
Madcap Artillery: In your Shooting phase, when this unit has shot, if all ranged weapons equipped by each Mek Gunz model in this unit are the same, select one enemy unit hit by those attacks. That enemy unit gets the matching effect until the start of your next turn:
• Bubblechukka: wobbled — while it is attacking, its targets have the benefit of cover against those attacks.
• Kustom Mega-kannon: zapped — -1 Ld.
• Smasha Gun: smashed — -2" M.
• Traktor Kannon: grounded — cannot take to the skies.
Unit composition: 1-3 Mek Gunz models. Every model: 1 Scavenged Shivs; 1 Smasha Gun.
Points (1st–2nd units): 1 model: 55 · 2 models: 110 · 3 models: 165 pts. Points (3rd+ unit): 1 model: 65 · 2 models: 120 · 3 models: 175 pts

### Rukkatrukk Squigbuggies
Source: Codex · Keywords: VEHICLE; EXPLOSIVES; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Rukkatrukk Squigbuggy | 12" | 7 | 4+ | 9 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Sawn-off Shotgun | 12" | 2 | 5+ | 4 | 0 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE |
| Squig Launchas | 24" | D6+6 | 4+ | 5 | -1 | 2 | Ignores Cover |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Saw Blades | 4 | 3+ | 7 | -1 | 2 | CLEAVE 1 |

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Squig Barrage: In your Shooting phase, when this unit has shot, select one enemy unit (excluding MONSTER/VEHICLE units) hit by this unit's Squig Launchas weapons. That enemy unit is covered in Squigs until the start of your next turn: while a unit is covered in Squigs, that unit's attacks have -1 to hit rolls.
Unit composition: 1-2 Rukkatrukk Squigbuggy models. Every model: 1 Saw Blades; 1 Sawn-off Shotgun; 1 Squig Launchas.
Points: 1 model: 85 pts · 2 models: 160 pts

### Warbuggies
Source: Codex · Keywords: VEHICLE; EXPLOSIVES; SPEED FREEKS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Warbuggy | 12" | 7 | 4+ | 9 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Extra Dakka | 12" | 4 | 5+ | 5 | -1 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE Sustained Hits 1 |
| Rivet Kannon - Aimed | 24" | 6 | 4+ | 7 | -2 | 2 | anti-infantry 4+ ASSAULT DEVASTATING WOUNDS: INFANTRY |
| Rivet Kannon - Point Blank | 6" | D3+1 | - | 7 | -2 | 2 | anti-infantry 4+ ASSAULT DEVASTATING WOUNDS: INFANTRY Torrent |
| Mek Speshul - Aimed | 24" | 14 | 4+ | 5 | -1 | 1 | ASSAULT LETHAL HITS: non-MONSTER/VEHICLE Sustained Hits 1 |
| Mek Speshul - Point Blank | 6" | 2D6+2 | - | 5 | -1 | 1 | ASSAULT Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Spiked Ram | 4 | 3+ | 7 | -1 | 2 | CLEAVE 1 |

Wargear options:
• Any number of models can each have their Mek Speshul replaced with 1 Rivet Kannon.

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Drive-by Skorchin': In your Movement phase, you can select one visible enemy unit (excluding MONSTER/VEHICLE units) within 6" of this unit: that enemy unit cannot be targeted with the Fire Overwatch stratagem until the end of the turn.
Unit composition: 1-2 Warbuggy models. Every model: 1 Extra Dakka; 1 Mek Speshul; 1 Spiked Ram.
Points: 1 model: 70 pts · 2 models: 130 pts

### Grot Mega-tank
Source: Legends · Keywords: FRAME; GROTS; VEHICLE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Grot Mega-tank | 8" | 9 | 3+ | 12 | 8+ | 4 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Dual Big Shoota | 36" | 6 | 4+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 4 |
| Dual Grotzooka | 18" | D3+3 | 4+ | 6 | -1 | 1 | BLAST 1 Ignores Cover Twin-linked |
| Mega-tank Weapons | 18" | 10 | 4+ | 5 | 0 | 1 | Rapid Fire 10 |
| Dual Kustom Mega-blasta | 24" | 3 | 4+ | 9 | -2 | 3 | Hazardous Twin-linked |
| Dual Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 Twin-linked |
| Dual Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | Twin-linked |
| Dual Skorcha | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent Twin-linked |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured Hull | 6 | 4+ | 4 | 0 | 1 | - |

Wargear options:
• This model's Dual Grotzooka can be replaced with one of the following: 1 Dual Big Shoota, 1 Dual Kustom Mega-blasta, 1 Dual Rokkit Launcha, 1 Dual Skorcha.
• This model's Dual Big Shoota can be replaced with one of the following: 1 Dual Grotzooka, 1 Dual Kustom Mega-blasta, 1 Dual Rokkit Launcha, 1 Dual Skorcha.

Core abilities: Deadly Demise D3, Damaged 4
Army rules: Waaagh!
Abilities:
Bizarrely Resilient: Attacks that target this unit have -1 AP.
Unit composition: 1 Grot Mega-tank model, equipped with: 1 Armoured Hull; 1 Dual Big Shoota; 1 Dual Grotzooka; 1 Mega-tank Weapons.
Points: 1 model: 110 pts

### Grot Tanks
Source: Legends · Keywords: FRAME; GROTS; VEHICLE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Grot Tank | 10" | 6 | 3+ | 5 | 8+ | 2 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Grot Tank Shoota | 36" | 3 | 4+ | 5 | 0 | 1 | Devastating Wounds Rapid Fire 2 |
| Grotzooka | 18" | D3+3 | 4+ | 6 | -1 | 1 | BLAST 1 Ignores Cover |
| Kustom Mega-blasta | 24" | 3 | 4+ | 9 | -2 | 3 | Hazardous |
| Rokkit Launcha - Blasta | 24" | 2 | 4+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 4+ | 10 | -2 | 3 | - |
| Skorcha | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Ramshackle Hull | 3 | 5+ | 6 | 0 | 1 | - |

Wargear options:
• Any number of models can each have their Grot Tank Shoota replaced with one of the following: 1 Grotzooka, 1 Kustom Mega-blasta, 1 Rokkit Launcha, 1 Skorcha.
• For every four models in this unit, one model can be equipped with one of the following in addition to any other weapons: 1 Grot Tank Shoota; 1 Grotzooka; 1 Kustom Mega-blasta; 1 Rokkit Launcha; 1 Skorcha.

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Scatter! (Once per phase, per unit): In your opponent's Movement phase, when an enemy unit ends a move within 8" of this unit, if this unit is unengaged, this unit can make a normal move of up to 6".
Unit composition: 4-8 Grot Tank models. Every model: 1 Grot Tank Shoota; 1 Ramshackle Hull.
Points: 4 models: 155 pts · 8 models: 310 pts

### Lifta Wagon
Source: Legends · Keywords: FRAME; VEHICLE; WAGON

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Lifta Wagon | 10" | 10 | 3+ | 16 | 7+ | 5 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Lifta-droppa | 36" | 4 | 5+ | 6 | -3 | D6+1 | Anti-Vehicle 3+ |
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Crushin' Bulk | 6 | 3+ | 8 | -2 | 2 | CLEAVE 1 |
| Grabbin' Klaw | 2 | 3+ | 10 | -2 | 2 | Extra Attacks |
| Wreckin' Ball | 1 | 3+ | 10 | 0 | D6 | CLEAVE 2 Extra Attacks |

Wargear options:
• This model can be equipped with 1 Grabbin' Klaw.
• This model can be equipped with one of the following: 1 Big Shoota and 1 Rokkit Launcha; 2 Big Shootas; 2 Rokkit Launcha.
• This model can be equipped with 1 Wreckin' Ball.

Core abilities: Damaged 6, Deadly Demise D6
Army rules: Waaagh!
Abilities:
Da Bigger Dey Are, Da Better Dey Drop: In your Shooting phase, when this unit's Lifta-droppa destroys an enemy MONSTER/VEHICLE model with Deadly Demise, that enemy model suffers a Deadly Demise on a roll of 3+, instead of a 6.
Unit composition: 1 Lifta Wagon model, equipped with: 1 Crushin' Bulk; 1 Lifta-droppa.
Points: 1 model: 135 pts

### Deff Dread
Source: Codex · Keywords: VEHICLE; WALKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Deff Dread | 8" | 9 | 2+ | 8 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Kustom Mega-blasta | 24" | 3 | 5+ | 9 | -2 | 3 | Hazardous |
| Rokkit Launcha - Blasta | 24" | 2 | 5+ | 4 | 0 | 1 | BLAST 2 |
| Rokkit Launcha - Busta | 24" | 2 | 5+ | 10 | -2 | 3 | - |
| Skorcha | 12" | 3 | - | 5 | 0 | 1 | BLAST 1 Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Extra Klaw | 1 | 3+ | 12 | -2 | 3 | Extra Attacks |
| Dread Klaws | 5 | 3+ | 12 | -2 | 3 | CLEAVE 1 |

Wargear options:
• This model's Big Shoota can be replaced with one of the following: 1 Extra Klaw; 1 Kustom Mega-blasta; 1 Rokkit Launcha.
• This model's Skorcha can be replaced with one of the following: 1 Extra Klaw; 1 Big Shoota; 1 Kustom Mega-blasta; 1 Rokkit Launcha.

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Dread 'Ard: Attacks that target this unit have -1 D.
Unit composition: 1 Deff Dread model, equipped with: 1 Big Shoota; 1 Dread Klaws; 1 Skorcha.
Points (1st–2nd units): 1 model: 130 pts · Points (3rd+ unit): 1 model: 140 pts

### Killa Kans
Source: Codex · Keywords: VEHICLE; GROTS; WALKER

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Killa Kan | 8" | 7 | 3+ | 5 | 8+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Kan Blasta - Dakka | 24" | 4 | 4+ | 6 | -1 | 1 | BLAST 1 Ignores Cover Sustained Hits 1 |
| Kan Blasta - Kill Shot | 24" | 2 | 4+ | 10 | -2 | 3 | - |
| Kan Blasta - Point Blank | 12" | 3 | - | 5 | -1 | 1 | BLAST 2 Torrent |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Kan Klaw | 3 | 4+ | 8 | -2 | 3 | - |

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Spiteful Power Trip: This unit's attacks that target a unit that has no models with a T of 7+ have +1 to hit rolls.
Unit composition: 3-6 Killa Kan models. Every model: 1 Kan Blasta; 1 Kan Klaw.
Points (1st–2nd units): 3 models: 130 pts · 6 models: 275 pts. Points (3rd+ unit): 3 models: 170 pts · 6 models: 315 pts

### Big'ed Bossbunka
Source: Codex · Keywords: VEHICLE; FORTIFICATION; FRAME; TRANSPORT

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Big'ed Bossbunka | - | 10 | 3+ | 12 | 7+ | 0 |

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Big Shoota | 36" | 3 | 5+ | 5 | 0 | 1 | LETHAL HITS: non-MONSTER/VEHICLE Rapid Fire 2 |
| Gaze of Gork - Glare | 24" | 3 | 5+ | 5 | 0 | 1 | BLAST 1 |
| Gaze of Gork - Squint | 18" | 1 | 5+ | 12 | -3 | 3 | - |

Wargear options:
• This model can be equipped with up to 3 Big Shootas.

Core abilities: Deadly Demise D3, Firing Deck 11
Army rules: Waaagh!
Abilities:
Raucous Occupants: While this model is within range of your home objective, add the OC of models embarked within this model to this model's OC.
Fortification: While an enemy unit is engaged with only FORTIFICATION units: it can be selected as a target of ranged attacks; ranged attacks against it have -1 to hit (excluding [Close-quarters] attacks); and if it falls back and is not battle-shocked, its hazard rolls are automatically passed.
Ramshackle Cover: When an attack targets a unit that is not fully visible to the attacking model because of this unit, the target has the benefit of cover against that attack.
Transport: capacity 11 ORKS INFANTRY models. Cannot transport GHAZGHKULL THRAKA. Each MEGA ARMOUR/JUMP PACK model takes up the space of 2 models.
Unit composition: 1 Big'ed Bossbunka model, equipped with: 1 Big Shoota; 1 Gaze of Gork.
Points: 1 model: 135 pts

### Mekboy Workshop
Source: Legends · Keywords: FORTIFICATION; FRAME; VEHICLE

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Mekboy Workshop | - | 9 | 4+ | 10 | 7+ | 0 |

No weapons.

Core abilities: Deadly Demise 1
Army rules: Waaagh!
Abilities:
Workshop: When this unit is set up, all parts of it must be set up in a single group, each part within 1" of another part. At the end of the Movement phase, each friendly ORKS VEHICLE within 6" of this unit heals D3 wounds (once per turn per unit).
Fortification: As Big'ed Bossbunka.
Ramshackle Cover: When an attack targets a unit that is not fully visible to the attacking model because of this unit, the target has the benefit of cover against that attack.
Unit composition: 1 Mekboy Workshop model.
Points: 1 model: 80 pts
