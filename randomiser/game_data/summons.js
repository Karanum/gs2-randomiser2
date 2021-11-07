const summons = ["Venus", "Mercury", "Mars", "Jupiter", "Ramses", "Nereid", "Kirin", "Atalanta",
    "Cybele", "Neptune", "Tiamat", "Procne", "Judgment", "Boreas", "Meteor", "Thor", "Zagan",
    "Megaera", "Flora", "Moloch", "Ulysses", "Haures", "Eclipse", "Coatlique", "Daedalus",
    "Azul", "Catastrophe", "Charon", "Iris"];
const summonIds = [380, 388, 396, 406, 381, 389, 397, 407, 382, 390, 398, 408, 383, 391, 399, 409,
    384, 400, 410, 392, 401, 385, 411, 393, 402, 394, 412, 386, 404];

const addrOffset = 0xC1510;

var summonData = [];

function initialise(rom) {
    summons.forEach((summon, i) => {
        var addr = addrOffset + 8 * i;
        var abilityId = summonIds[i];
        var cost = [rom[addr], rom[addr + 1], rom[addr + 2], rom[addr + 3]];
        summonData.push({id: i, name: summon, addr: addr, abilityId: abilityId, cost: cost});
    });
}

function clone() {
    return JSON.parse(JSON.stringify(summonData));
}

function writeToRom(instance, rom) {
    instance.forEach((summon) => {
        for (var i = 0; i < 4; ++i)
            rom[summon.addr + i] = summon.cost[i];
    });
}

function getPrimaryElementalValue(elemValue, prng) {
    var adder = Math.ceil(elemValue / 2);
    var multiplier = Math.min(9 - adder, Math.floor(elemValue / 2)) + 1;
    return Math.floor(prng.random() * multiplier + adder);
}

function randomiseCost(instance, abilityData, prng) {
    var elements = [0, 1, 2, 3];
    instance.forEach((summon, i) => {
        var cost = [0, 0, 0, 0];
        var elemValue = summon.cost[0] + summon.cost[1] + summon.cost[2] + summon.cost[3];
        if (elemValue > 1) {
            var majorElemValue = getPrimaryElementalValue(elemValue, prng);
            var minorElemValue = elemValue - majorElemValue;
            var majorElement = Math.floor(prng.random() * 4);
            var minorElement = majorElement;
            while (minorElement == majorElement)
                minorElement = Math.floor(prng.random() * 4);

            cost[majorElement] = majorElemValue;
            cost[minorElement] = minorElemValue;

            summon.cost = cost;
            abilityData[summonIds[i]].element = majorElement;
        } else {
            if (elements.length == 0) return;
            var element = elements.splice(Math.floor(prng.random() * elements.length), 1)[0];

            cost[element] = 1;
            summon.cost = cost;
            abilityData[summonIds[i]].element = element;
        }
    });
}

module.exports = {initialise, clone, writeToRom, randomiseCost};