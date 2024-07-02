const textutil = require('../../game_logic/textutil.js');

/**
 * Applies this patch to the map code
 * @param {MapCodeData} mapCode The map code data instance
 * @param {string[]} text The text data instance
 */
function apply(mapCode, text) {
    mapCode[1649][0] = true;

    // ASM for unsetting the puzzle timer and adding a custom handler
    applyMapCode(mapCode[1649][1], 0x3388, [0x0, 0xBD]);
    applyMapCode(mapCode[1649][1], 0x377E, [0x0, 0x1C, 0x17, 0x20, 0x15, 0x21, 0x98, 0x22, 0x9, 0x5, 0x12, 0x4, 0x1, 0xF0, 0xC3, 0xFF]);
    applyMapCode(mapCode[1649][1], 0x382A, [0xE, 0xE0]);
    applyMapCode(mapCode[1649][1], 0x525E, [0x0, 0xBD, 0x0, 0xB5, 0xA0, 0x20, 0x40, 0x0, 0x0, 0xF0, 0x75, 0xFA, 0x17, 0x20, 0x0, 0x21, 
        0x0, 0xF0, 0x75, 0xFA, 0x4, 0x20, 0x1, 0x21, 0x0, 0xF0, 0x25, 0xFA, 0x0, 0x28, 0x1, 0xD1, 0xFB, 0xF7, 0x9F, 0xFE]);

    // Overwriting the timer trigger with a talk event for Kraden and setting a text line
    applyMapCode(mapCode[1649][1], 0x6DF4, [0x0, 0x0, 0x0, 0x0, 0x17, 0x0, 0xFD, 0x8, 0x61, 0xD2, 0x0, 0x2]);
    textutil.writeLine(text, 0x140, "Are you finished?\x1E");
}

/**
 * Writes an array of bytes into the map code, overwriting existing data
 * @param {byte[]} mapCode The binary map code data
 * @param {number} offset The position to start writing at
 * @param {byte[]} data The data to write
 */
function applyMapCode(mapCode, offset, data) {
    for (var i = 0; i < data.length; ++i) {
        mapCode[offset++] = data[i];
    }
}

module.exports = {apply};