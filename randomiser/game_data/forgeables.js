const addrOffset = 0x10CC34;

const forgeData = {};

function initialise(rom) {
    var offset = 0;
    var itemId = rom[addrOffset] + (rom[addrOffset + 1] << 8);
    while (itemId != 0xFFFF) {
        var addr = addrOffset + offset;
        var results = [];
        for (var i = 0; i < 8; ++i) {
            results.push(rom[addr + 2 * i + 4] + (rom[addr + 2 * i + 5] << 8));
        }
        forgeData[itemId] = {addr: addr, results: results};

        offset += 36;
        itemId = rom[addrOffset + offset] + (rom[addrOffset + offset + 1] << 8);
    }
}

function clone() {
    return JSON.parse(JSON.stringify(forgeData));
}

function writeToRom(instance, rom) {
    for (var item in instance) {
        if (!instance.hasOwnProperty(item)) continue;
        var addr = instance[item].addr;
        var results = instance[item].results;
        for (var i = 0; i < results.length; ++i) {
            rom[addr + 2 * i + 4] = (results[i] & 0xFF);
            rom[addr + 2 * i + 5] = (results[i] >> 8);
        }
    }
}

module.exports = {initialise, clone, writeToRom};