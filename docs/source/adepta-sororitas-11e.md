# Warhammer 40,000 (11th edition) Dice Helper — Adepta Sororitas
## Rules data (Parts B and C)

Data captured from Wahapedia (wahapedia.ru/wh40k11ed/factions/adepta-sororitas/) on 20 November 2026.
Core rules (Part A) are shared with all factions and live in `docs/source/orks-11e.md`.
Flavour text, errata notes, FAQs, Crusade rules and the Boarding Actions detachments (Penitents and Pilgrims, Pious Protectors) are left out on purpose. Published errata are already applied in Wahapedia's text.
Stratagem headers: turn and phase are taken from Wahapedia's stratagem colour (your / opponent's / either turn) and phase icons. Force Dispositions are taken from the detachment icons.
Unit composition lines are rewritten into the Part C format of the Orks file (counts and weapon names), keeping Wahapedia's numbers and weapons. "Wargear points" lines are extra points per optional weapon; the army builder does not add them, use the points override.
Known gaps: Miracle dice and Acts of Faith are rules text only (no dice pool tracker). The REVEREND tag (only one REVEREND detachment) is not checked. Sanctifiers: the second Missionary starts with a plasma gun like the first; give it the Ministorum flamer in the loadout editor. Equipment that is not a weapon (Salvationist medikit, simulacrum imperialis) is not in loadouts.

---
# PART B — ADEPTA SORORITAS ARMY RULES, DETACHMENTS, ENHANCEMENTS & STRATAGEMS

Source: Wahapedia, Adepta Sororitas faction page (11th edition). Stratagem headers show: NAME — CP — detachment — [which turn, which phase].

## Army Rules
### Acts of Faith
If your Army Faction is ADEPTA SORORITAS, each unit from your army with this ability can perform one Act of Faith per phase. This is done using Miracle dice.
GAINING MIRACLE DICE
If your Army Faction is ADEPTA SORORITAS, you gain 1 Miracle dice:
At the start of each turn.
Each time an ADEPTA SORORITAS unit from your army is destroyed.
Each time you gain a Miracle dice, roll one D6. The number you roll is the value of that Miracle dice. This value cannot be changed or re-rolled, unless a rule specifically states otherwise. Keep your Miracle dice to one side - this is your Miracle dice pool.
PERFORMING AN ACT OF FAITH
Before making a dice roll for a model or unit from your army with the Acts of Faith ability, if you have one or more dice in your Miracle dice pool, that unit can perform an Act of Faith. If it does, select one of the dice from your Miracle dice pool to substitute that dice roll (if a roll involves more than one dice, e.g. a Charge roll or Battle-shock test, only a single dice can be substituted). The dice that is being substituted is not rolled; instead, the value of the selected Miracle dice is used as if it had been rolled ( this counts as an unmodified dice roll of that value for all rules purposes). Each Miracle dice can only be selected for substitution once. Once all Miracle dice substitutions have been made, remove the chosen Miracle dice from your Miracle dice pool, and roll all remaining, unsubstituted dice that are a part of the dice roll. You can use Miracle dice when a unit performs an Act of Faith for any of the following types of dice roll:
Advance roll
Battle-shock test
Charge roll
Damage roll
Hit roll
Saving throw
Wound roll
Example: Instead of rolling 2D6 to take a unit’s Battle-shock test, you could use one dice from your Miracle dice pool. If the value of that dice was 4, the unit’s Battle-shock test would be determined by rolling one D6 and adding 4 to it (i.e. it would be D6+4).

## Hallowed Martyrs (3 DP)
Force Disposition: Take and Hold; Priority Assets
### Detachment Rule: The Blood of Martyrs
Each time an ADEPTA SORORITAS model from your army makes an attack, add 1 to the Hit roll if that model’s unit is below its Starting Strength, and add 1 to the Wound roll as well if that model’s unit is Below Half-strength.
### Enhancements
• Saintly Example 10 pts — ADEPTA SORORITAS model only. When the bearer is destroyed, you gain an additional D3 Miracle dice.
• Through Suffering, Strength 25 pts — ADEPTA SORORITAS model only. Add 1 to the Attacks, Strength and Damage characteristics of the bearer’s melee weapons. If the bearer has lost one or more wounds, add 2 to the Attacks, Strength and Damage characteristics of the bearer’s melee weapons instead.
• Chaplet of Sacrifice 25 pts — ADEPTA SORORITAS model only. At the end of your Command phase, if the bearer is on the battlefield, you can re-roll 1 Miracle dice from your Miracle dice pool and return it to your Miracle dice pool showing the new result you rolled. When doing so, if the bearer's unit is below its Starting Strength, you can re-roll up to 3 Miracle dice in this way instead.
• Mantle of Ophelia 20 pts — CANONESS or PALATINE model only. Each time an attack is allocated to the bearer, change the Damage characteristic of that attack to 1.
### Stratagems
#### DIVINE INTERVENTION — 1CP — Hallowed Martyrs — [Either turn, Any]
WHEN: Any phase.
TARGET: One ADEPTA SORORITAS CHARACTER model from your army that was just destroyed. You can use this Stratagem on that model even though it was just destroyed.
EFFECT: You can discard 1-3 Miracle dice. At the end of the phase, set up that model on the battlefield, unengaged and as close as possible to where it was destroyed. That model is not part of an attached unit and its unit has a starting strength of 1. Roll one D3, adding 1 to the result for each Miracle dice you discarded. That model has that number of wounds remaining (up to its starting number of wounds).
RESTRICTION: You cannot select SAINT CELESTINE as the target of this Stratagem. You cannot select the same CHARACTER as the target of this Stratagem more than once per battle.
#### SUFFERING AND SACRIFICE — 1CP — Hallowed Martyrs — [Either turn, Fight]
WHEN: Start of the Fight phase.
TARGET: One ADEPTA SORORITAS INFANTRY or ADEPTA SORORITAS WALKER unit from your army.
EFFECT: Until the end of the phase, each time an enemy model within Engagement Range of your unit selects its targets, it must select your unit as the target of its attacks.
#### RIGHTEOUS VENGEANCE — 1CP — Hallowed Martyrs — [Either turn, Fight]
WHEN: Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.
EFFECT: Until the end of the phase, each time a model in your unit makes a melee attack, you can re-roll the Hit roll and, if your unit is Below Half-strength, you can re-roll the Wound roll as well.
#### SANCTIFIED IMMOLATION — 1CP — Hallowed Martyrs — [Either turn, Any]
WHEN: Any phase.
TARGET: One ADEPTA SORORITAS VEHICLE model from your army with the Deadly Demise ability that was just destroyed. You can use this Stratagem on that model even though It was just destroyed.
EFFECT: Do not roll one D6 to determine whether mortal wounds are inflicted by your model's Deadly Demise ability. Instead, mortal wounds are automatically inflicted.
#### SPIRIT OF THE MARTYR — 2CP — Hallowed Martyrs — [Either turn, Fight]
WHEN: Fight phase, just after an enemy unit has selected its targets.
TARGET: One ADEPTA SORORITAS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.
EFFECT: Until the end of the phase, each time a model in your unit is destroyed, if that model has not fought this phase, do not remove it from play. The destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.
#### PRAISE THE FALLEN — 1CP — Hallowed Martyrs — [Opponent's turn, Shooting]
WHEN: Your opponent’s Shooting phase, just after an enemy unit has shot.
TARGET: One ADEPTA SORORITAS unit from your army that had one or more of its models destroyed as a result of the attacking unit’s attacks.
EFFECT: Your unit can shoot as if it were your Shooting phase, but it must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.

## Penitent Host (2 DP)
Force Disposition: Purge the Foe
### Detachment Rule: Desperate for Redemption
At the start of your Command phase, you can select one of the following Vows of Atonement to be active for your army until the start of your next Command phase. You can only select each Vow of Atonement once per battle.
The Path of the Penitent
Add 3" to the Move characteristic of PENITENT models from your army.
Absolution in Battle
Each time a unit from your army is selected to fight, if that unit made a Charge move this turn, until the end of the phase, add 1 to the Attacks and Strength characteristics of melee weapons equipped by PENITENT models in that unit.
Death Before Disgrace
Each time a PENITENT model from your army is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; the destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.
### Enhancements
• Psalm of Righteous Judgement 20 pts — ADEPTA SORORITAS model only. While the bearer is on the battlefield, each time an enemy unit is destroyed by a PENITENT unit from you army, you can discard 1 Miracle dice then gain 1 Miracle dice showing a value of 6.
• Verse of Holy Piety 15 pts — PENITENT model only. Once per battle, at the start of the battle round, select one Vow of Atonement. Until the start of the next battle round, that Vow of Atonement is active for the bearer’s unit in addition to any that is active for your army, even if you have already selected that Vow of Atonement this battle.
• Refrain of Enduring Faith 15 pts — PENITENT model only. While the bearer is leading a unit, models in that unit have a 5+ invulnerable save.
• Catechism of Divine Penitence 15 pts — LEADER: REPENTIA SQUAD. CANONESS, PALATINE or MINISTORUM PRIEST model only. The bearer gains the PENITENT keyword.
### Stratagems
#### FINAL REDEMPTION — 1CP — Penitent Host — [Either turn, Any]
WHEN: Any phase.
TARGET: One PENITENT unit from your army that was just destroyed while it was within range of an objective marker you controlled. You can use this Stratagem on that unit even though it was just destroyed.
EFFECT: That objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.
#### PURITY OF SUFFERING — 1CP — Penitent Host — [Either turn, Shooting/Fight]
WHEN: Your opponent's Shooting phase or the Fight phase, just after an enemy unit has selected its targets.
TARGET: One PENITENT unit from your army that was selected as the target of one or more of the attacking unit's attacks.
EFFECT: Until the end of the phase, PENITENT models in your unit have the Feel No Pain 4+ ability.
#### PASSION OF THE PENITENT — 1CP — Penitent Host — [Either turn, Fight]
WHEN: Fight phase.
TARGET: One PENITENT unit from your army that has not been selected to fight this phase.
EFFECT: Until the end of the phase, each time a PENITENT model in your unit makes a melee attack, a successful unmodified Hit roll of 5+ scores a Critical Hit.
#### LASH OF GUILT — 1CP — Penitent Host — [Your turn, Movement]
WHEN: Your Movement phase, just before a PENITENT unit from your army Advances.
TARGET: That PENITENT unit.
EFFECT: Until the end of the turn, your unit is eligible to declare a charge in a turn in which it Advanced. If your unit has the PENITENT ENGINES keyword, do not make an Advance roll for it; instead, until the end of the phase, add 6" to the Move characteristic of models in your unit.
#### BOUNDLESS ZEAL — 1CP — Penitent Host — [Your turn, Movement]
WHEN: Your Movement phase, just after an ADEPTA SORORITAS unit from your army Falls Back.
TARGET: That ADEPTA SORORITAS unit.
EFFECT: Until the end of the turn, your unit is eligible to shoot or declare a charge in a turn in which it Fell Back. If your unit has the PENITENT keyword, it is eligible to shoot and declare a charge in a turn in which it Fell Back instead.
#### DEVOUT FANATICISM — 1CP — Penitent Host — [Opponent's turn, Shooting]
WHEN: Your opponent’s Shooting phase, just after an enemy unit has shot.
TARGET: One PENITENT unit from your army that was selected as the target as one or more of the attacking unit’s attacks.
EFFECT: Your unit can make a surge move of up to D6"".

