const textutil = require('./../game_logic/textutil.js');

/**
 * Applies this patch to the map code
 * @param {MapCodeData} mapCode The map code data instance
 * @param {string[]} text The text data instance
 */
function apply(mapCode, text) {
    mapCode[1655][0] = true;

    // Make Sunshine always return to bed
    mapCode[1655][1][0x654] = 0x65;
    mapCode[1655][1][0x655] = 0xE0;

    // Change text lines
    textutil.writeLine(text, 0x1305, "Consider it done.\x03Just talk to my wife.\x02");
    textutil.writeLine(text, 0x1306, "Consider it done.\x03Just talk to my wife.\x02");
    textutil.writeLine(text, 0x1308, "You ain't got anything\x03for me to work with!\x02");
    textutil.writeLine(text, 0x1311, "It's \x16 coins for\x03this \x14\x01.\x03Do you want it?\x1E");
}

module.exports = {apply};