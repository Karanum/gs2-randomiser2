const addrOffset = 0xC0F9C;

const elementSets = [[54, 3, 1, 2], [1, 2, 54, 3], [2, 1, 3, 54], [3, 54, 2, 1]];

var characterData = [];

function readStatArray(rom, addr, byteSize = 1) {
    var stat = [];
    for (var i = 0; i < 6; ++i) {
        var num = 0;
        for (var j = 0; j < byteSize; ++j) {
            num += (rom[addr + byteSize * i + j] << (8 * j));
        }
        stat.push(num);
    }
    return stat;
}

function initialise(rom) {
    for (var i = 0; i < 8; ++i) {
        var addr = addrOffset + 0xB4 * i;
        var elements = [rom[addr + 66], rom[addr + 67], rom[addr + 68], rom[addr + 69]];
        var level = rom[addr + 70];
        var stats= [
            readStatArray(rom, addr, 2), 
            readStatArray(rom, addr + 12, 2),
            readStatArray(rom, addr + 24, 2),
            readStatArray(rom, addr + 36, 2),
            readStatArray(rom, addr + 48, 2),
            readStatArray(rom, addr + 60)
        ];

        characterData.push({id: i, addr: addr, elements: elements, level: level, stats: stats});
    }
}

function clone() {
    return JSON.parse(JSON.stringify(characterData));
}

function writeToRom(instance, rom) {
    instance.forEach((char) => {
        var addr = char.addr;
        for (var i = 0; i < 5; ++i) {
            for (var j = 0; j < 6; ++j) {
                var statAddr = addr + 12 * i + 2 * j;
                rom[statAddr] = (char.stats[i][j] & 0xFF);
                rom[statAddr + 1] = (char.stats[i][j] >> 8);
            }
        }
        for (var i = 0; i < 6; ++i) {
            rom[addr + 60 + i] = char.stats[5][i];
        }
        for (var i = 0; i < 4; ++i) {
            rom[addr + 66 + i] = char.elements[i];
        }
        rom[addr + 70] = char.level;
    });
}

function shuffleStats(instance, prng) {
    var statPool = [[], [], [], [], [], []];
    instance.forEach((char) => {
        for (var i = 0; i < 6; ++i) {
            statPool[i].push(char.stats[i]);
        }
    });

    instance.forEach((char) => {
        for (var i = 0; i < 6; ++i) {
            var rand = Math.floor(prng.random() * statPool[i].length);
            char.stats[i] = statPool[i].splice(rand, 1)[0];
        }
    });
}

function adjustStats(instance, prng) {
    instance.forEach((char) => {
        char.stats.forEach((statBlock) => {
            var statLow = Math.max(1, Math.round(statBlock[0] * (prng.random() + 0.5)));
            var statHigh = Math.min(999, Math.round(statBlock[5] * (prng.random() * 0.5 + 0.75)));
            if (statLow > statHigh)
                statHigh = statLow;

            var step = (statHigh - statLow) / 5;
            for (var i = 0; i < 6; ++i) {
                statBlock[i] = Math.round(statLow + step * i);
            }
        });
    });
}

function shuffleElements(instance, prng, unique) {
    var elementPool = elementSets.slice();
    if (unique) elementPool = elementPool.concat(elementSets);

    instance.forEach((char) => {
        var rand = Math.floor(prng.random() * elementPool.length);
        char.elements = elementPool[rand];
        if (unique) elementPool.splice(rand, 1);
    });
}

function adjustStartingLevels(instance, level, isDynamic, spheres, itemLocations) {
    var newLevel = Math.max(Math.min(level, 99), 5);
    var maxLevel = Math.max(newLevel, 24);
    var maxDepth = spheres.length;
    var mappedSpheres = [];

    if (isDynamic) {
        mappedSpheres = spheres.map((sphere) => {
            return sphere.map((loc) => {
                return itemLocations[loc][0]['contents'];
            });
        });
    }

    instance.forEach((char) => {
        if (isDynamic && char.id != 4 && maxLevel != newLevel) {
            let depth = 0;
            for (let i = 0; i < maxDepth; ++i) {
                if (mappedSpheres[i].includes(0xD00 + char.id)) {
                    depth = i;
                    break;
                }
            }
            char.level = Math.floor(newLevel + (depth / (maxDepth - 1)) * (maxLevel - newLevel));
        } else {
            char.level = Math.max(char.level, newLevel);
        }
    });
}

module.exports = {initialise, clone, writeToRom, shuffleStats, adjustStats, shuffleElements, adjustStartingLevels};