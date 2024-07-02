/**
 * This patch changes some Move pillar flags in the optional endgame dungeons
 * to make them persist between area changes. Why are they like that in the first place?
 */

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

/**
 * Applies this patch to the map code
 * @param {MapCodeData} mapCode The rom instance
 */
function apply(mapCode) {
    // Treasure Isle
    mapCode[1711][0] = true;

    // Water room move pillar (0x308 -> 0xC00)
    applyMapCode(mapCode[1711][1], 0x7DC, [0xC0, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1711][1], 0xDB2, [0xC0, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1711][1], 0x1822, [0x0, 0xC]);

    // Basement move pillar (0x30D -> 0xC01)
    applyMapCode(mapCode[1711][1], 0x844, [0x0, 0x1, 0x1]);
    applyMapCode(mapCode[1711][1], 0xECE, [0x0, 0x1, 0x1]);
    applyMapCode(mapCode[1711][1], 0x19DE, [0x1, 0xC]);

    
    // Yampi Desert Cave
    mapCode[1634][0] = true;

    // Entrance burst pillar (0x300 -> 0xC10)
    applyMapCode(mapCode[1634][1], 0xE18, [0xC1, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0xE32, [0xC1, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0x1476, [0xC1, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0x1D9A, [0x10, 0xC]);

    // Shortcut burst pillar (0x301 -> 0xC11)
    applyMapCode(mapCode[1634][1], 0xE40, [0xC1, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0xE5C, [0xC1, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0x1684, [0xC1, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0x1F3E, [0x11, 0xC]);

    // Final pre-boss move pillar (0x304 -> 0xC20)
    applyMapCode(mapCode[1634][1], 0x1010, [0xC2, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0x169C, [0xC2, 0x20, 0x0, 0x1]);
    applyMapCode(mapCode[1634][1], 0x1F62, [0x20, 0xC]);
    applyMapCode(mapCode[1634][1], 0x1F6E, [0x20, 0xC]);

    // Djinni room move pillar (0x305 -> 0xC03)
    applyMapCode(mapCode[1634][1], 0xFCC, [0x0, 0x1, 0x3]);
    applyMapCode(mapCode[1634][1], 0x16EC, [0x0, 0x1, 0x3]);
    applyMapCode(mapCode[1634][1], 0x1F4A, [0x3, 0xC]);
    applyMapCode(mapCode[1634][1], 0x1F56, [0x3, 0xC]);
}

module.exports = {apply};