## Bringers of Flame (2 DP)
Force Disposition: Priority Assets
### Detachment Rule: Fervent Purgation
Ranged weapons equipped by ADEPTA SORORITAS models from your army have the [ASSAULT] ability, and each time an attack made with such a weapon targets a unit within 6", add 1 to the Strength characteristic of that attack.
### Enhancements
• Righteous Rage 15 pts — ADEPTA SORORITAS model only. Each time the bearer is selected to fight, you can first discard up to 3 Miracle dice. For each Miracle dice just discarded, until the end of the phase, add 1 to the Attacks and Strength characteristics of the bearer’s melee weapons.
• Manual of Saint Griselda 20 pts — ADEPTA SORORITAS model only. At the start of your Command phase, you can discard up to 2 Miracle dice. Then, add 1 Miracle dice to your Miracle Dice pool showing a value equal to the sum of the two Miracle dice you just discarded (to a maximum of 6).
• Fire and Fury 30 pts — ADEPTA SORORITAS model only. While the bearer is leading a unit, add 1 to the Attacks characteristic of Torrent weapons equipped by models in that unit, and all other ranged weapons equipped by models in that unit have the [SUSTAINED HITS 1] ability.
• Iron Surplice of Saint Istalela 10 pts — CANONESS or PALATINE model only. The bearer has a Save characteristic of 2+ and the Feel No Pain 5+ ability.
### Stratagems
#### SHIELD OF AVERSION — 1CP — Bringers of Flame — [Either turn, Shooting/Fight]
WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.
TARGET: One ADEPTA SORORITAS unit from your army that was selected as the target of one or more of the attacking unit’s attacks.
EFFECT: Until the attacking unit has finished making its attacks, each time an attack targets your unit, worsen the Armour Penetration characteristic of that attack by 1.
#### RIGHTEOUS BLOWS — 1CP — Bringers of Flame — [Either turn, Fight]
WHEN: Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.
EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LETHAL HITS] ability. If one or more enemy models are destroyed as the result of attacks made by those weapons this phase, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.
#### CARRY FORTH THE FAITHFUL — 1CP — Bringers of Flame — [Your turn, Movement]
WHEN: Your Movement phase, just before an ADEPTA SORORITAS TRANSPORT model from your army Advances.
TARGET: That ADEPTA SORORITAS TRANSPORT model.
EFFECT: Until the end of the turn, you can re-roll Advance rolls made for your TRANSPORT, and units can disembark from your TRANSPORT even though it Advanced. Units that do so make a shock disembark move (Core Rules, 18.07) for that disembarkation.
#### CLEANSING FLAMES — 2CP — Bringers of Flame — [Your turn, Shooting]
WHEN: Your Shooting phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to shoot this phase.
EFFECT: Until the end of the phase, Torrent weapons equipped by models in your unit have the [DEVASTATING WOUNDS] ability
#### RITES OF FIRE — 1CP — Bringers of Flame — [Your turn, Shooting]
WHEN: Your Shooting phase.
TARGET: One ADEPTA SORORITAS unit from your army that disembarked from a TRANSPORT this turn and has not been selected to shoot this phase.
EFFECT: Until the end of the phase, each time a model in your unit makes a ranged attack that targets an enemy unit within 6" that is also within range of an objective marker, add 1 to the Wound roll. If one or more enemy models are destroyed as the result of those attacks, select one of those destroyed models; that destroyed model’s unit must take a Battle-shock test.
#### BLAZING IRE — 2CP — Bringers of Flame — [Opponent's turn, Shooting]
WHEN: Your opponent’s Shooting phase, just after an enemy unit has shot.
TARGET: One ADEPTA SORORITAS TRANSPORT unit from your army that was selected as the target of one or more of the attacking unit's attacks.
EFFECT: One unit embarked within your TRANSPORT can disembark as if it were your Movement phase, and can then shoot as if it were your Shooting phase, but must target only that enemy unit when doing so, and can only do so if that enemy unit is an eligible target.

## Army of Faith (2 DP)
Force Disposition: Take and Hold
### Detachment Rule: Sacred Rites
Each ADEPTA SORORITAS unit from your army can perform up to two Acts of Faith per phase, instead of just one.
### Enhancements
• Litanies of Faith 10 pts — CANONESS or PALATINE model only. At the start of your Command phase, if the bearer is on the battlefield, take a Leadership test for the bearer. If that test is passed, you gain 1 Miracle dice.
• Blade of Saint Ellynor 15 pts — ADEPTA SORORITAS model only. Improve the Strength and Armour Penetration characteristics of the bearer’s melee weapons by 1, and those weapons have the [PRECISION] ability. In addition, each time the bearer fights, if one or more enemy models are destroyed by those attacks, you gain 1 Miracle dice.
• Divine Aspect 5 pts — ADEPTA SORORITAS model only. In your Movement phase, you can select one enemy unit within 12" of the bearer; that unit must take a Battle-shock test. If that test is failed, you gain 1 Miracle dice.
• Triptych of the Macharian Crusade 20 pts — ADEPTA SORORITAS model only. Each time the bearer uses an Act of Faith to substitute a saving throw, that saving throw is successful, irrespective of the value of the Miracle dice used.
### Stratagems
#### SHIELD OF FAITH — 1CP — Army of Faith — [Either turn, Any]
WHEN: Any phase, just after an ADEPTA SORORITAS unit from your army suffers a mortal wound.
TARGET: That ADEPTA SORORITAS unit, or one friendly ADEPTA SORORITAS JUMP PACK unit within 3" of it.
EFFECT: Until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds. If you targeted an ADEPTA SORORITAS JUMP PACK unit from your army with this Stratagem, then until the end of the phase, while a friendly ADEPTA SORORITAS unit is unit is within 3" of your unit, models in that unit have the Feel No Pain 5+ ability against mortal wounds.
#### LIGHT OF THE EMPEROR — 2CP — Army of Faith — [Either turn, Command]
WHEN: Command phase.
TARGET: One ADEPTA SORORITAS unit from your army.
EFFECT: Until the end of the turn, your unit is blessed. While a unit is blessed, it can ignore any or all modifiers to the following: the profile characteristics of its models; the Weapon Skill or Ballistic Skill characteristics of weapons equipped by its models; any roll or test made for it (excluding modifiers to saving throws). If your unit has the JUMP PACK keyword, until the end of the turn, while a friendly ADEPTA SORORITAS unit is within 3" of your unit, that friendly unit is also blessed.
#### FAITH AND FURY — 1CP — Army of Faith — [Either turn, Fight]
WHEN: Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.
EFFECT: Until the end of the phase, melee weapons equipped by models in your unit have the [LANCE] ability. If one or more enemy models are destroyed as the result of your unit's attacks this phase, you gain 1 Miracle dice.
#### BLINDING RADIANCE — 1CP — Army of Faith — [Either turn, Shooting/Fight]
WHEN: Your opponent’s Shooting phase or the Fight phase, just after an enemy unit has selected its targets.
TARGET: One ADEPTA SORORITAS INFANTRY unit from your army that was selected as the target of one or more of the attacking unit’s attacks, or one friendly ADEPTA SORORITAS JUMP PACK unit within 3" of such a unit.
EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll. If you targeted an ADEPTA SORORITAS JUMP PACK unit from your army with this Stratagem, then until the end of the phase, while a friendly ADEPTA SORORITAS INFANTRY unit is unit is within 3" of your unit, each time an attack targets that unit, subtract 1 from the Hit roll.
#### DIVINE GUIDANCE — 1CP — Army of Faith — [Either turn, Shooting/Fight]
WHEN: Your Shooting phase or the Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to shoot or fight this phase.
EFFECT: Until the end of the phase, each time a model in your unit makes an attack, improve the Armour Penetration characteristic of that attack by 1. If one or more enemy models are destroyed as the result of any of those attacks, you gain 1 Miracle dice.
#### ANGELIC DESCENT — 1CP — Army of Faith — [Opponent's turn, Fight]
WHEN: End of your opponent’s Fight phase.
TARGET: One ADEPTA SORORITAS JUMP PACK unit from your army.
EFFECT: Remove your unit from the battlefield and place it into Strategic Reserves.
RESTRICTIONS: You cannot select a unit that is within Engagement Range of one or more enemy units.

## Champions of Faith (2 DP)
Force Disposition: Disruption
### Detachment Rule: Righteous Purpose
In your Command phase, you can select up to 3 ADEPTA SORORITAS units from your army (including units that are embarked within TRANSPORTS), until the start of your next Command phase, those units are Righteous. While a unit is Righteous:
Add 1" to the Move characteristic of models in that unit.
Improve the Leadership characteristic of models in that unit by 1.
Improve the Weapon Skill and Ballistic Skill characteristics of weapons equipped by BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS and PARAGON WARSUITS models in that unit by 1.
Keywords:
While a CELESTIAN SACRESANTS unit from your army is not Battle-shocked, add 1 to the Objective Control characteristic of Celestian Sacresants models in that unit.
UNIQUE: REVEREND
### Enhancements
• Triptych of Judgement 15 pts — ADEPTA SORORITAS model only. Each time a model in the bearer’s unit makes an attack, you can ignore any or all modifiers to that attack’s Ballistic Skill or Weapon Skill characteristics and/or any or all modifiers to the Hit roll.
• Mark of Devotion 30 pts — ADEPTA SORORITAS model only. Add 1 to the Attacks characteristic of the bearer’s melee weapons. While the bearer’s unit is Righteous, add 2 to the Attacks characteristic and add 1 to the Damage characteristic of the bearer’s melee weapons instead.
• Eyes of the Oracle 10 pts — ADEPTA SORORITAS model only. The bearer’s weapons have the [PRECISION] ability. Each time the bearer’s unit destroys an enemy CHARACTER model, you gain 1CP.
• Sanctified Amulet 25 pts — ADEPTA SORORITAS model only. Enemy units that are set up on the battlefield from Reserves cannot be set up within 12" of the bearer.
### Stratagems
#### SHIELD OF DENIAL — 1CP — Champions of Faith — [Either turn, Any]
WHEN: Any phase, just after a mortal wound is allocated to an ADEPTA SORORITAS unit from your army.
TARGET: That ADEPTA SORORITAS unit.
EFFECT: Until the end of the phase, models in your unit have the Feel No Pain 6+ ability against mortal wounds. If your unit is Righteous, until the end of the phase, models in your unit have the Feel No Pain 5+ ability against mortal wounds instead.
#### SUFFER NOT THE UNFAITHFUL — 1CP — Champions of Faith — [Either turn, Shooting/Fight]
WHEN: Your Shooting phase or the Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that is Righteous and that has not been selected to shoot or fight this phase.
EFFECT: Select either the [LETHAL HITS] or [SUSTAINED HITS 1] ability. Until the end of the phase, weapons equipped by models in your unit have the selected ability.
#### TO THE HEART OF HERESY — 1CP — Champions of Faith — [Either turn, Fight]
WHEN: Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.
EFFECT: Until the end of the turn, improve the Strength characteristic of melee weapons equipped by models in your unit by 1. If your unit is Righteous, until the end of the phase, improve the Armour Penetration characteristic of melee weapons equipped by models in your unit by 1 as well.
#### PATH OF THE RIGHTEOUS — 1CP — Champions of Faith — [Either turn, Fight]
WHEN: Fight phase.
TARGET: One ADEPTA SORORITAS unit from your army that has not been selected to fight this phase.
EFFECT: Until the end of the turn, each time a model in your unit makes a Pile-in or Consolidation move, it can move up to 6" instead of up to 3". When doing so, if your unit is Righteous, it does not need to end that move closer to the closest enemy model, provided it ends that move as close as possible to the closest enemy unit.
#### BASTION OF FAITH — 1CP — Champions of Faith — [Either turn, Fight]
WHEN: Fight phase, just after an enemy unit has selected its targets.
TARGET: One CELESTIAN SACRESANTS unit that was selected as the target of one or more of the attacking unit’s attacks.
EFFECT: Until the end of the phase, each time an attack targets your unit, subtract 1 from the Hit roll. In addition, if your unit is Righteous, you can select one other CELESTIAN SACRESANTS unit from your army that is not Battle-shocked and is within 6" of your unit. Until the end of the phase, each time an attack targets that CELESTIAN SACRESANTS unit, subtract 1 from the Hit roll as well.
#### INDEFATIGABLE DEDICATION — 1CP — Champions of Faith — [Your turn, Movement]
WHEN: Your Movement phase, just after an ADEPTA SORORITAS unit from your army Falls Back.
TARGET: That ADEPTA SORORITAS unit.
EFFECT: Until the end of the turn, your unit is eligible to shoot in a turn in which it Fell Back. If your unit is Righteous, until the end of the turn, your unit is eligible to shoot and declare a charge in a turn in which it Fell Back instead.

