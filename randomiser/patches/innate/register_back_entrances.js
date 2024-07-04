/**
 * This patch allows certain world map locations to be registered from either entrance.
 * Normally areas such as Dehkan, Yampi, etc. would only be registered from the front entrance, 
 * which causes user friction when trying to Teleport back to these places and them not being unlocked.
 */

const { writeArray } = require('../../../util/binary.js');

/**
 * Applies this patch to the map code
 * @param {Uint8Array} rom The rom instance
 */
function apply(rom) {
    // Fix the Dehkan Plateau back exit
    rom[0xF1190] = 0x6;
    writeArray(rom, 0xF119C, [0x24, 0x0, 0xFF, 0xFF]);

    // Fix the Yampi Desert exits
    rom[0xF123C] = 0x4B;
    rom[0xF1690] = 0x13;
    rom[0xF169C] = 0x4A;
}

module.exports = {apply};