const { writeArray, write16b, write32b } = require('./binary.js');

/**
 * Inserts a new NPC to the map code tables
 * @param {byte[]} mapCode The binary map code data
 * @param {number} npcOffset The address to insert the NPC data into (24 bytes)
 * @param {number} eventOffset The address to insert the talk event data into (24 bytes)
 * @param {number} eventId The ID this NPC will be assigned, starts at 0x8 and increments for each non-party NPC in the table
 * @param {number} sprite Sprite ID
 * @param {number} flag The conditional flag for this NPC, `0xFFFF` for no condition, `0x1000 | flag` for inverted condition
 * @param {number} idleScript The idle script for this NPC, either a low number for presets, or high numbers for custom behaviour
 * @param {number} x X coordinate
 * @param {number} z Z coordinate
 * @param {number} y Y coordinate
 * @param {number} direction Facing direction, 0 = east, 4 = south, 8 = west, 12 = north
 * @param {number} flags Additional behaviour flags
 * @param {number} dialogue Text index for the talk event, +1 for the Mind Read event
 */
function setBasicNpc(mapCode, npcOffset, eventOffset, eventId, sprite, flag, idleScript, x, z, y, direction, flags, dialogue) {
    write16b(mapCode, npcOffset, sprite);
    write16b(mapCode, npcOffset + 2, flag);
    write32b(mapCode, npcOffset + 4, idleScript);
    write16b(mapCode, npcOffset + 8, 0);
    write16b(mapCode, npcOffset + 10, x);
    write16b(mapCode, npcOffset + 12, 0);
    write16b(mapCode, npcOffset + 14, z);
    write16b(mapCode, npcOffset + 16, 0);
    write16b(mapCode, npcOffset + 18, y);
    mapCode[npcOffset + 20] = 0;
    mapCode[npcOffset + 21] = (direction & 0xF) << 4;
    write16b(mapCode, npcOffset + 22, flags);

    write32b(mapCode, eventOffset, 0);
    write16b(mapCode, eventOffset + 4, eventId);
    write16b(mapCode, eventOffset + 6, flag);
    write32b(mapCode, eventOffset + 8, dialogue);

    writeArray(mapCode, eventOffset + 12, [0x15, 0x8D, 0x0, 0x0]);
    write16b(mapCode, eventOffset + 16, eventId);
    write16b(mapCode, eventOffset + 18, flag);
    write32b(mapCode, eventOffset + 20, dialogue + 1);
}

function setTalkObject(mapCode, npcOffset, eventOffset, eventId, sprite, flag, x, z, y, direction, flags, talkScript) {
    write16b(mapCode, npcOffset, sprite);
    write16b(mapCode, npcOffset + 2, flag);
    write32b(mapCode, npcOffset + 4, 0x1);
    write16b(mapCode, npcOffset + 8, 0);
    write16b(mapCode, npcOffset + 10, x);
    write16b(mapCode, npcOffset + 12, 0);
    write16b(mapCode, npcOffset + 14, z);
    write16b(mapCode, npcOffset + 16, 0);
    write16b(mapCode, npcOffset + 18, y);
    mapCode[npcOffset + 20] = 0;
    mapCode[npcOffset + 21] = (direction & 0xF) << 4;
    write16b(mapCode, npcOffset + 22, flags);

    write32b(mapCode, eventOffset, 0);
    write16b(mapCode, eventOffset + 4, eventId);
    write16b(mapCode, eventOffset + 6, flag);
    write32b(mapCode, eventOffset + 8, talkScript);
}

module.exports = { setBasicNpc, setTalkObject };