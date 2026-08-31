import { AbilityEffect } from "../data/abilities/enums";
import type { AbilityManager } from "../data/abilities/manager";
import { EnemyID } from "../data/enemies/enums";
import type { EnemyManager } from "../data/enemies/manager";
import type { Enemy } from "../data/enemies/model";
import type { RomData } from "../rom";

/**
 * Decreases the stats of bosses and some of their abilities
 * to make them more feasible at lower levels and/or Djinn counts.
 * @param rom The `RomData` instance to apply this patch to
 */
export function applyEasierBosses(rom : RomData)
{
    updateEnemyStats(rom.enemies);
    updateAbilityStats(rom.abilities);
}

/**
 * Decreases boss stats.
 * @param enemies The current `EnemyManager` instance
 */
function updateEnemyStats(enemies : EnemyManager) 
{
    const briggs = enemies.get(EnemyID.BRIGGS)!;
    briggs.stats.attack = 119;

    const seaFighter = enemies.get(EnemyID.SEA_FIGHTER)!;
    seaFighter.stats.attack = 104;

    const aquaHydra = enemies.get(EnemyID.AQUA_HYDRA)!;
    aquaHydra.stats.hp = 2276;
    aquaHydra.stats.attack = 163;

    const serpent3 = enemies.get(EnemyID.SERPENT_3_LIGHT)!;
    const serpent4 = enemies.get(EnemyID.SERPENT_4_LIGHT)!;
    serpent3.stats.hp = 3136;
    serpent3.stats.attack = 229;
    serpent3.stats.hpRegen = 3;
    serpent4.stats.hp = 2736;
    serpent4.stats.attack = 219;

    const avimander = enemies.get(EnemyID.AVIMANDER)!;
    avimander.stats.hp = 3042;
    avimander.actions.attacks = [421, 673, 1, 674, 55, 106, 108, 1];

    const poseidon1 = enemies.get(EnemyID.POSEIDON_ACTION_1)!;
    const poseidon2 = enemies.get(EnemyID.POSEIDON_ACTION_2)!;
    poseidon1.stats.hp = 3505;
    poseidon1.stats.attack = 262;
    poseidon1.stats.agility = 175;
    poseidon2.stats.hp = 3505;
    poseidon2.stats.attack = 262;
    poseidon2.stats.agility = 175;
    poseidon2.actions.attacks[4] = 28;

    for (let i = 0; i < 3; ++i) {
        const moapa = enemies.get(EnemyID.MOAPA + i)!;
        moapa.stats.hp = 2792;
        moapa.stats.attack = 304;
    }
    for (let i = 0; i < 2; ++i) {
        const knight = enemies.get(EnemyID.KNIGHT + i)!;
        knight.stats.hp = 1454;
        knight.stats.attack = 281;
        knight.actions.items[0][0] = 241;
    }

    const flameDragonAgatio = enemies.get(EnemyID.FLAME_DRAGON_AGATIO)!;
    const flameDragonKarst = enemies.get(EnemyID.FLAME_DRAGON_KARST)!;
    flameDragonAgatio.stats.hp = 3924;
    flameDragonAgatio.stats.attack = 360;
    flameDragonKarst.stats.hp = 3648;
    flameDragonKarst.stats.attack = 349;
    flameDragonKarst.actions.attacks = [648, 55, 686, 58, 88, 127, 687, 1];

    const doomDragon : Enemy[] = [];
    for (let i = 0; i < 9; ++i) {
        const enemy = enemies.get(EnemyID.DOOM_DRAGON + i)!
        enemy.stats.defense = 100;
        doomDragon.push(enemy);
    }
    for (let i = 0; i < 4; ++i) {   // Phase 1
        doomDragon[i].stats.hp = 3500;
        doomDragon[i].stats.attack = 450;
    }
    for (let i = 4; i < 7; ++i) {   // Phase 2
        doomDragon[i].stats.hp = 3200;
        doomDragon[i].stats.attack = 445;
    }
    for (let i = 7; i < 9; ++i) {   // Phase 3
        doomDragon[i].stats.hp = 3000;
        doomDragon[i].stats.attack = 440;
    }
    doomDragon[6].actions.attacks[3] = 49;
    doomDragon[7].actions.attacks[7] = 16;
    doomDragon[8].actions.attacks = [724, 724, 724, 724, 724, 7, 7, 16];

    const starMagician = enemies.get(EnemyID.STAR_MAGICIAN)!;
    starMagician.stats.hp = 5486;
    starMagician.stats.attack = 400;

    const refreshBall = enemies.get(EnemyID.REFRESH_BALL)!;
    refreshBall.stats.hp = 180;
    refreshBall.actions.attacks = [94, 94, 94, 94, 94, 99, 100, 1];
    enemies.get(EnemyID.ANGER_BALL)!.stats.hp = 230;
    enemies.get(EnemyID.GUARDIAN_BALL)!.stats.hp = 230;
    enemies.get(EnemyID.THUNDER_BALL)!.actions.attacks = [67, 70, 72, 67, 70, 72, 1, 1];
    
    const sentinel = enemies.get(EnemyID.SENTINEL)!;
    sentinel.stats.hp = 6836;
    sentinel.stats.attack = 508;
    sentinel.stats.defense = 167;
    sentinel.stats.hpRegen = 0;

    const valukar = enemies.get(EnemyID.VALUKAR)!;
    valukar.stats.hp = 8960;
    valukar.stats.attack = 450;
    valukar.actions.attacks[6] = 1;

    for (let i = 0; i < 3; ++i) {
        const dullahan = enemies.get(EnemyID.DULLAHAN + i)!;
        dullahan.stats.hp = 12000;
        dullahan.stats.attack = 576;
        dullahan.stats.defense = 219;
        if (i == 1) dullahan.actions.attacks[2] = 720;
    }
}

/**
 * Decreases boss ability stats.
 * @param abilities The current `AbilityManager` instance
 */
function updateAbilityStats(abilities : AbilityManager)
{
    abilities.get(644)!.power = 110;
    abilities.get(645)!.power = 130;
    abilities.get(647)!.power = 180;
    abilities.get(666)!.power = 20;
    abilities.get(669)!.power = 75;
    abilities.get(673)!.power = 25;
    abilities.get(675)!.power = 30;
    abilities.get(679)!.power = 14;
    abilities.get(680)!.power = 13;
    abilities.get(681)!.power = 50;
    abilities.get(682)!.power = 200;
    abilities.get(683)!.power = 90;
    abilities.get(715)!.power = 14;
    abilities.get(717)!.power = 24;
    abilities.get(724)!.power = 100;
    abilities.get(727)!.power = 240;

    abilities.get(672)!.addedEffect = AbilityEffect.NONE;

    const wateryGrave = abilities.get(676)!;
    wateryGrave.power = 100;
    wateryGrave.addedEffect = AbilityEffect.NONE;
}