## Chorus of Condemnation (1 DP)
Force Disposition: Reconnaissance
### Detachment Rule: Angelic Judgement
Friendly ADEPTA SORORITAS INFANTRY FLY units have the following ability:
Condemnatory Psalms: In your Shooting phase, this unit can select one visible enemy unit within 12". That enemy unit is condemned:
While a unit is condemned, that unit has +3" detection range.
### Enhancements
• Clarion of Urgency 15 pts — CANONESS WITH JUMP PACK model only. At the end of your opponent’s Fight phase, if this unit is unengaged, you can place this unit in strategic reserves.
• Symphonic Payload (Upgrade) 10 pts — EXORCIST unit only. This unit can re-roll rolls to determine the A of a weapon.
### Stratagems
#### INSPIRATIONAL BATTLE CANTICLES — 1CP — Chorus of Condemnation — [Either turn, Command]
WHEN: Start of the Command phase.
TARGET: One friendly ADEPTA SORORITAS INFANTRY FLY unit or one friendly EXORCIST unit.
EFFECT: Select one friendly battle-shocked ADEPTA SORORITAS unit within 6" of your unit. That unit is no longer battle-shocked.
#### HARMONISED EXORCISM — 1CP — Chorus of Condemnation — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly EXORCIST unit is selected to shoot.
TARGET: That EXORCIST unit.
EFFECT: Select one unit visible to and within 9" of a friendly ADEPTA SORORITAS INFANTRY FLY unit. Your unit’s ranged attacks that target that unit have +1 to hit rolls.
#### DEVASTATING REPRISE — 1CP — Chorus of Condemnation — [Your turn, Shooting]
WHEN: Your Shooting phase, when a friendly EXORCIST unit has shot.
TARGET: One friendly ADEPTA SORORITAS INFANTRY FLY unit.
EFFECT: Select one enemy unit (excluding MONSTER/VEHICLE units) hit by those ranged attacks. Your unit’s ranged attacks that target that unit have [DEVASTATING WOUNDS].

## Sacred Champions (1 DP)
Force Disposition: Take and Hold
### Detachment Rule: Holy Quest
Friendly CELESTIAN units’ attacks have +1 BS and WS.
This detachment has the REVEREND tag and cannot be taken with another REVEREND detachment.
### Enhancements
• Writ of Compunction (Upgrade) 20 pts — CELESTIAN SACRESANTS unit only. This unit has +1 OC.
• Perfervid Haste 10 pts — ADEPTA SORORITAS model only. This unit has +1" M.
### Stratagems
#### SANCTIFIED BLOWS — 1CP — Sacred Champions — [Either turn, Fight]
WHEN: Fight phase, when a friendly CELESTIAN SACRESANTS unit is selected to fight.
TARGET: That CELESTIAN SACRESANTS unit.
EFFECT: Your unit’s melee attacks have +1 A and S.
#### FAITHFUL FORTITUDE — 1CP — Sacred Champions — [Either turn, Any]
WHEN: Any phase, when a friendly CELESTIAN SACRESANTS unit suffers a mortal wound.
TARGET: That CELESTIAN SACRESANTS unit.
EFFECT: Your unit has Feel No Pain 5+ against mortal wounds until the end of the phase.
#### UNFLINCHING DETERMINATION — 1CP — Sacred Champions — [Your turn, Movement]
WHEN: Your Movement phase, when a friendly CELESTIAN SACRESANTS unit is selected to make an advance/fall-back move.
TARGET: That CELESTIAN SACRESANTS unit.
EFFECT:
Your unit’s ranged attacks have [ASSAULT] until the end of the turn.
That move does not prevent your unit from being eligible to shoot/declare a charge.

## Sanctified Orators (1 DP)
Force Disposition: Disruption
### Detachment Rule: Hymns of Battle
Enhancements selected from this detachment do not count towards the total number of enhancements in your army.
Friendly ADEPTA SORORITAS CHARACTER units have +1 Ld.
### Enhancements
• Hagiomnifex (Upgrade) 25 pts — ADEPTA SORORITAS CHARACTER model only (excluding PENITENT units). (Once per turn, per unit) At the start of a phase, you can use this ability. If you do, select one of the abilities below:
Rite of Revelation: While this unit is shooting, enemy units have +6" detection range.
Sermon of Intolerance: This unit’s battle-shock rolls automatically succeed.
Catechism of Raging Fervour: This unit has +1" M.
Psalm of Righteous Smiting: This unit’s attacks have +1 S.
Chorus of Repudiation: Attacks that target this unit with a S greater than this unit’s T have -1 to wound rolls.

# PART C — ADEPTA SORORITAS DATASHEETS (all units)

Source: Wahapedia, Adepta Sororitas datasheets (11th edition). Weapon profile names like "Plasma gun - standard" are one weapon with several profiles: the player picks ONE profile per attack.
BS/WS "-" = [TORRENT] (auto-hit). Keywords column lists weapon abilities as printed. The Keywords line ends with the faction keyword.

### Aestred Thurga And Agathae Dolan
Source: Codex · Keywords: INFANTRY; GRENADES; CHARACTER; EPIC HERO; IMPERIUM; AESTRED THURGA; AGATHAE DOLAN; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Aestred Thurga | 6" | 3 | 2+ | 4 | 6+ | 1 |
| Agathae Dolan | 6" | 3 | 2+ | 4 | 6+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Blade of Vigil | 4 | 2+ | 5 | -2 | 2 | - |
| Scribe’s staff | 3 | 4+ | 4 | 0 | 1 | - |

Core abilities: Leader
Army rules: Acts of Faith
Abilities:
Auto-Tapestry of the Emperor’s Judgement: While this unit is leading a unit and contains an Aestred Thurga model, weapons equipped by models in that unit have the [DEVASTATING WOUNDS] ability
Recount the Deeds of the Saints: While this unit is leading a unit and contains an Agathae Dolan model, each time that unit destroys an enemy unit, you gain 1 Miracle dice. When that Agathae Dolan model is destroyed, you gain D3 Miracle dice.
Unit composition: 1 Aestred Thurga model; 1 Agathae Dolan model. Every Aestred Thurga: 1 Bolt pistol; 1 Blade of Vigil. Every Agathae Dolan: 1 Bolt pistol; 1 Scribe’s staff.
Points: 2 models: 80 pts
Leads: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD

### Arco-flagellants
Source: Codex · Keywords: INFANTRY; IMPERIUM; PENITENT; ARCO-FLAGELLANTS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Arco-flagellants | 7" | 3 | 7+ | 2 | 8+ | 1 |

Invulnerable save: 6+

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Arco-flails | 4 | 4+ | 5 | 0 | 1 | SUSTAINED HITS 1 |

Core abilities: Feel No Pain 5+
Army rules: Acts of Faith
Abilities:
Extremis Trigger Word: Each time this unit is selected to fight, you can choose to invoke its extremis trigger word. If you do, then until the end of the phase, arco-flails equipped by models in this unit have an Attacks characteristic of 6 and the [HAZARDOUS] ability.
Unit composition: 3-10 Arco-flagellants models, equipped with: 1 Arco-flails.
Points: 3 models: 50 pts · 10 models: 140 pts

### Battle Sanctum
Source: Codex · Keywords: IMPERIUM; FORTIFICATION; FRAME; TOWERING; BATTLE SANCTUM; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Battle Sanctum | - | 11 | 3+ | 20 | 7+ | 0 |

No weapons.

Core abilities: Deadly Demise D6
Army rules: Acts of Faith
Abilities:
Fortification: While an enemy unit is only within Engagement Range of one or more FORTIFICATIONS from your army: • That unit can still be selected as the target of ranged attacks, but each time such an attack is made, unless it is made with a Pistol, subtract 1 from the Hit roll. • Models in that unit do not need to take Desperate Escape tests due to Falling Back while Battle- shocked, except for those that will move over enemy models when doing so.
Consecrated Ground: When this FORTIFICATION is set up, all parts of it must be set up within 1" of another part. Friendly ADEPTA SORORITAS INFANTRY models can be set up or end any type of move on top of the floor sections of this FORTIFICATION. While an ADEPTA SORORITAS unit from your army is within 1" of this FORTIFICATION, that unit can perform one additional Act of Faith per phase.
Holy Cover: Each time a ranged attack is allocated to a model, if that model is not fully visible to every model in the attacking unit because of this Fortification, that model has the Benefit of Cover against that attack.
Unit composition: 1 Battle Sanctum model.
Points: 1 model: 170 pts

### Battle Sisters Squad
Source: Codex · Keywords: INFANTRY; GRENADES; BATTLELINE; IMPERIUM; BATTLE SISTERS SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Sister Superior | 6" | 3 | 3+ | 1 | 7+ | 2 |
| Battle Sister | 6" | 3 | 3+ | 1 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Artificer-crafted storm bolter | 24" | 2 | 3+ | 4 | 0 | 2 | RAPID FIRE 2 |
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | RAPID FIRE 1 |
| Combi-weapon | 24" | 1 | 4+ | 4 | 0 | 1 | ANTI-INFANTRY 4+ DEVASTATING WOUNDS RAPID FIRE 1 |
| Condemnor boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | ANTI-PSYKER 2+ DEVASTATING WOUNDS PRECISION RAPID FIRE 1 |
| Heavy bolter | 36" | 3 | 4+ | 5 | -1 | 2 | HEAVY SUSTAINED HITS 1 |
| Inferno pistol | 6" | 1 | 3+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Meltagun | 12" | 1 | 3+ | 9 | -4 | D6 | MELTA 2 |
| Ministorum flamer | 12" | D6 | - | 5 | 0 | 1 | IGNORES COVER TORRENT |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |
| Ministorum heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT |
| Multi-melta | 18" | 2 | 4+ | 9 | -4 | D6 | HEAVY MELTA 2 |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Chainsword | 3 | 4+ | 3 | 0 | 1 | - |
| Close combat weapon | 1 | 4+ | 3 | 0 | 1 | - |
| Power weapon | 2 | 4+ | 4 | -2 | 1 | - |

