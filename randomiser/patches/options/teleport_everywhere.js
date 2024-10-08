/**
 * This patch allows for using Teleport on most locations instead of only towns.
 */
const { writeArray } = require('../../../util/binary.js');

function apply(rom) {
    // Change function that sets ship position on sanctum warp
    writeArray(rom, 0xCA394, [0xA, 0x4C, 0xB, 0x48, 0x7, 0x68, 0x0, 0x23, 0x1, 0x3B, 0x1B, 0xC, 0x20, 0x88, 0xB8, 0x42, 0x3, 0xD0, 0x6, 0x34, 
        0x98, 0x42, 0xF9, 0xD1, 0x5, 0xE0, 0x60, 0x88, 0x0, 0x4, 0x8, 0x60, 0xA0, 0x88, 0x0, 0x4, 0x48, 0x60, 0x8, 0xBC, 0x98, 0x46, 0xE0,
        0xBD, 0x6A, 0x40, 0xF, 0x8, 0x12, 0xA0, 0x2, 0x2]);

    // Change world map display function
    writeArray(rom, 0xED2D8, [0x0, 0x26]);

    // Change world map location entries to allow teleportation
    [0x155, 0x17D, 0x21D, 0x231, 0x26D, 0x295, 0x2D1, 0x2E5, 0x2F9, 0x30D, 0x321, 0x349, 0x371, 0x399, 0x3C1, 0x425, 0x439, 0x44D,
        0x461, 0x475, 0x489, 0x4B1, 0x4C5, 0x53D, 0x551, 0x58D, 0x5A1, 0x5B5, 0x5C9, 0x5DD].forEach((entry) => {
            rom[0xF1000 + entry] |= 0x10;
        });

    // Change world map location entries to have a map marker in the first place
    [0x4C5, 0x53D, 0x551, 0x5A1, 0x5B5].forEach((entry) => {
        rom[0xF1000 + entry] |= 0x1;
    });

    // Fix Shaman Village Cave world map location entries
    rom[0xF14D0] = 0xF0;
    rom[0xF14D8] = 0x38;
    rom[0xF14E4] = 0xF0;
}

module.exports = {apply};