const textOffset = 1747;
const addrOffset = 0xFA0000;
const statAddrOffset = 0xC6BB4;

var djinnData = [];

function initialise(rom, textutil) {
    for (var i = 0; i < 80; ++i) {
        var djinniId = i % 20;
        if (djinniId >= 18) continue;

        var element = Math.floor(i / 20);
        var name = textutil.readLinePretty(undefined, textOffset + i);
        var addr = addrOffset + 36 * element + 2 * djinniId;

        var statAddr = statAddrOffset + 240 * element + 12 * djinniId;
        var stats = [rom[statAddr], rom[statAddr + 1], rom[statAddr + 2], 
            rom[statAddr + 3], rom[statAddr + 4], rom[statAddr + 5]];

        djinnData.push({vanillaId: djinniId, vanillaElement: element, vanillaName: name, addr: addr, 
            statAddr: statAddr, id: djinniId, element: element, name: name, stats: stats});
    }
}

function clone() {
    return JSON.parse(JSON.stringify(djinnData));
}

function writeToRom(instance, rom) {
    instance.forEach((djinni) => {
        var addr = djinni.addr;
        rom[addr] = djinni.id;
        rom[addr + 1] = djinni.element;

        var statAddr = djinni.statAddr;
        for (var i = 0; i < 6; ++i) {
            rom[statAddr + i] = djinni.stats[i];
        }
    });
}

function shuffleDjinn(instance, prng) {
    var djinniPool = [];
    for (var i = 0; i < djinnData.length; ++i)
        djinniPool.push(i);

    for (var i = 0; i < djinnData.length; ++i) {
        var index = djinniPool.splice(Math.floor(prng.random() * djinniPool.length), 1)[0];
        var djinni = djinnData[index];
        instance[i].name = djinni.vanillaName;
        instance[i].id = djinni.vanillaId;
        instance[i].element = djinni.vanillaElement;
    }
}

function shuffleStats(instance, prng) {
    var statPools = [[], [], [], [], [], []];
    for (var i = 0; i < djinnData.length; ++i) {
        for (var j = 0; j < 6; ++j) {
            statPools[j].push(djinnData[i].stats[j]);
        }
    }

    for (var i = 0; i < djinnData.length; ++i) {
        for (var j = 0; j < 6; ++j) {
            instance[i].stats[j] = statPools[j].splice(Math.floor(prng.random() * statPools[j].length), 1)[0];
        }
    }
}

module.exports = {initialise, clone, writeToRom, shuffleDjinn, shuffleStats};