Wargear options:
• The Sister Superior’s boltgun can be replaced with one of the following: 1 bolt pistol; 1 combi-weapon; 1 condemnor boltgun; 1 inferno pistol; 1 Ministorum hand flamer; 1 plasma pistol
• The Sister Superior can be equipped with one of the following: 1 chainsword; 1 power weapon
• 1 Battle Sister’s boltgun can be replaced with one of the following: 1 artificer-crafted storm bolter; 1 meltagun; 1 Ministorum flamer
• 1 Battle Sister’s boltgun can be replaced with one of the following: 1 artificer-crafted storm bolter; 1 heavy bolter; 1 meltagun; 1 Ministorum flamer; 1 Ministorum heavy flamer; 1 multi-melta
• 1 Battle Sister equipped with 1 boltgun can be equipped with 1 simulacrum imperialis (that model’s boltgun cannot be replaced).

Army rules: Acts of Faith
Abilities:
Cherub: Once per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice.
Designer’s Note: Place a Cherub token next to the unit, removing it once this ability has been used.
Defenders of the Faith: At the end of your Command phase, if this unit is within range of an objective marker you control, that objective marker remains under your control until your opponent’s Level of Control over that objective marker is greater than yours at the end of a phase.
Simulacrum Imperialis: At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result.
Unit composition: 1 Sister Superior model; 9 Battle Sister models. Every model: 1 Bolt pistol; 1 Boltgun; 1 Close combat weapon.
Points: 10 models: 100 pts

### Canoness with jump pack
Source: Codex · Keywords: INFANTRY; CHARACTER; JUMP PACK; FLY; GRENADES; IMPERIUM; CANONESS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Canoness with jump pack | 12" | 3 | 3+ | 3 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Blessed halberd | 5 | 2+ | 5 | -2 | 2 | - |
| Holy Eviscerator | 3 | 2+ | 6 | -2 | 2 | SUSTAINED HITS 1 |
| Power weapon | 4 | 2+ | 4 | -2 | 2 | - |

Wargear options:
• This model’s blessed halberd can be replaced with one of the following: 1 holy eviscerator; 1 Ministorum hand flamer and 1 power weapon

Core abilities: Deep Strike, Leader
Army rules: Acts of Faith
Abilities:
Sacred Command: Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP.
Divine Deliverance: Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and those weapons have the [DEVASTATING WOUNDS] ability.
Unit composition: 1 Canoness with jump pack model, equipped with: 1 Blessed halberd.
Points: 1 model: 75 pts
Leads: SERAPHIM SQUAD, ZEPHYRIM SQUAD

### Canoness
Source: Codex · Keywords: INFANTRY; CHARACTER; GRENADES; IMPERIUM; CANONESS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Canoness | 6" | 3 | 3+ | 4 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 2+ | 4 | 0 | 1 | PISTOL |
| Brazier of holy fire | 12" | D6 | - | 6 | -1 | 2 | IGNORES COVER ONE SHOT TORRENT |
| Condemnor boltgun | 24" | 1 | 2+ | 4 | 0 | 1 | ANTI-PSYKER 2+ DEVASTATING WOUNDS PRECISION RAPID FIRE 1 |
| Inferno pistol | 6" | 1 | 2+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Plasma pistol - standard | 12" | 1 | 2+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 2+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Blessed blade | 4 | 2+ | 6 | -2 | 2 | LETHAL HITS |
| Hallowed Chainsword | 5 | 2+ | 3 | -1 | 1 | - |
| Power weapon | 4 | 2+ | 4 | -2 | 2 | - |

Wargear options:
• This model’s bolt pistol can be replaced with one of the following: 1 condemnor boltgun; 1 inferno pistol; 1 plasma pistol
• This model’s hallowed chainsword can be replaced with one of the following: 1 blessed blade; 1 power weapon
• If this model is equipped with a hallowed chainsword, it can be equipped with one of the following: 1 brazier of holy fire; 1 null rod
• If this model is equipped with a plasma pistol and a power weapon, it can be equipped with: 1 rod of office

Core abilities: Leader
Army rules: Acts of Faith
Abilities:
Sacred Command: Once per battle round, one unit from your army with this ability can use it when its unit is targeted with a Stratagem. If it does, reduce the CP cost of that use of that Stratagem by 1CP.
The Emperor’s Grace: Once per battle, at the start of any phase, this model can use this ability. If it does, until the end of the phase, this model has a 2+ invulnerable save.
Null Rod: Models in the bearer’s unit have the Feel No Pain 4+ ability against mortal wounds and Psychic Attacks.
Rod of Office: Each time a model in the bearer’s unit makes an attack, re-roll a Hit roll of 1.
Unit composition: 1 Canoness model, equipped with: 1 Bolt pistol; 1 Hallowed Chainsword.
Points: 1 model: 60 pts
Leads: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD

### Castigator
Source: Codex · Keywords: VEHICLE; SMOKE; IMPERIUM; FRAME; CASTIGATOR; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Castigator | 10" | 10 | 3+ | 11 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Castigator autocannons | 48" | 4 | 3+ | 9 | -1 | 3 | RAPID FIRE 4 TWIN-LINKED |
| Castigator battle cannon | 48" | D6+3 | 3+ | 10 | -1 | 3 | BLAST IGNORES COVER |
| Heavy bolter | 36" | 3 | 3+ | 5 | -1 | 2 | SUSTAINED HITS 1 |
| Hunter-killer missile | 48" | 1 | 2+ | 14 | -3 | D6 | - |
| Storm bolter | 24" | 2 | 3+ | 4 | 0 | 1 | RAPID FIRE 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured tracks | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model’s Castigator autocannons can be replaced with 1 Castigator battle cannon.
• This model can be equipped with 1 hunter-killer missile.
• This model can be equipped with 1 storm bolter.

Core abilities: Deadly Demise D3
Army rules: Acts of Faith
Abilities:
Rites of Castigation: In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the turn, each time a friendly ADEPTA SORORITAS unit makes a ranged attack that targets that enemy unit, improve the Armour Penetration characteristic of that attack by 1. The same enemy unit can only be affected by this ability once per turn.
Damaged (1-4 wounds remaining): While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.
Unit composition: 1 Castigator model, equipped with: 1 Castigator autocannons; 3 Heavy bolter; 1 Armoured tracks.
Points (1st–2nd units): 1 model: 165 pts · Points (3rd+ unit): 1 model: 185 pts

### Celestian Insidiants
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; CELESTIAN; CELESTIAN INSIDIANTS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Celestian Insidiant Superior | 6" | 3 | 3+ | 1 | 7+ | 1 |
| Celestian Insidiant | 6" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Condemnor bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | ANTI-PSYKER 4+ DEVASTATING WOUNDS PISTOL |
| Inferno pistol | 6" | 1 | 3+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Blessed sword | 3 | 3+ | 4 | -2 | 2 | LETHAL HITS |
| Null mace | 3 | 3+ | 4 | -1 | 1 | ANTI-PSYKER 4+ DEVASTATING WOUNDS |
| Virge of admonition | 3 | 4+ | 6 | -2 | 3 | ANTI-PSYKER 4+ DEVASTATING WOUNDS |

Wargear options:
• The Celestian Insidiant Superior’s condemnor bolt pistol can be replaced with 1 inferno pistol.
• Up to 2 Celestian Insidiants can each have their condemnor bolt pistol replaced with 1 Ministorum hand flamer.
• Up to 2 Celestian Insidiants can each have their condemnor bolt pistol and null mace replaced with 1 blessed sword.
• One Celestian Insidiant’s condemnor bolt pistol and null mace can be replaced with 1 virge of admonition.
• One Celestian Insidiant’s condemnor bolt pistol can be replaced with 1 denuncia oratory.
• One Celestian Insidiant equipped with 1 condemnor bolt pistol can be equipped with 1 simulacrum imperialis (that model’s condemnor bolt pistol cannot be replaced).

Army rules: Acts of Faith
Abilities:
Attached Unit: If a CHARACTER unit from your army can be attached to a DOMINION SQUAD unit, it can be attached to this unit instead.
Rituale Nullificatus: Models in this unit have the Feel No Pain 4+ ability against Psychic Attacks and mortal wounds.
Virtue of Intolerance: At the start of the battle, select one unit from your opponent’s army to be this unit’s quarry. Each time a model in this unit makes an attack that targets its quarry, that attack has the [PRECISION] ability and you can re-roll the Hit roll. This ability can be used even if this unit is embarked within a TRANSPORT.
Simulacrum Imperialis: At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result.
Denuncia Oratory: Each time the bearer’s unit’s quarry is destroyed, you can select a new unit from your opponent’s army to be its quarry.
Unit composition: 1 Celestian Insidiant Superior model; 9 Celestian Insidiant models. Every model: 1 Condemnor bolt pistol; 1 Null mace.
Points: 10 models: 115 pts

### Celestian Sacresant Aveline
Source: Codex · Keywords: INFANTRY; CHARACTER; IMPERIUM; GRENADES; EPIC HERO; CELESTIAN SACRESANT AVELINE; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Celestian Sacresant Aveline | 6" | 3 | 3+ | 4 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| The Thorn of the White Rose | 4 | 3+ | 5 | -2 | 2 | - |

Wargear options:
• None

Core abilities: Feel No Pain 6+, Lone Operative
Army rules: Acts of Faith
Abilities:
Instrument of the Emperor’s Wrath: Once per battle, at the start of the Fight phase, this model can use this ability. If it does, until the end of the phase, add 3 to the Attacks characteristic of melee weapons equipped by this model and those weapons have the [DEVASTATING WOUNDS] ability.
Daemonbreaker: Each time this model makes an attack that targets a DAEMON unit, you can re-roll the Hit roll and you can re-roll the Wound roll.
Unit composition: 1 Celestian Sacresant Aveline model, equipped with: 1 Ministorum hand flamer; 1 The Thorn of the White Rose.
Points: 1 model: 45 pts

### Celestian Sacresants
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; CELESTIAN; CELESTIAN SACRESANTS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Sacresant Superior | 6" | 3 | 3+ | 1 | 7+ | 1 |
| Celestian Sacresant | 6" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Inferno pistol | 6" | 1 | 3+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Anointed halberd | 3 | 3+ | 5 | -2 | 1 | SUSTAINED HITS 1 |
| Hallowed mace | 3 | 3+ | 4 | -1 | 2 | LETHAL HITS |
| Spear of the faithful | 3 | 3+ | 5 | -2 | 2 | - |

Wargear options:
• Any number of models can each have their hallowed mace replaced with 1 anointed halberd.
• The Sacresant Superior’s bolt pistol can be replaced with one of the following: 1 inferno pistol; 1 Ministorum hand flamer; 1 plasma pistol
• The Sacresant Superior’s hallowed mace can be replaced with 1 spear of the faithful.

Army rules: Acts of Faith
Abilities:
Sworn Protectors: While an ADEPTA SORORITAS CHARACTER is leading this unit, each time an attack targets this unit, subtract 1 from the Wound roll.
Unit composition: 1 Sacresant Superior model; 4-9 Celestian Sacresant models. Every model: 1 Bolt pistol; 1 Hallowed mace.
Points (1st–2nd units): 5 models: 75 pts · 10 models: 150 pts · Points (3rd+ unit): 5 models: 85 pts · 10 models: 160 pts

### Crusaders
Source: Codex · Keywords: INFANTRY; IMPERIUM; CRUSADERS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Crusaders | 6" | 3 | 3+ | 2 | 7+ | 1 |

Invulnerable save: 4+

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Power weapon | 3 | 3+ | 4 | -2 | 2 | - |

Wargear options:
• None

