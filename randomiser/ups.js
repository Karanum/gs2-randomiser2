const fs = require("fs");
const packer = require("./../modules/packer.js");

function applyPatch(rom, patchData) {
    var target = rom;
    var data = patchData.slice(4, patchData.length - 12);
    var sourceLen, targetLen, offset, patchOffset = 0;
    [patchOffset, sourceLen] = readOffset(data, patchOffset);
    [patchOffset, targetLen] = readOffset(data, patchOffset);

    if (targetLen > sourceLen) {
        target = new Uint8Array(targetLen);
        target.set(rom);
    }

    var byteOffset = 0;
    while (patchOffset < data.length) {
        [patchOffset, offset] = readOffset(data, patchOffset);
        byteOffset += offset;
        while (true) {
            var byte = data[patchOffset++];
            target[byteOffset++] ^= byte;
            if (byte == 0) break;
        }
    }

    return target;
}

function createPatch(vanilla, rom) {
    return packer.generatePatch(vanilla, rom);
}

function readOffset(data, patchOffset) {
    var offset = 0;
    var shift = 1;
    while (true) {
        var byte = data[patchOffset++];
        offset += (byte & 0x7F) * shift;
        if ((byte & 0x80) > 0) break;

        shift = (shift << 7);
        offset += shift;
    }
    return [patchOffset, offset];
}

module.exports = {applyPatch, createPatch};