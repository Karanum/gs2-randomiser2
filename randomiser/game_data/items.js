const nameOffset = 607;
const descOffset = 146;
const numItems = 461;
const addrOffset = 0xB2364;

var itemData = [];

function isArmour(type) {
    if (type <= 1 || type >= 10) return false;
    if (type == 6 || type == 7) return false;
    return true;
}

function loadItemData(rom, id, name, desc) {
    var addr = addrOffset + 44 * id;
    var cost = rom[addr] + (rom[addr + 1] << 8);
    var itemType = rom[addr + 2];
    var flags = rom[addr + 3];
    var equipCompat = rom[addr + 4];
    var attack = rom[addr + 8];
    var defense = rom[addr + 10];
    var unleashRate = rom[addr + 11];
    var useType = rom[addr + 12];
    var unleashId = rom[addr + 14] + (rom[addr + 15] << 8);
    var useEffect = rom[addr + 40] + (rom[addr + 41] << 8);

    var equipEffects = [];
    for (var i = 0; i < 4; ++i) {
        equipEffects.push([rom[addr + 24 + 4 * i], rom[addr + 25 + 4 * i]]);
    }

    if (id == 171) desc = "Circlet: Use to delude enemies";
    if (id == 344) desc = "Clothes: Boosts Attack & Criticals";
    if (id == 365) desc = "Gloves: Boosts Attack & Criticals";
    if (desc.endsWith("Raises Evade")) desc = desc.split(':')[0] + ": Boosts Criticals";

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

function writeToRom(instance, rom, textutil) {
    instance.forEach((item) => {
        var addr = item.addr;
        rom[addr] = (item.cost & 0xFF);
        rom[addr + 1] = (item.cost >> 8);
        rom[addr + 2] = item.itemType;
        rom[addr + 3] = item.flags;
        rom[addr + 4] = item.equipCompat;
        rom[addr + 8] = item.attack;
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

        textutil.writeLine(descOffset + item.id, item.desc);
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
        var cost = Math.round(item.cost * (prng.random() * 0.4 + 0.8));
        item.cost = Math.min(0xFFFF, cost);
    });
}

function adjustStats(instance, prng) {
    instance.forEach((item) => {
        if (item.itemType == 1) {
            if (item.attack == 0) return;
            
            var attackChange = Math.round(item.attack * (prng.random() - 0.5));
            var vanillaAttack = item.attack;
            item.attack = Math.max(1, Math.min(255, item.attack + attackChange));
            item.cost = Math.round(item.cost * (1 + ((item.attack / vanillaAttack) - 1) / 1.5));
        } else if (isArmour(item.itemType)) {
            if (item.attack > 0)
                item.attack = Math.floor(prng.random() * 19 + 2);
            if (item.defense == 0) return;

            var defenseChange = Math.round(item.defense * (prng.random() - 0.5));
            var vanillaDefense = item.defense;
            item.defense = Math.max(1, Math.min(60, item.defense + defenseChange));
            item.cost = Math.round(item.cost * (1 + ((item.defense / vanillaDefense) - 1) / 1.5));
        }
    });
}

function shuffleWeaponEffects(instance, prng) {
    var eligible = [];
    var propertyList = [];

    instance.forEach((item) => {
        if (item.itemType != 1) return;
        eligible.push(item);
        propertyList.push([item.unleashId, item.unleashRate, item.useType, item.element,
                        item.useEffect, item.equipEffects, item.desc.split(': ')[1]]);
        item.desc = item.desc.split(': ')[0];
    });

    eligible.forEach((item) => {
        var rand = Math.floor(prng.random() * propertyList.length);
        var properties = propertyList.splice(rand, 1)[0];
        item.unleashId = properties[0];
        item.unleashRate = properties[1];
        item.useType = properties[2];
        item.element = properties[3];
        item.useEffect = properties[4];
        item.equipEffects = properties[5];

        var desc = properties[6];
        if (desc != undefined && desc != "Needs to be reforged")
            item.desc += ": " + desc;
    });
}

function shuffleArmourEffects(instance, prng) {
    var eligible = [];
    var propertyList = [];

    instance.forEach((item) => {
        if (!isArmour(item.itemType)) return;
        eligible.push(item);
        propertyList.push([item.useType, item.useEffect, item.equipEffects, item.desc.split(': ')[1]]);
        item.desc = item.desc.split(': ')[0];
    });

    eligible.forEach((item) => {
        var rand = Math.floor(prng.random() * propertyList.length);
        var properties = propertyList.splice(rand, 1)[0];
        item.useType = properties[0];
        item.useEffect = properties[1];
        item.equipEffects = properties[2];

        var desc = properties[3];
        if (desc != undefined)
            item.desc += ": " + desc;
    });
}

function shuffleCurses(instance, prng) {
    var numCurses = Math.round(prng.random() * 10 + 10);
    var eligible = [];

    instance.forEach((item) => {
        if (item.itemType != 1 && !isArmour(item.itemType)) return;
        eligible.push(item);

        if (item.flags & 0x1) item.flags &= 0xFC;
        if (item.desc.startsWith("Cursed")) item.desc = item.desc.substring(7);
    });

    for (var i = 0; i < numCurses; ++i) {
        var rand = Math.floor(prng.random() * eligible.length);
        var item = eligible.splice(rand, 1)[0];

        item.flags |= 0x3;
        item.desc = "Cursed " + item.desc;
    }
}

module.exports = {initialise, clone, writeToRom, randomiseCompatibility, adjustEquipPrices, adjustStats,
                shuffleWeaponEffects, shuffleArmourEffects, shuffleCurses};