Army rules: Acts of Faith
Abilities:
Attached Unit: If a CHARACTER unit from your army with the Leader ability can be attached to a BATTLE SISTERS SQUAD, it can be attached to this unit instead.
Spiritual Fortitude: Models in this unit have the Feel No Pain 4+ ability against Psychic Attacks and mortal wounds.
Unit composition: 2-4 Crusaders models, equipped with: 1 Power weapon.
Points: 2 models: 40 pts · 4 models: 80 pts

### Daemonifuge
Source: Codex · Keywords: INFANTRY; GRENADES; CHARACTER; EPIC HERO; IMPERIUM; DAEMONIFUGE; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Ephrael Stern | 8" | 3 | 3+ | 5 | 7+ | 1 |
| Kyganil of the Bloody Tears | 8" | 3 | 3+ | 5 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Sanctity | 4 | 2+ | 6 | -2 | 2 | ANTI-CHAOS 2+ PRECISION |
| The Outcast’s Weapons | 6 | 2+ | 4 | -2 | 1 | PRECISION |

Core abilities: Deep Strike, Fights First, Lone Operative
Army rules: Acts of Faith
Abilities:
Holy Judgement: At the start of your Shooting phase, select one enemy unit within 12" of and visible to this unit's Ephrael Stern model. That unit must take a Battle-shock test, subtracting 2 from the result if it is a CHAOS unit. If the test is failed, that enemy unit suffers 3 mortal wounds.
Mysterious Saviours: You can target this unit with the Heroic Intervention stratagem, regardless of any other uses of that stratagem this phase. If you do:
• That use is -1 CP.
• That use does not prevent any uses of that stratagem on other units this phase.
Unit composition: 1 Ephrael Stern model; 1 Kyganil of the Bloody Tears model. Every Ephrael Stern: 1 Bolt pistol; 1 Sanctity. Every Kyganil of the Bloody Tears: 1 The Outcast’s Weapons.
Points: 2 models: 85 pts

### Death Cult Assassins
Source: Codex · Keywords: INFANTRY; IMPERIUM; DEATH CULT ASSASSINS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Death Cult Assassins | 7" | 3 | 5+ | 2 | 7+ | 1 |

Invulnerable save: 5+

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Death Cult power blades | 4 | 2+ | 4 | -2 | 1 | PRECISION |

Wargear options:
• None

Core abilities: Fights First, Infiltrators, Lone Operative
Army rules: Acts of Faith
Abilities:
Death Cult: Each time a model in this unit makes an attack that targets a CHARACTER unit, re-roll a Wound roll.
Unit composition: 2-4 Death Cult Assassins models, equipped with: 1 Death Cult power blades.
Points: 2 models: 55 pts · 4 models: 110 pts

### Dialogus
Source: Codex · Keywords: INFANTRY; CHARACTER; IMPERIUM; DIALOGUS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Dialogus | 6" | 3 | 3+ | 3 | 6+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Dialogus staff | 3 | 4+ | 4 | 0 | 1 | - |

Core abilities: Support
Army rules: Acts of Faith
Abilities:
Laud Hailer: Once per battle, at the start of any phase, you can select one friendly ADEPTA SORORITAS unit that is Battle-shocked and within 12" of this model. That unit is no longer Battle-shocked.
Stirring Rhetoric: While this model is leading a unit, each time this model’s unit performs an Act of Faith, the value of one of the Miracle dice used in that Act of Faith is first changed to a 6.
Support: This model can be attached to a BATTLE SISTERS SQUAD, even if one CANONESS, PALATINE, JUNITH ERUITA or AESTRED THURGA model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.
Unit composition: 1 Dialogus model, equipped with: 1 Bolt pistol; 1 Dialogus staff.
Points: 1 model: 40 pts
Supports: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD

### Dogmata
Source: Codex · Keywords: INFANTRY; GRENADES; CHARACTER; IMPERIUM; DOGMATA; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Dogmata | 6" | 3 | 3+ | 3 | 6+ | 1 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Mace of the righteous | 4 | 3+ | 5 | -2 | 2 | - |

Core abilities: Support
Army rules: Acts of Faith
Abilities:
Executioner of Heretics (Aura): While an enemy unit is within 6" of this model, worsen the Leadership characteristic of models in that unit by 1.
Unflinching Determination: While this model is leading a unit, add 1 to the Objective Control characteristic of models in that unit.
Support: This model can be attached to a BATTLE SISTERS SQUAD, even if one CANONESS, PALATINE, JUNITH ERUITA or AESTRED THURGA model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.
Unit composition: 1 Dogmata model, equipped with: 1 Bolt pistol; 1 Mace of the righteous.
Points: 1 model: 45 pts
Supports: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD

### Dominion Squad
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; DOMINION SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Dominion Superior | 6" | 3 | 3+ | 1 | 7+ | 1 |
| Dominion | 6" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Artificer-crafted storm bolter | 24" | 2 | 3+ | 4 | 0 | 2 | ASSAULT RAPID FIRE 2 |
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | ASSAULT RAPID FIRE 1 |
| Combi-weapon | 24" | 1 | 4+ | 4 | 0 | 1 | ANTI-INFANTRY 4+ DEVASTATING WOUNDS RAPID FIRE 1 |
| Condemnor boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | ANTI-PSYKER 2+ DEVASTATING WOUNDS PRECISION RAPID FIRE 1 |
| Inferno pistol | 6" | 1 | 3+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Meltagun | 12" | 1 | 3+ | 9 | -4 | D6 | ASSAULT MELTA 2 |
| Ministorum flamer | 12" | D6 | - | 5 | 0 | 1 | ASSAULT IGNORES COVER TORRENT |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Chainsword | 3 | 4+ | 3 | 0 | 1 | - |
| Close combat weapon | 1 | 4+ | 3 | 0 | 1 | - |
| Power weapon | 2 | 4+ | 4 | -2 | 1 | - |

Wargear options:
• The Dominion Superior’s boltgun can be replaced with one of the following: 1 bolt pistol; 1 combi-weapon; 1 condemnor boltgun; 1 inferno pistol; 1 Ministorum hand flamer; 1 plasma pistol
• The Dominion Superior can be equipped with one of the following: 1 chainsword; 1 power weapon
• Up to 4 Dominions can each have their boltgun replaced with one of the following: 1 artificer-crafted storm bolter; 1 meltagun; 1 Ministorum flamer
• 1 Dominion equipped with 1 boltgun can be equipped with 1 simulacrum imperialis (that model’s boltgun cannot be replaced).

Core abilities: Scouts 6"
Army rules: Acts of Faith
Abilities:
Cherub: Once per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice.
Designer’s Note: Place a Cherub token next to the unit, removing it once this ability has been used.
Righteous Awareness: In your opponent’s Movement phase, if an enemy unit ends a move within 8" of this unit, if this unit is not within Engagement Range of one or more enemy units it can make a Normal move of up to D6".
Simulacrum Imperialis: At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result.
Wargear points: per Meltagun: 5 pts
Unit composition: 1 Dominion Superior model; 9 Dominion models. Every model: 1 Bolt pistol; 1 Boltgun; 1 Close combat weapon.
Points (1st–2nd units): 10 models: 90 pts · Points (3rd+ unit): 10 models: 100 pts

### Exorcist
Source: Codex · Keywords: VEHICLE; SMOKE; IMPERIUM; FRAME; EXORCIST; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Exorcist | 10" | 10 | 3+ | 11 | 7+ | 3 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Exorcist conflagration rockets | 36" | 3D6 | 3+ | 6 | -1 | 1 | BLAST IGNORES COVER INDIRECT FIRE |
| Exorcist missile launcher | 36" | D6+2 | 3+ | 10 | -3 | D6 | INDIRECT FIRE |
| Heavy bolter | 36" | 3 | 3+ | 5 | -1 | 2 | SUSTAINED HITS 1 |
| Hunter-killer missile | 48" | 1 | 2+ | 14 | -3 | D6 | - |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured tracks | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model can be equipped with 1 hunter-killer missile.
• This model’s Exorcist missile launcher can be replaced with 1 Exorcist conflagration rockets.

Core abilities: Deadly Demise D3
Army rules: Acts of Faith
Abilities:
Devastating Refrain: In your Shooting phase, after this model has shot, if one or more of those attacks made with an Indirect Fire weapon scored a hit against an enemy unit, that unit must take a Battle-shock test. Each time such an attack destroys an enemy model that has the Deadly Demise ability, that model’s Deadly Demise ability inflicts mortal wounds on a D6 roll of 5+ instead of on a 6.
Damaged (1-4 wounds remaining): While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.
Unit composition: 1 Exorcist model, equipped with: 1 Exorcist missile launcher; 1 Heavy bolter; 1 Armoured tracks.
Points (1st–2nd units): 1 model: 175 pts · Points (3rd+ unit): 1 model: 215 pts

### Hospitaller
Source: Codex · Keywords: INFANTRY; CHARACTER; IMPERIUM; HOSPITALLER; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Hospitaller | 6" | 3 | 3+ | 3 | 7+ | 1 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Chirurgeon’s tools | 3 | 4+ | 3 | 0 | 1 | - |

Core abilities: Support
Army rules: Acts of Faith
Abilities:
Medicus Ministorum: While this model is leading a unit, models in that unit have the Feel No Pain 5+ ability.
Sacred Healing: While this model is leading a unit, in your Command phase, you can return up to 1 destroyed model (excluding CHARACTER models) to that unit. If you wish, you can first discard 1 Miracle dice; if you do, you can return up to D3+1 destroyed models (excluding CHARACTER models) to that unit instead.
Support: This model can be attached to a BATTLE SISTERS SQUAD, even if one CANONESS, PALATINE, JUNITH ERUITA or AESTRED THURGA model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.
Unit composition: 1 Hospitaller model, equipped with: 1 Bolt pistol; 1 Chirurgeon’s tools.
Points (1st unit): 1 model: 65 pts · Points (2nd+ unit): 1 model: 75 pts
Supports: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD

### Imagifier
Source: Codex · Keywords: INFANTRY; GRENADES; CHARACTER; IMPERIUM; IMAGIFIER; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Imagifier | 6" | 3 | 3+ | 3 | 6+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | RAPID FIRE 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Close combat weapon | 3 | 4+ | 3 | 0 | 1 | - |

Core abilities: Support
Army rules: Acts of Faith
Abilities:
Litany of Deeds: Each time you gain a Miracle dice as the result of an ADEPTA SORORITAS unit or model from your army being destroyed, if that unit or model was destroyed within 12" of this model, you can re-roll the result of that Miracle dice before adding it to your Miracle dice pool.
Stanchion of Holy Martyrs: While this model is leading a unit, models in that unit have a Save characteristic of 2+ and a 4+ invulnerable save.
Support: This model can be attached to a BATTLE SISTERS SQUAD, even if one CANONESS, PALATINE, JUNITH ERUITA or AESTRED THURGA model has already been attached to it. If you do, and that Bodyguard unit is destroyed, the Leader units attached to it become separate units, with their original Starting Strengths.
Unit composition: 1 Imagifier model, equipped with: 1 Bolt pistol; 1 Boltgun; 1 Close combat weapon.
Points: 1 model: 55 pts
Supports: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD

### Immolator
Source: Codex · Keywords: VEHICLE; SMOKE; TRANSPORT; DEDICATED TRANSPORT; IMPERIUM; FRAME; IMMOLATOR; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Immolator | 12" | 10 | 3+ | 11 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Heavy bolter | 36" | 3 | 3+ | 5 | -1 | 2 | SUSTAINED HITS 1 |
| Hunter-killer missile | 48" | 1 | 2+ | 14 | -3 | D6 | - |
| Immolation flamers | 18" | 2D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT |
| Twin heavy bolter | 36" | 3 | 3+ | 5 | -1 | 2 | SUSTAINED HITS 2 TWIN-LINKED |
| Twin multi-melta | 18" | 2 | 3+ | 9 | -4 | D6 | MELTA 2 TWIN-LINKED |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured tracks | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model can be equipped with 1 hunter-killer missile.
• This model’s immolation flamers can be replaced with one of the following: 1 twin heavy bolter; 1 twin multi-melta

