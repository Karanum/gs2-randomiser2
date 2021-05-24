const addrOffset = 0x10C3F2;
const itemData = require('./items.js');

var shopData = [];

function initialise(rom) {
    for (var i = 0; i < 32; ++i) {
        var addr = addrOffset + 66 * i;
        var type = rom[addr];
        var items = [];
        var artifacts = [];

        for (var j = 0; j < 24; ++j) {
            items.push(rom[addr + 2 * j + 2] + (rom[addr + 2 * j + 3] << 8));
        }
        for (var j = 0; j < 8; ++j) {
            artifacts.push(rom[addr + 2 * j + 50] + (rom[addr + 2 * j + 51] << 8));
        }

        shopData.push({addr: addr, type: type, items: items, artifacts: artifacts});
    }
}

function writeToRom(instance, rom) {
    instance.forEach((shop) => {
        rom[shop.addr] = shop.type;
        for (var i = 0; i < shop.items.length; ++i) {
            rom[shop.addr + 2 * i + 2] = (shop.items[i] & 0xFF);
            rom[shop.addr + 2 * i + 3] = (shop.items[i] >> 8);
        }
        for (var i = 0; i < shop.artifacts.length; ++i) {
            rom[shop.addr + 2 * i + 50] = (shop.artifacts[i] & 0xFF);
            rom[shop.addr + 2 * i + 51] = (shop.artifacts[i] >> 8);
        }
    });
}

function clone() {
    return JSON.parse(JSON.stringify(shopData));
}

function getAllEquipmentArtifacts(instance, instItems) {
    var equipment = [];
    instance.forEach((shop) => {
        shop.artifacts.forEach((item) => {
            if (item == 0) return;

            var data = instItems[item];
            if (data.itemType == 1 || itemData.isArmour(data.itemType))
                equipment.push(item);
        });
    });
    return equipment;
}

function shuffleEquipmentArtifacts(instance, instItems, prng, equipment) {
    instance.forEach((shop) => {
        for (var i = 0; i < shop.artifacts.length; ++i) {
            if (shop.artifacts[i] == 0) continue;

            var data = instItems[shop.artifacts[i]];
            if (data.itemType == 1 || itemData.isArmour(data.itemType)) {
                var rand = Math.floor(prng.random() * equipment.length);
                shop.artifacts[i] = equipment.splice(rand, 1)[0];
            }
        }
    });
}

module.exports = {initialise, writeToRom, clone, getAllEquipmentArtifacts, shuffleEquipmentArtifacts};