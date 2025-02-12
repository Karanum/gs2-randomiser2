/**
 * This patch makes it so Djinni battles are scaled based on the amount of Djinn owned.
 * Ported over from the UPS files of the original GS2 randomiser.
 */

const { writeArray } = require('../../../util/binary.js');
const textutil = require('../../game_logic/textutil.js');

const prefixes = ['Basic', 'Basic', 'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Elite', 'Elite', 'Elite'];

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
]

function apply(rom, enemyData, text) {
    // Jump to custom Djinni encounter function
    writeArray(rom, 0xD2BC2, [0x5E, 0xF0, 0x9D, 0xFE]);

    // Custom Djinni encounter function
    writeArray(rom, 0x131900, [0x20, 0xB5, 0x30, 0x25, 0x0, 0x21, 0x28, 0x1C, 0xE5, 0xF6, 0xEC, 0xF9, 0x9, 0x18, 0x1, 0x35, 0x80, 0x2D, 0xF8, 0xDD, 0x89, 
        0x8, 0xA, 0x29, 0x0, 0xDD, 0xA, 0x21, 0x4, 0x4A, 0x30, 0x1C, 0x14, 0x28, 0x2, 0xDB, 0xB, 0x32, 0x14, 0x38, 0xFA, 0xE7, 0x50, 0x5C, 0x20, 0xBD, 
        0x0, 0x0, 0x34, 0x19, 0x13, 0x8, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0x9, 0xA, 0xB, 0xD, 0xE, 0xF, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 
        0x17, 0x19, 0x1A, 0x1B, 0x1C, 0x1D, 0x1E, 0x1F, 0x20, 0x21, 0x22, 0x23, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D, 0x2E, 0x2F]);

    // Change Djinn names to reflect their difficulty
    for (let i = 0; i < 11; ++i) {
        textutil.writeLine(text, 1072 + i, `${prefixes[i]} Venus`);
        textutil.writeLine(text, 1087 + i, `${prefixes[i]} Mercury`);
        textutil.writeLine(text, 1101 + i, `${prefixes[i]} Mars`);
        textutil.writeLine(text, 1116 + i, `${prefixes[i]} Jupiter`);
    }

    // Update Djinn enemy entries
    updateDjinnSet(enemyData["Venus Djinni"], 3, 1.1, 0.98, 1, 1.25, 0.85, 1, venusMovesets);
    updateDjinnSet(enemyData["Mercury Djinni"], 4, 1, 1.4, 0.96, 1.05, 1, 1.05, mercuryMovesets);
    updateDjinnSet(enemyData["Mars Djinni"], 3, 1.02, 1.3, 1.02, 1, 0.95, 1, marsMovesets);
    updateDjinnSet(enemyData["Jupiter Djinni"], 4, 0.9, 1.1, 1, 0.98, 1.25, 0.9, jupiterMovesets);
}

function updateDjinnSet(enemySet, offset, hpMod, ppMod, atkMod, defMod, agiMod, lukMod, attacks) {
    for (let i = 0; i < 11; ++i) {
        let enemy = enemySet[offset + i];
        enemy.level = 8 + Math.round(2.8 * i);
        enemy.hp = Math.round(hpMod * (225 + 67.5 * i));
        enemy.pp = Math.round(ppMod * (25 + 7.5 * i));
        enemy.attack = Math.round(atkMod * (30 + 27 * i));
        enemy.defense = Math.round(defMod * (5 + 8.5 * i));
        enemy.agility = Math.round(agiMod * (25 + 24 * i));
        enemy.luck = Math.round(lukMod * (5 + 2.5 * i));
        enemy.exp = 50 + 120 * i;
        enemy.coins = 100 + 65 * i;
        enemy.attacks = attacks[i];
    }
}

module.exports = {apply};