Core abilities: Deadly Demise D3
Army rules: Acts of Faith
Abilities:
Purge and Cleanse: In your Shooting phase, after this model has shot, select one enemy unit hit by one or more of those attacks. Until the end of the phase, that enemy unit cannot have the Benefit of Cover.
Transport: This model has a transport capacity of 6 ADEPTA SORORITAS INFANTRY models. It cannot transport JUMP PACK models or the TRIUMPH OF SAINT KATHERINE.
At the start of the Declare Battle Formations step, you can select one BATTLE SISTERS SQUAD, DOMINION SQUAD or SISTERS NOVITIATE SQUAD from your army. If you do, that unit is split into two units, each containing as equal a number of models as possible (when splitting a unit in this way, make a note of which models form each of the two new units. If you are splitting a unit that has the Cherub ability, only one of the new units can use that ability during the battle – make a note of which of the new units this will be). One of these units must start the battle embarked within this TRANSPORT; the other can start the battle embarked within another TRANSPORT, or it can be deployed as a separate unit.
Wargear points: per Twin multi-melta: 15 pts
Unit composition: 1 Immolator model, equipped with: 1 Heavy bolter; 1 Immolation flamers; 1 Armoured tracks.
Points (1st–3rd units): 1 model: 100 pts · Points (4th+ unit): 1 model: 115 pts

### Intranzia Fraye
Source: Codex · Keywords: VEHICLE; WALKER; IMPERIUM; CHARACTER; PENITENT; EPIC HERO; INTRANZIA FRAYE; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Intranzia Fraye | 8" | 7 | 3+ | 8 | 6+ | 3 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Heavy bolter | 36" | 3 | 2+ | 5 | -1 | 2 | SUSTAINED HITS 1 |
| Melta missile array | 24" | 2 | 2+ | 9 | -2 | D3 | MELTA 2 |
| Ministorum heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Mace of Saint Praxedes | 4 | 2+ | 6 | -2 | 2 | SUSTAINED HITS 1 |
| Throne of Blame | 4 | 4+ | 6 | 0 | 1 | EXTRA ATTACKS |

Wargear options:
• None

Core abilities: Deadly Demise 1, Feel No Pain 5+
Army rules: Acts of Faith
Abilities:
Righteous Denunciation: At the start of the Fight phase, each enemy unit within 6" of this model must take a Battle-shock test, subtracting 1 from that test.
Judged for Execution: At the end of your Movement phase, you can select one enemy unit within 18" of and visible to this model. Until the start of your next Command phase, each time a friendly ADEPTA SORORITAS model makes an attack that targets that enemy unit, that attack has the [LETHAL HITS] ability.
Unit composition: 1 Intranzia Fraye model, equipped with: 2 Heavy bolter; 2 Ministorum heavy flamer; 1 Melta missile array; 1 Mace of Saint Praxedes; 1 Throne of Blame.
Points: 1 model: 135 pts

### Junith Eruita
Source: Codex · Keywords: MOUNTED; CHARACTER; FLY; EPIC HERO; IMPERIUM; JUNITH ERUITA; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Junith Eruita | 8" | 5 | 2+ | 8 | 6+ | 2 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Twin Ministorum heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT TWIN-LINKED |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Mace of Castigation | 4 | 2+ | 6 | -2 | 2 | - |

Core abilities: Deadly Demise 1, Leader
Army rules: Acts of Faith
Abilities:
The Pulpit of Saint Holline’s Basilica: This unit has Stealth
Melee attacks that target this unit have -1 to hit rolls
Fiery Conviction: If this model is on the battlefield at the start of your Command phase, you can choose one of the following:
• Discard 1 Miracle dice and gain 1CP.
• Take a Leadership test for this model, if that test is passed, gain 1CP.
Unit composition: 1 Junith Eruita model, equipped with: 1 Twin Ministorum heavy flamer; 1 Mace of Castigation.
Points: 1 model: 105 pts
Leads: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD

### Ministorum Priest
Source: Codex · Keywords: INFANTRY; CHARACTER; IMPERIUM; PENITENT; MINISTORUM PRIEST; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Ministorum Priest | 6" | 3 | 6+ | 3 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Holy pistol | 12" | 3 | 4+ | 4 | 0 | 1 | PISTOL |
| Zealot’s vindictor | 12" | D6 | - | 5 | 0 | 1 | IGNORES COVER TORRENT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Power Weapon | 3 | 3+ | 4 | -2 | 1 | - |
| Zealot’s vindictor | 3 | 4+ | 5 | -1 | 2 | - |

Wargear options:
• This model’s zealot’s vindictor can be replaced with 1 holy pistol and 1 power weapon.

Core abilities: Leader
Army rules: Acts of Faith
Abilities:
Righteous Smiting: While this model is leading a unit, each time a model in that unit makes a melee attack, add 1 to the Wound roll.
Zealot: Once per battle, in the Fight phase, this model can use this ability. If it does, until the end of the phase, improve the Strength and Attacks characteristics of melee weapons equipped by this model by 3.
Leader: Holy Mission
Leader: If this model is attached to a DOMINION SQUAD during the Declare Battle Formations step, it gains the Scouts 6" ability. If this model is attached to a SISTERS NOVITIATE SQUAD during the Declare Battle Formations step, it gains the Infiltrators ability.
Unit composition: 1 Ministorum Priest model, equipped with: 1 Zealot’s vindictor.
Points: 1 model: 50 pts
Leads: ARCO-FLAGELLANTS, BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CRUSADERS, DOMINION SQUAD, SANCTIFIERS, SISTERS NOVITIATE SQUAD

### Mortifiers
Source: Codex · Keywords: VEHICLE; WALKER; IMPERIUM; PENITENT; MORTIFIERS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Mortifiers | 8" | 6 | 4+ | 5 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Heavy bolter | 36" | 3 | 3+ | 5 | -1 | 2 | SUSTAINED HITS 1 |
| Mortifier flamer | 12" | D6 | - | 5 | 0 | 1 | IGNORES COVER TORRENT TWIN-LINKED |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Penitent buzz-blade | 4 | 3+ | 10 | -3 | 2 | SUSTAINED HITS 1 |
| Penitent flail | 8 | 3+ | 5 | -1 | 1 | SUSTAINED HITS 1 |
| Twin penitent buzz-blades | 4 | 3+ | 10 | -3 | 2 | SUSTAINED HITS 1 TWIN-LINKED |
| Twin penitent flails | 8 | 3+ | 5 | -1 | 1 | SUSTAINED HITS 1 TWIN-LINKED |

Wargear options:
• 1 model can be equipped with 1 anchorite sarcophagus.
• Any number of models can each have their 2 heavy bolters replaced with one of the following: 1 heavy bolter and 1 Mortifier flamer; 2 Mortifier flamers
• Any number of models can each have their twin penitent buzz-blades replaced with one of the following: 1 twin penitent flails; 1 penitent buzz-blade and 1 penitent flail

Core abilities: Deadly Demise 1, Feel No Pain 5+
Army rules: Acts of Faith
Abilities:
Anguish of the Unredeemed: Each time a model in this unit is destroyed by a melee attack, if that model has not fought this phase, roll one D6. On a 2+, do not remove it from play; That destroyed model can fight after the attacking unit has finished making its attacks, and is then removed from play.
Anchorite Sarcophagus: The bearer has a Move characteristic of 7" and a Save characteristic of 3+.
Unit composition: 1-2 Mortifiers models, equipped with: 2 Heavy bolter; 1 Twin penitent buzz-blades.
Points: 1 model: 70 pts · 2 models: 130 pts

### Morvenn Vahl
Source: Codex · Keywords: VEHICLE; WALKER; CHARACTER; EPIC HERO; IMPERIUM; MORVENN VAHL; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Morvenn Vahl | 8" | 7 | 2+ | 8 | 6+ | 3 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Fidelis | 36" | 3 | 2+ | 6 | -1 | 2 | SUSTAINED HITS 1 |
| Paragon missile launcher - prioris | 36" | 2 | 2+ | 9 | -2 | D6 | - |
| Paragon missile launcher - sanctorum | 36" | 2D6 | 2+ | 4 | 0 | 1 | BLAST |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Lance of Illumination - strike | 5 | 2+ | 8 | -2 | 3 | DEVASTATING WOUNDS |
| Lance of Illumination - sweep | 10 | 2+ | 5 | -1 | 1 | DEVASTATING WOUNDS |

Core abilities: Deadly Demise 1, Leader
Army rules: Acts of Faith
Abilities:
Abbess Sanctorum: While this model is leading a unit, each time a model in that unit makes an attack, you can re-roll the Hit roll and you can re-roll the Wound roll.
Righteous Repugnance: Each time this model’s unit is selected to shoot or fight, you can discard 1 Miracle dice. If you do, until the end of the phase, add 3 to the Attacks characteristic of Fidelis and the Lance of Illumination. Each time an enemy unit is destroyed by this model, you gain 1 Miracle dice.
Leader: SUPREME COMMANDER
Leader: If this model is in your army, it must be your Warlord.
Unit composition: 1 Morvenn Vahl model, equipped with: 1 Fidelis; 1 Paragon missile launcher; 1 Lance of Illumination.
Points: 1 model: 215 pts
Leads: PARAGON WARSUITS

### Palatine
Source: Codex · Keywords: INFANTRY; CHARACTER; GRENADES; IMPERIUM; PALATINE; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Palatine | 6" | 3 | 3+ | 4 | 7+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 2+ | 4 | 0 | 1 | PISTOL |
| Plasma pistol - standard | 12" | 1 | 2+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 2+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Palatine blade | 4 | 2+ | 4 | -2 | 2 | - |

Wargear options:
• This model’s bolt pistol can be replaced with 1 plasma pistol.

Core abilities: Leader
Army rules: Acts of Faith
Abilities:
Fury of the Righteous: While this model is leading a unit, weapons equipped by models in that unit have the [LETHAL HITS] ability.
Rapturous Blows: Each time this model’s unit is selected to fight, you can discard 1 Miracle dice. If you do, then until the end of the phase, each time a melee attack made by this model scores a wound, the target of that attack suffers 1 mortal wound in addition to any normal damage.
Unit composition: 1 Palatine model, equipped with: 1 Bolt pistol; 1 Palatine blade.
Points: 1 model: 50 pts
Leads: BATTLE SISTERS SQUAD, CELESTIAN INSIDIANTS, CELESTIAN SACRESANTS, CRUSADERS, DOMINION SQUAD, RETRIBUTOR SQUAD, SISTERS NOVITIATE SQUAD

### Paragon Warsuits
Source: Codex · Keywords: VEHICLE; WALKER; GRENADES; IMPERIUM; PARAGON WARSUITS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Paragon Superior | 8" | 7 | 2+ | 4 | 7+ | 2 |
| Paragon | 8" | 7 | 2+ | 4 | 7+ | 2 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Heavy bolter | 36" | 3 | 3+ | 5 | -1 | 2 | SUSTAINED HITS 1 |
| Ministorum heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT |
| Multi-melta | 18" | 2 | 3+ | 9 | -4 | D6 | MELTA 2 |
| Paragon grenade launchers | 24" | 1 | 3+ | 9 | -2 | D3 | TWIN-LINKED |
| Paragon storm bolters | 24" | 2 | 3+ | 4 | 0 | 1 | RAPID FIRE 2 TWIN-LINKED |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Paragon war blade | 4 | 3+ | 8 | -2 | 2 | - |
| Paragon war mace | 3 | 3+ | 12 | -1 | 3 | - |

