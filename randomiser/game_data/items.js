const nameOffset = 607;
const descOffset = 146;
const numItems = 461;
const addrOffset = 0xB2364;

var itemData = [];

function loadItemData(rom, id, name, desc) {
    var addr = addrOffset + 44 * id;
    var cost = rom[addr] + (rom[addr + 1] << 8);
    var itemType = rom[addr + 2];
    var flags = rom[addr + 3];
    var equipCompat = rom[addr + 4];
    var attack = rom[addr + 8] + (rom[addr + 9] << 8);
    var defense = rom[addr + 10];
    var unleashRate = rom[addr + 11];
    var useType = rom[addr + 12];
    var unleashId = rom[addr + 14] + (rom[addr + 15] << 8);
    var useEffect = rom[addr + 40] + (rom[addr + 41] << 8);

    var equipEffects = [];
    for (var i = 0; i < 4; ++i) {
        equipEffects.push([rom[addr + 24 + 4 * i], rom[addr + 25 + 4 * i]]);
    }

    if (desc.startsWith("Cursed")) desc = desc.substring(7);
    itemData.push({id: id, name: name, desc: desc, addr: addr, cost: cost, itemType: itemType,
        flags: flags, equipCompat: equipCompat, attack: attack, defense: defense, unleashRate: unleashRate,
        useType: useType, unleashId: unleashId, useEffect: useEffect, equipEffects: equipEffects});
}

function initialise(rom, textutil) {
    for (var i = 0; i < numItems; ++i) {
        var name = textutil.readLinePretty(nameOffset + i);
        if (name == '?') continue;
        
        var desc = textutil.readLinePretty(descOffset + i);
        loadItemData(rom, i, name, desc);
    }
}

function clone() {
    return JSON.parse(JSON.stringify(itemData));
}

function writeToRom(instance, rom) {
    instance.forEach((item) => {
        var addr = item.addr;
        rom[addr] = (item.cost & 0xFF);
        rom[addr + 1] = (item.cost >> 8);
        rom[addr + 2] = item.itemType;
        rom[addr + 3] = item.flags;
        rom[addr + 4] = item.equipCompat;
        rom[addr + 8] = (item.attack & 0xFF);
        rom[addr + 9] = (item.attack >> 8);
        rom[addr + 10] = item.defense;
        rom[addr + 11] = item.unleashRate;
        rom[addr + 12] = item.useType;
        rom[addr + 14] = (item.unleashId & 0xFF);
        rom[addr + 15] = (item.unleashId >> 8);
        rom[addr + 40] = (item.useEffect & 0xFF);
        rom[addr + 41] = (item.useEffect >> 8);

        item.equipEffects.forEach((effect, i) => {
            rom[addr + 24 + 4 * i] = effect[0];
            rom[addr + 25 + 4 * i] = effect[1];
        });
    });
}

function randomiseCompatibility(instance, prng) {
    instance.forEach((item) => {
        if (item.itemType == 0 || item.itemType >= 5) return;
        item.equipCompat = (Math.floor(prng.random() * 15 + 1) << 4) + Math.floor(prng.random() * 15 + 1);
    })
}

function adjustEquipPrices(instance, prng) {
    instance.forEach((item) => {
        if (item.cost == 0 || item.equipCompat == 0) return;
        var cost = Math.round(item.cost * (prng.random() * 0.8 + 0.6));
        item.cost = Math.min(0xFFFF, cost);
    });
}

module.exports = {initialise, clone, writeToRom, randomiseCompatibility, adjustEquipPrices};