const addrOffset = 0x10CC34;
const itemData = require('./items.js');

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

function getAllEquipment(instance, instItems) {
    var equipment = [];
    for (var item in instance) {
        if (!instance.hasOwnProperty(item)) continue;
        var results = instance[item].results;
        for (var i = 0; i < results.length; ++i) {
            if (results[i] == 0) continue;
            var data = instItems[results[i]];
            if (data.itemType == 1 || itemData.isArmour(data.itemType))
                equipment.push(results[i]);
        }
    }
    return equipment;
}

function shuffleEquipment(instance, prng, equipment) {
    for (var item in instance) {
        if (!instance.hasOwnProperty(item)) continue;
        var results = instance[item].results;
        for (var i = 0; i < results.length; ++i) {
            if (results[i] == 0) continue;
            var rand = Math.floor(prng.random() * equipment.length);
            results[i] = equipment.splice(rand, 1)[0];
        }
    }
}

module.exports = {initialise, clone, writeToRom, getAllEquipment, shuffleEquipment};