Wargear options:
• Any number of models can each have their Paragon storm bolters replaced with 1 Paragon grenade launchers.
• Any number of models can each have their Paragon war blade replaced with 1 Paragon war mace.
• Any number of models can each have their heavy bolter replaced with one of the following: 1 Ministorum heavy flamer; 1 multi-melta

Army rules: Acts of Faith
Abilities:
Righteous Paragons: Each time a model in this unit makes an attack that targets a MONSTER or VEHICLE unit, add 1 to the Hit roll and add 1 to the Wound roll.
Wargear points: per Multi-melta: 10 pts
Unit composition: 1 Paragon Superior model; 2 Paragon models. Every model: 1 Bolt pistol; 1 Heavy bolter; 1 Paragon storm bolters; 1 Paragon war blade.
Points (1st–2nd units): 3 models: 165 pts · Points (3rd+ unit): 3 models: 175 pts

### Penitent Engines
Source: Codex · Keywords: VEHICLE; WALKER; IMPERIUM; PENITENT; PENITENT ENGINES; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Penitent Engines | 8" | 6 | 4+ | 5 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Penitent flamers | 12" | 2D6 | - | 5 | 0 | 1 | ASSAULT IGNORES COVER TORRENT TWIN-LINKED |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Penitent buzz-blade | 4 | 4+ | 10 | -3 | 2 | SUSTAINED HITS 1 |
| Penitent flail | 8 | 4+ | 5 | -1 | 1 | SUSTAINED HITS 1 |
| Twin penitent buzz-blades | 4 | 4+ | 10 | -3 | 2 | SUSTAINED HITS 1 TWIN-LINKED |
| Twin penitent flails | 8 | 4+ | 5 | -1 | 1 | SUSTAINED HITS 1 TWIN-LINKED |

Wargear options:
• Any number of models can each have their twin penitent buzz-blades replaced with one of the following: 1 penitent buzz-blade and 1 penitent flail; 1 twin penitent flails

Core abilities: Deadly Demise 1, Feel No Pain 5+
Army rules: Acts of Faith
Abilities:
Endless Suffering: This unit is eligible to declare a charge in a turn in which it Advanced.
Unit composition: 1-2 Penitent Engines models, equipped with: 1 Penitent flamers; 1 Twin penitent buzz-blades.
Points: 1 model: 70 pts · 2 models: 140 pts

### Repentia Squad
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; PENITENT; REPENTIA SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Repentia Superior | 7" | 3 | 3+ | 1 | 7+ | 1 |
| Sister Repentia | 7" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Neural whips | 4 | 3+ | 3 | -1 | 1 | ANTI-INFANTRY 4+ |
| Penitent eviscerator | 2 | 4+ | 6 | -2 | 2 | SUSTAINED HITS 1 |

Core abilities: Feel No Pain 5+
Army rules: Acts of Faith
Abilities:
Overseer of Redemption: While this unit contains a Repentia Superior model, each time a Sisters Repentia model in this unit makes a melee attack, you can re-roll the Hit roll and you can re-roll the Wound roll.
Unit composition: 1 Repentia Superior model; 4-9 Sister Repentia models. Every Repentia Superior: 1 Bolt pistol; 1 Neural whips. Every Sister Repentia: 1 Penitent eviscerator.
Points: 5 models: 70 pts · 10 models: 140 pts

### Repressor
Source: Codex · Keywords: VEHICLE; SMOKE; TRANSPORT; FRAME; DEDICATED TRANSPORT; IMPERIUM; REPRESSOR; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Repressor | 12" | 10 | 3+ | 12 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT |
| Hunter-killer missile | 48" | 1 | 2+ | 14 | -3 | D6 | - |
| Repressor twin heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT TWIN-LINKED |
| Storm bolter | 24" | 2 | 3+ | 4 | 0 | 1 | RAPID FIRE 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Dozer ram | 3 | 4+ | 7 | 0 | 1 | - |

Wargear options:
• This model can be equipped with 1 hunter-killer missile.
• This model can be equipped with one of the following: 1 heavy flamer; 1 storm bolter

Core abilities: Deadly Demise D3, Firing Deck 6
Army rules: Acts of Faith
Abilities:
Emergency Combat Embarkation: Once per turn, in your opponent’s Charge phase, after an enemy unit has selected targets for its charge but before it makes a Charge move, you can select one ADEPTA SORORITAS unit from your army that was selected as a target of that charge. Provided that unit is not within Engagement Range of any enemy units and every model in that unit is within 3" of this TRANSPORT, it can embark within this TRANSPORT.
Transport: This model has a transport capacity of 12 ADEPTA SORORITAS INFANTRY models. It cannot transport JUMP PACK models or the TRIUMPH OF SAINT KATHERINE.
Damaged (1-4 wounds remaining): While this model has 1-4 wounds remaining, each time this model makes an attack, subtract 1 from the Hit roll.
Unit composition: 1 Repressor model, equipped with: 1 Repressor twin heavy flamer; 1 Storm bolter; 1 Dozer ram.
Points: 1 model: 130 pts

### Retributor Squad
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; RETRIBUTOR SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Retributor Superior | 6" | 3 | 3+ | 1 | 7+ | 1 |
| Retributor | 6" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | RAPID FIRE 1 |
| Combi-weapon | 24" | 1 | 4+ | 4 | 0 | 1 | ANTI-INFANTRY 4+ DEVASTATING WOUNDS RAPID FIRE 1 |
| Condemnor boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | ANTI-PSYKER 2+ DEVASTATING WOUNDS PRECISION RAPID FIRE 1 |
| Heavy bolter | 36" | 3 | 4+ | 5 | -1 | 2 | HEAVY SUSTAINED HITS 1 |
| Inferno pistol | 6" | 1 | 3+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |
| Ministorum heavy flamer | 12" | D6 | - | 6 | -1 | 1 | IGNORES COVER TORRENT |
| Multi-melta | 18" | 2 | 4+ | 9 | -4 | D6 | HEAVY MELTA 2 |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Chainsword | 3 | 4+ | 3 | 0 | 1 | - |
| Close combat weapon | 1 | 4+ | 3 | 0 | 1 | - |
| Power weapon | 2 | 4+ | 4 | -2 | 1 | - |

Wargear options:
• The Retributor Superior’s boltgun can be replaced with one of the following: 1 bolt pistol; 1 combi-weapon; 1 condemnor boltgun; 1 inferno pistol; 1 Ministorum hand flamer; 1 plasma pistol
• The Retributor Superior can be equipped with one of the following: 1 chainsword; 1 power weapon
• Each Retributor’s heavy bolter can be replaced with one of the following: 1 Ministorum heavy flamer; 1 multi-melta

Army rules: Acts of Faith
Abilities:
Cherubs: Twice per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice.
Designer’s Note: Place two Cherub tokens next to the unit, removing one each time this ability has been used.
Storm of Retribution: Each time a model in this unit makes a ranged attack, that model can re-roll a Hit roll of 1 and re-roll a Wound roll of 1. If such an attack targets an enemy unit that has destroyed one or more ADEPTA SORORITAS units from your army during the battle, add 1 to the Hit roll and add 1 to the Wound roll as well.
Wargear points: per Multi-melta: 5 pts
Unit composition: 1 Retributor Superior model; 4 Retributor models. Every Retributor Superior: 1 Bolt pistol; 1 Boltgun; 1 Close combat weapon. Every Retributor: 1 Bolt pistol; 1 Heavy bolter; 1 Close combat weapon.
Points (1st–2nd units): 5 models: 105 pts · Points (3rd+ unit): 5 models: 115 pts

### Saint Celestine
Source: Codex · Keywords: ; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Celestine | 12" | 3 | 2+ | 5 | 6+ | 1 |
| Geminae Superia | 12" | 3 | 2+ | 5 | 6+ | 1 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| The Ardent Blade | 12" | D6 | - | 6 | -2 | 1 | IGNORES COVER TORRENT |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Power weapon | 4 | 3+ | 4 | -2 | 1 | - |
| The Ardent Blade | 5 | 2+ | 6 | -3 | 2 | DEVASTATING WOUNDS |

Core abilities: Deep Strike, Leader
Army rules: Acts of Faith
Abilities:
Healing Tears: While this unit contains a Celestine model, in your Command phase, you can return 1 destroyed Geminae Superia model to this unit.
Lifewards: While this unit contains one or more Geminae Superia models, Celestine has the Feel No Pain 4+ ability.
Miraculous Intervention: The first time this unit’s Celestine model is destroyed, roll one D6 at the end of the phase. On a 2+, set that Celestine model back up on the battlefield, as close as possible to where it was destroyed and not within Engagement Range of any enemy units, with its full wounds remaining.
Leader: KEYWORDS – ALL MODELS: INFANTRY; JUMP PACK; FLY; GRENADES; IMPERIUMSAINT CELESTINE: CHARACTER; EPIC HERO; SAINT CELESTINE
Unit composition: 1 Celestine model; 2 Geminae Superia models. Every Celestine: 1 The Ardent Blade. Every Geminae Superia: 1 Bolt pistol; 1 Power weapon.
Points: 3 models: 135 pts
Leads: SERAPHIM SQUAD, ZEPHYRIM SQUAD

### Sanctifiers
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; SANCTIFIERS; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Miraculist | 6" | 3 | 6+ | 1 | 7+ | 1 |
| Salvationist | 6" | 3 | 6+ | 1 | 7+ | 1 |
| Death Cult Assassin | 6" | 3 | 6+ | 1 | 7+ | 1 |
| Missionary | 6" | 3 | 6+ | 1 | 7+ | 1 |
| Sanctifier | 6" | 3 | 6+ | 1 | 7+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Holy fire | 12" | D6 | - | 6 | -1 | 2 | IGNORES COVER ONE SHOT TORRENT |
| Meltagun | 12" | 1 | 4+ | 9 | -4 | D6 | MELTA 2 |
| Ministorum flamer | 12" | D6 | - | 5 | 0 | 1 | IGNORES COVER TORRENT |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |
| Plasma gun - standard | 24" | 1 | 4+ | 7 | -2 | 1 | RAPID FIRE 1 |
| Plasma gun - supercharge | 24" | 1 | 4+ | 8 | -3 | 2 | HAZARDOUS RAPID FIRE 1 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Burning hands | 1 | 2+ | 6 | -2 | 3 | DEVASTATING WOUNDS |
| Close combat weapon | 2 | 3+ | 3 | 0 | 1 | - |
| Death Cult blades | 4 | 2+ | 4 | -2 | 1 | PRECISION |
| Sanctifier melee weapon | 3 | 3+ | 3 | 0 | 1 | - |

Wargear options:
• 1 Missionary model can have its 1 plasma gun replaced with 1 meltagun.
• 1 Missionary model equipped with 1 plasma gun can be equipped with 1 holy fire (this model’s plasma gun cannot be replaced).
• 1 Sanctifier model can have its 1 Sanctifier melee weapon replaced with 1 Ministorum hand flamer and 1 close combat weapon.
• 1 Sanctifier model can have its 1 Sanctifier melee weapon replaced with 1 close combat weapon and 1 simulacrum imperialis.

