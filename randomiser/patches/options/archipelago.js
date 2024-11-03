const { writeArray } = require('../../../util/binary.js');
const textutil = require('../../game_logic/textutil.js');

function apply(rom, settings) {
    // Add an icon mapping for the multiworld pseudo-item
    writeArray(rom, 0x0100311C + (settings['shuffle-characters'] ? 0x20 : 0x0), [0x0, 0xA, 0xC, 0x1]);
}

module.exports = {apply};