const textStart = 1447;
const textEnd = 2180;
const addrOffset = 0xB7C14;

var abilityData = {};

function getAbilityType(id) {
    if (id < 3) return "n/a";
    if (id < 208) return "Psynergy";
    if (id < 239) return "Unleash";
    if (id < 271) return "Item";
    if (id < 300) return "Enemy";
    if (id < 380) return "Djinn";
    if (id < 413) return "Summon";
    if (id < 519) return "Enemy";
    if (id < 580) return "Unleash";
    if (id < 637) return "Psynergy";
    return "Enemy";
}

function loadAbility(rom, id, name) {
    var addr = addrOffset + 12 * id;
    var type = getAbilityType(id);
    var target = rom[addr];
    var damageType = rom[addr + 1] & 0xF;
    var element = rom[addr + 2];
    var addedEffect = rom[addr + 3];
    var range = rom[addr + 8];
    var cost = rom[addr + 9];
    var power = rom[addr + 10] + (rom[addr + 11] << 8);
    abilityData[id] = {name: name, addr: addr, type: type, target: target, damageType: damageType,
        element: element, range: range, cost: cost, power: power, addedEffect: addedEffect};
}

function initialise(rom, textutil) {
    var line = textStart;
    while (line <= textEnd) {
        var id = line - textStart;
        var name = textutil.readLinePretty(undefined, line++);
        if (name != "?") {
            if (id == 57) name = "Starburst";
            loadAbility(rom, id, name);
        }
    }
}

function clone() {
    return JSON.parse(JSON.stringify(abilityData));
}

function writeToRom(instance, rom) {
    for (var id in instance) {
        if (!instance.hasOwnProperty(id)) return;
        var ability = instance[id];
        var addr = ability.addr;

        rom[addr] = ability.target;
        rom[addr + 1] = (rom[addr + 1] & 0xF0) + ability.damageType; 
        rom[addr + 2] = ability.element;
        rom[addr + 3] = ability.addedEffect;
        rom[addr + 8] = ability.range;
        rom[addr + 9] = ability.cost;
        rom[addr + 10] = (ability.power & 0xFF);
        rom[addr + 11] = (ability.power >> 8);
    }

    // Overwrite hardcoded element for Daedalus follow-up
    rom[0x11D828] = (instance[403].element & 0xFF);
}

function getAbilityElement(id) {
    if (!abilityData.hasOwnProperty(id)) return undefined;
    if (id == 600 || id == 604) return 0;
    if (id == 602) return 3;

    return abilityData[id].element;
}

function setStartingPsynergy(rom, settings, prng, characters) {
    var psynergy = [];
    if (settings['start-heal']) 
        psynergy = psynergy.concat([characters[Math.floor(prng.random() * characters.length)], 0, Math.floor(prng.random() * 4) * 3 + 0x57, 0x0E]);
    if (settings['start-revive'])
        psynergy = psynergy.concat([characters[Math.floor(prng.random() * characters.length)], 0, 0x65, 0x0E]);

    psynergy.forEach((byte, i) => {
        rom[0xFA0130 + i] = byte;
    });
}

function adjustAbilityPower(instance, type, prng) {
    for (var i in instance) {
        if (!instance.hasOwnProperty(i)) continue;
        if (instance[i].type != type || instance[i].power == 0) continue;
        instance[i].power *= (prng.random() * 0.4 + 0.8);
        instance[i].power = Math.round(instance[i].power);
    }
}

function adjustPsynergyCost(instance, prng) {
    for (var i in instance) {
        if (!instance.hasOwnProperty(i)) continue;
        if (instance[i].type != "Psynergy" || instance[i].cost == 0) continue;
        instance[i].cost *= (prng.random() * 0.8 + 0.6);
        instance[i].cost = Math.round(instance[i].cost);
    }
}

function randomiseAbilityRange(instance, type, prng) {
    for (var i in instance) {
        if (!instance.hasOwnProperty(i)) continue;
        if (instance[i].type != type || (type == "Psynergy" && instance[i].damageType == 9)) continue;
        instance[i].range = Math.floor(prng.random() * 5);
        if (instance[i].range == 0) instance[i] = 255;
    }
}

module.exports = {initialise, clone, writeToRom, getAbilityElement, setStartingPsynergy,
                adjustAbilityPower, adjustPsynergyCost, randomiseAbilityRange};