Core abilities: Scouts 6"
Army rules: Acts of Faith
Abilities:
Attached Unit: If a MINISTORUM PRIEST from your army with the Leader ability can be attached to a BATTLE SISTERS SQUAD, it can be attached to this unit instead. If a MINISTORUM PRIEST from your army is attached to this unit during the Declare Battle Formations step, that model gains the Scouts 6" ability.
Ministorum Sermon: While this unit contains a MINISTORUM PRIEST, melee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability.
Cherub: Once per battle, after this unit has performed an Act of Faith, you gain 1 Miracle dice.
Designer’s Note: Place a Cherub token next to the unit, removing it once this ability has been used.
Salvationist Medikit: In your Command phase, if the bearer is on the battlefield, you can return up to D3 destroyed models (excluding CHARACTER models) to this unit.
Simulacrum Imperialis: At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result.
Unit composition: 1 Miraculist model; 1 Salvationist model; 1 Death Cult Assassin model; 2 Missionary models; 4 Sanctifier models. Every Miraculist: 1 Holy fire; 1 Burning hands. Every Salvationist: 1 Close combat weapon. Every Death Cult Assassin: 1 Death Cult blades. Every Missionary: 1 Plasma gun; 1 Sanctifier melee weapon. Every Sanctifier: 1 Ministorum hand flamer; 1 Sanctifier melee weapon.
Points: 9 models: 110 pts

### Seraphim Squad
Source: Codex · Keywords: INFANTRY; JUMP PACK; FLY; GRENADES; IMPERIUM; SERAPHIM SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Seraphim Superior | 12" | 3 | 3+ | 1 | 7+ | 1 |
| Seraphim | 12" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Inferno pistol | 6" | 1 | 3+ | 8 | -4 | D3 | MELTA 2 PISTOL |
| Ministorum hand flamer | 12" | D6 | - | 4 | 0 | 1 | IGNORES COVER PISTOL TORRENT |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Chainsword | 4 | 3+ | 3 | 0 | 1 | - |
| Close combat weapon | 2 | 3+ | 3 | 0 | 1 | - |
| Power weapon | 3 | 3+ | 4 | -2 | 1 | - |

Wargear options:
• For every 5 models in the unit, up to 2 Seraphim can each have their 2 bolt pistols replaced with one of the following: 2 inferno pistols; 2 Ministorum hand flamers
• The Seraphim Superior’s 2 bolt pistols can be replaced with one of the following: 1 bolt pistol and 1 chainsword; 1 bolt pistol and 1 plasma pistol; 1 bolt pistol and 1 power weapon; 1 plasma pistol and 1 chainsword; 1 plasma pistol and 1 power weapon

Core abilities: Deep Strike
Army rules: Acts of Faith
Abilities:
Angelic Ascent: In your Shooting phase, after this unit has shot, if it is not within Engagement Range of any enemy units, it can make a Normal move of up to 6". If it does, until the end of the turn, this unit is not eligible to declare a charge.
Unit composition: 1 Seraphim Superior model; 4-9 Seraphim models. Every model: 2 Bolt pistol; 1 Close combat weapon.
Points (1st–2nd units): 5 models: 75 pts · 10 models: 150 pts · Points (3rd+ unit): 5 models: 85 pts · 10 models: 160 pts

### Sisters Novitiate Squad
Source: Codex · Keywords: INFANTRY; GRENADES; IMPERIUM; SISTERS NOVITIATE SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Novitiate Superior | 6" | 3 | 3+ | 1 | 7+ | 2 |
| Sister Novitiate | 6" | 3 | 3+ | 1 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Autopistol | 12" | 1 | 3+ | 3 | 0 | 1 | PISTOL |
| Autogun | 24" | 1 | 3+ | 3 | 0 | 1 | RAPID FIRE 1 |
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Boltgun | 24" | 1 | 3+ | 4 | 0 | 1 | RAPID FIRE 1 |
| Ministorum flamer | 12" | D6 | - | 5 | 0 | 1 | IGNORES COVER TORRENT |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Close combat weapon | 1 | 4+ | 3 | 0 | 1 | - |
| Novitiate melee weapons | 2 | 4+ | 4 | 0 | 1 | - |
| Power weapon | 2 | 4+ | 4 | -2 | 1 | - |

Wargear options:
• The Novitiate Superior’s bolt pistol and boltgun can be replaced with one of the following: 1 bolt pistol and 1 power weapon; 1 plasma pistol and 1 power weapon
• 1 Sister Novitiate’s autogun can be replaced with 1 sacred banner.
• 1 Sister Novitiate’s autogun can be replaced with 1 simulacrum imperialis.
• Up to 2 Sisters Novitiate can each have their autogun replaced with 1 Ministorum flamer.
• Any number of Sisters Novitiate can each have their autogun and close combat weapon replaced with 1 Novitiate melee weapons.

Core abilities: Infiltrators
Army rules: Acts of Faith
Abilities:
Impetuous Fervour: Each time a model in this unit makes an attack, re-roll a Hit roll of 1. If the target of that attack is an enemy unit within range of an objective marker, you can re-roll the Hit roll instead.
Sacred Banner: You can re-roll Advance and Charge rolls made for the bearer’s unit.
Simulacrum Imperialis: At the end of your Command phase, for each objective marker you control that has one or more units from your army with this ability within range of it, roll one D6: on a 4+, you gain 1 Miracle dice showing a value equal to that result.
Unit composition: 1 Novitiate Superior model; 9 Sister Novitiate models. Every Novitiate Superior: 1 Bolt pistol; 1 Boltgun; 1 Close combat weapon. Every Sister Novitiate: 1 Autopistol; 1 Autogun; 1 Close combat weapon.
Points: 10 models: 90 pts

### Sororitas Rhino
Source: Codex · Keywords: VEHICLE; TRANSPORT; DEDICATED TRANSPORT; SMOKE; IMPERIUM; FRAME; SORORITAS RHINO; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Sororitas Rhino | 12" | 9 | 3+ | 10 | 7+ | 2 |

Invulnerable save: 6+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Hunter-killer missile | 48" | 1 | 2+ | 14 | -3 | D6 | - |
| Storm bolter | 24" | 2 | 3+ | 4 | 0 | 1 | RAPID FIRE 2 |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Armoured tracks | 3 | 4+ | 6 | 0 | 1 | - |

Wargear options:
• This model can be equipped with 1 hunter-killer missile.

Core abilities: Deadly Demise D3, Firing Deck 2
Army rules: Acts of Faith
Abilities:
Self Repair: At the start of your Command phase, this model regains 1 lost wound.
Transport: This model has a transport capacity of 12 ADEPTA SORORITAS INFANTRY models. It cannot transport JUMP PACK models or the TRIUMPH OF SAINT KATHERINE.
Unit composition: 1 Sororitas Rhino model, equipped with: 1 Storm bolter; 1 Armoured tracks.
Points (1st–3rd units): 1 model: 65 pts · Points (4th+ unit): 1 model: 75 pts

### Triumph Of Saint Katherine
Source: Codex · Keywords: INFANTRY; GRENADES; CHARACTER; EPIC HERO; IMPERIUM; TRIUMPH OF SAINT KATHERINE; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Triumph Of Saint Katherine | 6" | 3 | 3+ | 18 | 6+ | 6 |

Invulnerable save: 4+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistols | 12" | 6 | 2+ | 4 | 0 | 1 | PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Relic weapons | 18 | 2+ | 5 | -2 | 1 | - |

Core abilities: Leader
Army rules: Acts of Faith
Abilities:
The Fiery Heart (Aura): While a friendly ADEPTA SORORITAS unit is within 6" of this model, add 2" to that unit's Move characteristic and add 1 to Advance and Charge rolls made for that unit.
Censer of the Sacred Rose (Aura): While a friendly ADEPTA SORORITAS unit is within 6" of this model, you can re-roll Battle-shock tests taken for that unit.
Simulacrum of the Ebon Chalice (Aura): While a friendly ADEPTA SORORITAS unit is within 6" of this model, that unit can perform up to two Acts of Faith per phase, instead of only one.
Simulacrum of the Argent Shroud (Aura): While a friendly ADEPTA SORORITAS unit is within 6" of this model, each time a model in that unit makes a ranged attack, re-roll a Wound roll of 1.
Icon of the Valorous Heart (Aura): While a friendly ADEPTA SORORITAS unit is within 6" of this model, models in that unit have the Feel No Pain 6+ ability.
Petals of the Bloody Rose (Aura): While a friendly ADEPTA SORORITAS unit is within 6" of this model, improve the Armour Penetration characteristic of melee weapons equipped by models in that unit by 1.
Relics of the Matriarchs: At the start of the battle round, select up to two of the abilities in the Relics of the Matriarchs section (see left). Until the start of the next battle round, this model has those abilities.
Solemn Procession: Each time you gain 1 Miracle dice at the start of your turn, if this model is on the battlefield, do not roll one D6 to determine the value of that Miracle dice; it has a value of 6.
Damaged (1-6 wounds remaining): While this model has 1-6 wounds remaining, the Attacks characteristics of all of its weapons are halved, and you can only select one ability when using its Relics of the Matriarchs ability, instead of up to two.
Unit composition: 1 Triumph Of Saint Katherine model, equipped with: 1 Bolt pistols; 1 Relic weapons.
Points: 1 model: 245 pts
Leads: BATTLE SISTERS SQUAD, CRUSADERS

### Zephyrim Squad
Source: Codex · Keywords: INFANTRY; JUMP PACK; FLY; GRENADES; IMPERIUM; ZEPHYRIM SQUAD; ADEPTA SORORITAS

| Model | M | T | Sv | W | Ld | OC |
|---|---|---|---|---|---|---|
| Zephyrim Superior | 12" | 3 | 3+ | 1 | 7+ | 1 |
| Zephyrim | 12" | 3 | 3+ | 1 | 7+ | 1 |

Invulnerable save: 5+

Ranged:

| Weapon | Range | A | BS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|---|
| Bolt pistol | 12" | 1 | 3+ | 4 | 0 | 1 | PISTOL |
| Plasma pistol - standard | 12" | 1 | 3+ | 7 | -2 | 1 | PISTOL |
| Plasma pistol - supercharge | 12" | 1 | 3+ | 8 | -3 | 2 | HAZARDOUS PISTOL |

Melee:

| Weapon | A | WS | S | AP | D | Keywords |
|---|---|---|---|---|---|---|
| Power weapon | 3 | 3+ | 4 | -2 | 1 | - |

Wargear options:
• The Zephyrim Superior can be equipped with 1 sacred banner.
• The Zephyrim Superior’s bolt pistol can be replaced with 1 plasma pistol.

Core abilities: Deep Strike
Army rules: Acts of Faith
Abilities:
Embodied Prophecy: Each time this unit is selected to fight, select one of the following abilities to apply to melee weapons equipped by models in this unit until the end of the phase:
• [SUSTAINED HITS 1]
• [LETHAL HITS]
If this unit made a Charge move this turn, until the end of the phase, select both abilities above to apply to melee weapons equipped by models in this unit instead.
Sacred Banner: You can re-roll Advance and Charge rolls made for the bearer’s unit.
Unit composition: 1 Zephyrim Superior model; 4-9 Zephyrim models. Every model: 1 Bolt pistol; 1 Power weapon.
Points (1st–2nd units): 5 models: 75 pts · 10 models: 150 pts · Points (3rd+ unit): 5 models: 85 pts · 10 models: 160 pts

