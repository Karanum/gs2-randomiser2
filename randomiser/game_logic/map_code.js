const decompr = require('../../modules/decompression.js');

var mapCodeData = {};

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
    for (var i = 1609; i < 1723; ++i) {
        var pointer = read24b(rom, 0x680000 + 4 * i);
        var mapCode = decompr.decompress(rom, pointer, 0, true);
        if (!mapCode) continue;

        convertBranchLinks(mapCode, false);
        mapCodeData[i] = mapCode;
    }

    var temp = mapCodeData[1610];
    temp[0x4b6] = 0x5B;
    temp[0x4b7] = 0xE0;
    convertBranchLinks(temp, true);
    var cmc = new Uint8Array(decompr.compressC0(temp));
    console.log(cmc.length);

    require('fs').writeFile("./debug/1610.bin", cmc, (err) => { 
        if (err) console.log(err); 
    });
}

function clone() {
    return JSON.parse(JSON.stringify(mapCodeData));
}

module.exports = {initialise, clone};