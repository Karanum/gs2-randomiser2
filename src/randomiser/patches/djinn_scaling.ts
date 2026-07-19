import type { RomData } from "../rom";
import type { EnemyManager } from "../data/enemies/manager";
import { EnemyID } from "../data/enemies/enums";
import { getAssemblyScript } from "../script_util";

const patchDjinnScalingEncounter = getAssemblyScript('djinn_scaling_encounter');

const venusMovesets = [
    [3, 3, 12, 12, 164, 498, 1, 2],
    [4, 15, 12, 12, 164, 498, 1, 2],
    [4, 15, 6, 9, 164, 498, 1, 2],
    [192, 13, 6, 9, 179, 498, 1, 2],
    [192, 13, 16, 9, 5, 498, 1, 2],
    [192, 13, 16, 7, 5, 498, 1, 2],
    [192, 10, 180, 7, 165, 498, 1, 2],
    [198, 10, 180, 14, 165, 498, 1, 2],
    [198, 10, 180, 14, 165, 381, 1, 2],
    [198, 10, 180, 14, 165, 381, 1, 2],
    [198, 10, 17, 14, 165, 382, 1, 2]
];

const mercuryMovesets = [
    [24, 24, 33, 33, 36, 498, 93, 1],
    [24, 27, 33, 33, 36, 498, 93, 1],
    [25, 27, 33, 30, 36, 498, 93, 1],
    [25, 27, 34, 30, 37, 498, 93, 1],
    [193, 28, 34, 30, 37, 498, 94, 1],
    [193, 28, 34, 31, 37, 498, 94, 1],
    [193, 28, 26, 31, 37, 498, 94, 1],
    [200, 28, 26, 31, 26, 498, 94, 1],
    [200, 28, 26, 31, 35, 389, 94, 1],
    [200, 31, 26, 31, 35, 389, 95, 1],
    [200, 38, 26, 29, 35, 390, 95, 1],
]

const marsMovesets = [
    [45, 54, 54, 48, 48, 498, 1, 1],
    [46, 54, 57, 48, 167, 498, 1, 1],
    [46, 63, 57, 632, 167, 498, 1, 1],
    [196, 55, 58, 49, 168, 498, 1, 1],
    [196, 64, 58, 49, 168, 498, 1, 1],
    [196, 64, 58, 47, 52, 498, 1, 1],
    [202, 61, 56, 633, 52, 498, 1, 1],
    [202, 61, 56, 633, 169, 498, 1, 1],
    [202, 61, 56, 50, 169, 397, 1, 1],
    [202, 61, 59, 50, 169, 397, 397, 1],
    [202, 61, 59, 50, 169, 398, 397, 1],
];

const jupiterMovesets = [
    [66, 66, 78, 78, 75, 498, 110, 1],
    [66, 69, 78, 78, 75, 498, 110, 1],
    [67, 69, 78, 72, 75, 498, 110, 1],
    [67, 70, 72, 72, 76, 498, 110, 1],
    [195, 70, 72, 72, 76, 498, 110, 1],
    [195, 70, 72, 79, 76, 498, 110, 1],
    [195, 70, 73, 79, 68, 498, 110, 1],
    [201, 70, 73, 79, 68, 498, 110, 1],
    [201, 77, 73, 79, 68, 407, 110, 1],
    [201, 77, 73, 68, 68, 407, 110, 1],
    [201, 77, 73, 68, 71, 408, 110, 1],
];

const venusModifiers = [1.1, 0.98, 1, 1.25, 0.85, 1];
const mercuryModifiers = [1, 1.4, 0.96, 1.05, 1, 1.05];
const marsModifiers = [1.02, 1.3, 1.02, 1, 0.95, 1];
const jupiterModifiers = [0.9, 1.1, 1, 0.98, 1.25, 0.9];


export function applyDjinnScaling(rom : RomData)
{
    // Custom Djinni encounter function
    rom.writeBlock(0x131920, patchDjinnScalingEncounter);
    rom.writeLinkedJump(0xD2BC2, 0x08131920);

    // Update Djinni enemy entries
    updateEnemySet(rom.enemies, EnemyID.VENUS_DJINNI_SCALED, venusModifiers, venusMovesets, "Venus");
    updateEnemySet(rom.enemies, EnemyID.MERCURY_DJINNI_SCALED, mercuryModifiers, mercuryMovesets, "Mercury");
    updateEnemySet(rom.enemies, EnemyID.MARS_DJINNI_SCALED, marsModifiers, marsMovesets, "Mars");
    updateEnemySet(rom.enemies, EnemyID.JUPITER_DJINNI_SCALED, jupiterModifiers, jupiterMovesets, "Jupiter");
}

function updateEnemySet(enemies : EnemyManager, id : number, modifiers : number[], attacks : number[][], nameSuffix : string)
{
    for (let i = 0; i < 11; ++i) {
        const enemy = enemies.get(id + i)!;
        enemy.name = `Lv. ${i + 1} ${nameSuffix}`;
        enemy.stats.level = 8 + Math.round(2.8 * i);
        enemy.stats.hp = Math.round(modifiers[0] * (225 + 67.5 * i));
        enemy.stats.pp = Math.round(modifiers[1] * (25 + 7.5 * i));
        enemy.stats.attack = Math.round(modifiers[2] * (30 + 27 * i));
        enemy.stats.defense = Math.round(modifiers[3] * (5 + 8.5 * i));
        enemy.stats.agility = Math.round(modifiers[4] * (25 + 24 * i));
        enemy.stats.luck = Math.round(modifiers[5] * (5 + 2.5 * i));
        enemy.rewards.exp = 50 + 120 * i;
        enemy.rewards.coins = 100 + 65 * i;
        enemy.actions.attacks = [...attacks[i]];
    }
}