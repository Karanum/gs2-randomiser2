const fs = require('fs');
const decompr = require('../../modules/decompression.js');

var mapCodeData = {};
var preCompressed = {};

function read16b(data, pos) {
    return data[pos] + (data[pos + 1] << 8);
}

function read24b(data, pos) {
    return data[pos] + (data[pos + 1] << 8) + (data[pos + 2] << 16);
}

function write16b(data, pos, write) {
    data[pos] = write & 0xFF;
    data[pos + 1] = (write >> 8) & 0xFF;
}

function write32b(data, pos, write) {
    data[pos] = write & 0xFF;
    data[pos + 1] = (write >> 8) & 0xFF;
    data[pos + 2] = (write >> 16) & 0xFF;
    data[pos + 3] = (write >> 24) & 0xFF;
}

function convertBranchLinks(data, restore) {
    var i = 2;
    while (i < data.length) {
        var r12 = read16b(data, i);
        i += 2;
        if ((r12 & 0xF800) != 0xF800)
            continue;

        var r3 = read16b(data, i - 4);
        if ((r3 & 0xF800) != 0xF000)
            continue;

        r12 = (((r3 & 0x7FF) << 11) | (r12 & 0x7FF)) << 1;
        r12 += (i - 2) * (restore ? 1 : -1);

        write16b(data, i - 4, 0xF000 | ((r12 >> 12) & 0x7FF));
        write16b(data, i - 2, 0xF800 | (r12 >> 1));
    }
}

function initialise(rom) {
    if (!fs.existsSync('./map_code_cache/')) {
        fs.mkdirSync('./map_code_cache/');
    }

    for (var i = 1609; i < 1723; ++i) {
        var pointer = read24b(rom, 0x680000 + 4 * i);

        var mapCode = decompr.decompress(rom, pointer, 0);
        if (!mapCode) continue;

        if (fs.existsSync(`./map_code_cache/${i}.bin`)) {
            preCompressed[i.toString()] = fs.readFileSync(`./map_code_cache/${i}.bin`);
        } else {
            compressCacheMapCode(i, mapCode);
        }
        
        convertBranchLinks(mapCode, false);
        mapCodeData[i.toString()] = [false, mapCode];
    }
}

function compressCacheMapCode(i, mapCode) {
    preCompressed[i.toString()] = new Uint8Array(decompr.compressC1(mapCode));
    fs.writeFileSync(`./map_code_cache/${i}.bin`, preCompressed[i.toString()]);
}

function clone() {
    return JSON.parse(JSON.stringify(mapCodeData));
}

function writeToRom(instance, rom) {
    var romPos = read24b(rom, 0x681924);

    for (var i = 1609; i < 1723; ++i) {
        var pointerAddr = 0x680000 + 4 * i;
        write32b(rom, pointerAddr, romPos + 0x08000000);

        var entry = instance[i];
        var cmc = undefined;
        if (entry[0]) {
            convertBranchLinks(entry[1], true);
            cmc = new Uint8Array(decompr.compressC1(entry[1]));
        } else {
            cmc = preCompressed[i];
        }

        rom[romPos++] = 0x1;
        for (let i = 0; i < cmc.length; ++i) {
            rom[romPos++] = cmc[i];
        }
        romPos += 3;
        romPos &= 0xFFFFFFFC;
    }

    if (romPos >= 0xF9FF00) {
        console.log("WARNING: The size of the map code data exceeds safe limits");
    }
}

module.exports = {initialise, clone, writeToRom};