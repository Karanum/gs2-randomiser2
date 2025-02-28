/*
* Data struct representing all "doors" (screen transitions/exits) in the game.
* To be used in combination with the door randomiser to change where exits lead in-game.
*/

const { read32b, write32b } = require("../../util/binary");

// List of map code IDs to skip because they will not contain any shuffled exits
const skipIds = [1612, 1613, 1614, 1615, 1673];

// Exit data container
let exitData = [];

// Internal function that returns the exit table pointer for a given map code block
function getExitTablePointer(mapCode, id) {
    // Daila maps have multiple exit tables so we just pick the one we want
    if (id == 1617) return 0x1068;
    if (id == 1618) return 0x11B8;

    let funcPointer = read32b(mapCode, 0x14) - 0x02008001;
    return read32b(mapCode, funcPointer + 4) - 0x02008000;
}

// Loads the exit data from the game and populates the data container
function initialise(mapCode) {
    for (let i = 1611; i <= 1713; ++i) {
        if (skipIds.includes(i)) continue;

        let pointer = getExitTablePointer(mapCode[i][1], i);
        let word = read32b(mapCode[i][1], pointer);
        let mapId = word;

        while (true) {
            pointer += 4;
            word = read32b(mapCode[i][1], pointer);
            if (word == 0x1FF) break;
            
            if ((word & 0xFFFFF000) == 0) {
                mapId = word;
                continue;
            }

            let exit = { mapCode: i, mapId, addr: pointer, exitId: (word >> 20) & 0xFF, destEntrance: (word >> 12) & 0xFF, destMap: word & 0xFFF };

            if ((word & 0x10000000) != 0) {
                pointer += 4;
                exit.condition = read32b(mapCode[i][1], pointer);
            }

            exitData.push(exit);
        }
    }
}

// Returns a deep copy of the data container
function clone() {
    return JSON.parse(JSON.stringify(exitData));
}

// Writes the contents of (a copy of) the data container back into the game
function writeToMapCode(instance, mapCode) {
    instance.forEach((exit) => {
        if (exit.vanillaDestMap == undefined) return;
        mapCode[exit.mapCode][0] = true;

        let entry = (exit.exitId << 20) + (exit.destEntrance << 12) + (exit.destMap);
        if (exit.condition) {
            entry += 0x10000000;
            write32b(mapCode[exit.mapCode][1], exit.addr + 4, exit.condition);
        }
        write32b(mapCode[exit.mapCode][1], exit.addr, entry);
    });
}

module.exports = {initialise, clone, writeToMapCode};