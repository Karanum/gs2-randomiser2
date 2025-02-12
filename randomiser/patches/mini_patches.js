const { writeArray } = require("../../util/binary");

/**
 * Applies Game Ticket removal patch to the ROM
 * @param {Uint8Array} target 
 */
function applyGameTicketPatch(target) {
    target[0xAFED4] = 0x70;
    target[0xAFED5] = 0x47;
}

/**
 * Applies ship overworld speed patch to the ROM
 * @param {Uint8Array} target 
 */
function applyShipSpeedPatch(target) {
    target[0x285A4] = 0xF0;
}

/**
 * Applies revive cost reduction to the ROM
 * @param {Uint8Array} target 
 */
function applyCheapRevivePatch(target) {
    writeArray(target, 0x10A874, [0x50, 0x00, 0xC0, 0x46, 0xC0, 0x46]);
}

/**
 * Applies fixed revive cost to the ROM
 * @param {Uint8Array} target 
 */
function applyFixedRevivePatch(target) {
    writeArray(target, 0x10A874, [0x64, 0x20, 0xC0, 0x46, 0xC0, 0x46]);
}

/**
 * Applies encounter rate halving to the ROM
 * @param {Uint8Array} target 
 */
function applyHalvedRatePatch(target) {
    target[0xCA0B8] = 0x78;
}

module.exports = {applyGameTicketPatch, applyShipSpeedPatch, applyCheapRevivePatch, applyFixedRevivePatch, applyHalvedRatePatch};