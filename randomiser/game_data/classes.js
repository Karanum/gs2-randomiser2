const abilityData = require('./abilities.js');
const weightedPicker = require('./../../modules/weightedPicker.js');

const textStart = 2915;
const textEnd = 3158;
const addrOffset = 0xC15F4;
const addrInterval = 0x348;

const weightFallout = 0.33;
const psyDecayChance = 0.15;

const utilPsynergy = [12, 24, 33, 78, 185];
var psynergyGroups = [];
var psynergyElements = [[], [], [], []];
var psynergyList = [];

var classData = [];

function loadClassData(rom, id, classes) {
    var addr = addrOffset + (id * addrInterval);
    if (classes[0] == "NPC") {
        classes = classes.slice(1);
        addr += 0x54;
    }

    var elements = [];
    var stats = [];
    var psynergy = [];
    var levels = [];

    for (var i = 0; i < classes.length; ++i) {
        var cAddr = addr + (i * 0x54);
        elements.push([rom[cAddr + 4], rom[cAddr + 5], rom[cAddr + 6], rom[cAddr + 7]]);
        stats.push([rom[cAddr + 8], rom[cAddr + 9], rom[cAddr + 10], rom[cAddr + 11], rom[cAddr + 12], rom[cAddr + 13]]);
        psynergy.push([]);
        levels.push([]);

        for (var j = 0; j < 16; ++j) {
            psynergy[i].push(rom[cAddr + (4 * j) + 16] + (rom[cAddr + (4 * j) + 17] << 8));
            levels[i].push(rom[cAddr + (4 * j) + 18]);
        }
    }

    classData.push({ id: id, classes: classes, addr: addr, elements: elements, 
        stats: stats, psynergy: psynergy, levels: levels });
}

function clone() {
    return JSON.parse(JSON.stringify(classData));
}

function initialise(rom, textutil) {
    var id = 0;
    var line = textStart;
    while (line <= textEnd) {
        var classLine = [];
        for (var i = 0; i < 10 && line <= textEnd; ++i) {
            var name = textutil.readLinePretty(undefined, line++);
            if (name != "?") classLine.push(name);
        }
        loadClassData(rom, id++, classLine);
    }

    psynergyGroups = require('./json/psynergyLines.json');
    psynergyGroups.forEach((group) => {
        for (var i = 0; i < group.psy.length; ++i) {
            var id = group.psy[i];
            var levels = [];
            if (group.type == "sequence") {
                levels.push(group.levels[0] + (30 * i));
            } else {
                group.levels.forEach((levelSet) => levels.push(levelSet[i]));
            }
            var elem = abilityData.getAbilityElement(id);

            psynergyElements[elem].push([id, levels]);
            psynergyList.push([id, levels]);
        }
    });
}

function writeToRom(instance, rom) {
    instance.forEach((classLine) => {
        for (var i = 0; i < classLine.classes.length; ++i) {
            var cAddr = classLine.addr + (i * 0x54);
            rom.set(classLine.elements[i], cAddr + 4);
            rom.set(classLine.stats[i], cAddr + 8);

            var psynergy = classLine.psynergy[i];
            var levels = classLine.levels[i];
            for (var j = 0; j < 16; ++j) {
                rom[cAddr + (4 * j) + 16] = (psynergy[j] & 0xFF);
                rom[cAddr + (4 * j) + 17] = (psynergy[j] >> 8);
                rom[cAddr + (4 * j) + 18] = levels[j];
            }
        }
    });
}

function clearPsynergyData(classLine) {
    for (var i = 0; i < classLine.classes.length; ++i) {
        classLine.psynergy[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        classLine.levels[i] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
}

function insertPsynergyGroup(prng, classLine, index, psynergy, levels, decay) {
    for (var i = classLine.classes.length - 1; i >= 0; --i) {
        for (var j = 0; j < psynergy.length; ++j) {
            classLine.psynergy[i][index + j] = psynergy[j];
            classLine.levels[i][index + j] = levels[j];
        }
        if (decay && prng.random() <= psyDecayChance)
            break;
    }
}

function insertPsynergySequence(prng, classLine, index, psynergy, level) {
    var seqStep = psynergy.length - 1;
    for (var i = classLine.classes.length - 1; i >= 0; --i) {
        classLine.psynergy[i][index] = psynergy[seqStep];
        classLine.levels[i][index] = level;
        if (i == 0) continue;

        var decayChance = seqStep / i;
        if (prng.random() <= decayChance) --seqStep;
    }
}

function shufflePsynergyByClass(instance, prng) {
    var psynergyPool = [];
    var levelPool = [];
    instance.forEach((classLine) => {
        psynergyPool.push(classLine.psynergy.slice());
        levelPool.push(classLine.levels.slice());
    });

    instance.forEach((classLine) => {
        var rand = Math.floor(prng.random() * psynergyPool.length);
        var targetPsynergy = psynergyPool.splice(rand, 1)[0];
        var targetLevels = levelPool.splice(rand, 1)[0];

        var sourceLength = classLine.psynergy.length;
        var targetLength = targetPsynergy.length;

        if (sourceLength == targetLength) {
            classLine.psynergy = targetPsynergy;
            classLine.levels = targetLevels;
        } else {
            var frac = targetLength / sourceLength;
            if (sourceLength < targetLength) {
                for (var i = 0; i < sourceLength; ++i) {
                    classLine.psynergy[i] = targetPsynergy[Math.ceil(frac * i)];
                    classLine.levels[i] = targetLevels[Math.ceil(frac * i)];
                }
            } else {
                for (var i = 0; i < sourceLength; ++i) {
                    classLine.psynergy[i] = targetPsynergy[Math.floor(frac * i)];
                    classLine.levels[i] = targetLevels[Math.floor(frac * i)];
                }
            }
        }
    });
}

function shufflePsynergyByGroup(instance, prng) {
    var weights = [];
    var totalWeight = 0;
    psynergyGroups.forEach(() => {
        weights.push(1);
        ++totalWeight;
    });

    instance.forEach((classLine) => {
        var selectedGroups = [];
        var psyNum = 0;
        while (true) {
            var selectedGroup;
            while (selectedGroup == undefined || selectedGroups.includes(selectedGroup)) {
                selectedGroup = weightedPicker.pickIndex(prng, weights, totalWeight);
            }

            var group = psynergyGroups[selectedGroup];
            psyNum += (group.type == "sequence") ? 1 : group.psy.length;
            if (psyNum > 16) break;

            var oldWeight = weights[selectedGroup];
            weights[selectedGroup] *= weightFallout;
            totalWeight -= (oldWeight - weights[selectedGroup]);

            selectedGroups.push(selectedGroup);
        }

        psyNum = 0;
        clearPsynergyData(classLine);
        selectedGroups.forEach((index) => {
            var group = psynergyGroups[index];
            var levels = group.levels[Math.floor(prng.random() * group.levels.length)];;

            if (group.type == "sequence") {
                insertPsynergySequence(prng, classLine, psyNum, group.psy, levels);
                ++psyNum;
            } else {
                insertPsynergyGroup(prng, classLine, psyNum, group.psy, levels, psyNum >= 8);
                psyNum += group.psy.length;
            }
        });
    });
}

function shufflePsynergyByElement(instance, prng) {
    var weights = [[], [], [], []];
    var totalWeights = [0, 0, 0, 0];
    for (var i = 0; i < psynergyElements.length; ++i) {
        psynergyElements[i].forEach((psy) => {
            weights[i].push(1);
            ++totalWeights[i];
        });
    }

    instance.forEach((classLine) => {
        var psynergyMap = {};
        var selectedPsy = [];
        for (var i = 0; i < classLine.classes.length; ++i) {
            for (var j = 0; j < 16; ++j) {
                var psynergy = classLine.psynergy[i][j];
                if (psynergy == 0) continue;

                if (psynergyMap.hasOwnProperty(psynergy)) {
                    var targetPsy = psynergyMap[psynergy];
                    classLine.psynergy[i][j] = targetPsy[0];
                    classLine.levels[i][j] = targetPsy[1];
                    continue;
                }

                var element = abilityData.getAbilityElement(psynergy);
                if (element > 3) continue;

                var index, targetPsy;
                while (true) {
                    index = weightedPicker.pickIndex(prng, weights[element], totalWeights[element]);
                    targetPsy = psynergyElements[element][index];
                    if (!selectedPsy.includes(targetPsy[0])) break;
                }
                var targetLevel = targetPsy[1][Math.floor(prng.random() * targetPsy[1].length)];
                psynergyMap[psynergy] = [targetPsy[0], targetLevel];
                selectedPsy.push(targetPsy[0]);

                var oldWeight = weights[element][index];
                weights[element][index] *= weightFallout;
                totalWeights[element] -= (oldWeight - weights[element][index]);

                classLine.psynergy[i][j] = targetPsy[0];
                classLine.levels[i][j] = targetLevel;
            }
        }
    });
}

function shufflePsynergy(instance, prng) {
    var weights = [];
    var totalWeight = 0;
    psynergyList.forEach(() => {
        weights.push(1);
        ++totalWeight;
    });

    instance.forEach((classLine) => {
        var psynergyMap = {};
        var selectedPsy = [];
        for (var i = 0; i < classLine.classes.length; ++i) {
            for (var j = 0; j < 16; ++j) {
                var psynergy = classLine.psynergy[i][j];
                if (psynergy == 0) continue;

                if (psynergyMap.hasOwnProperty(psynergy)) {
                    var targetPsy = psynergyMap[psynergy];
                    classLine.psynergy[i][j] = targetPsy[0];
                    classLine.levels[i][j] = targetPsy[1];
                    continue;
                }

                var index, targetPsy;
                while (true) {
                    index = weightedPicker.pickIndex(prng, weights, totalWeight);
                    targetPsy = psynergyList[index];
                    if (!selectedPsy.includes(targetPsy[0])) break;
                }
                var targetLevel = targetPsy[1][Math.floor(prng.random() * targetPsy[1].length)];
                psynergyMap[psynergy] = [targetPsy[0], targetLevel];
                selectedPsy.push(targetPsy[0]);

                var oldWeight = weights[index];
                weights[index] *= weightFallout;
                totalWeight -= (oldWeight - weights[index]);

                classLine.psynergy[i][j] = targetPsy[0];
                classLine.levels[i][j] = targetLevel;
            }
        }
    });
}

function adjustLevels(instance, prng) {
    instance.forEach((classLine) => {
        for (var i = 0; i < 16; ++i) {
            var level = classLine.levels[classLine.levels.length - 1][i];
            if (level == 0) continue;

            var diff = Math.round(level * (prng.random() - 0.5));
            diff = Math.min(15, Math.max(-15, diff));
            for (var j = 0; j < classLine.classes.length; ++j) {
                if (classLine.levels[j][i] == 0) continue;
                classLine.levels[j][i] += diff;
            }
        }
    });
}

function randomisePsynergy(instance, mode, prng) {
    switch(mode) {
        case 1: return shufflePsynergyByClass(instance, prng);
        case 2: return shufflePsynergyByGroup(instance, prng);
        case 3: return shufflePsynergyByElement(instance, prng);
        case 4: return shufflePsynergy(instance, prng);
    }
}

function randomiseLevels(instance, mode, prng) {
    if (mode == 0) return;
    if (mode == 1) return adjustLevels(instance, prng);

    instance.forEach((classLine) => {
        for (var i = 0; i < 16; ++i) {
            var level = classLine.levels[classLine.levels.length - 1][i];
            if (level == 0) continue;

            level = Math.floor(prng.random() * 50) + 1;
            for (var j = 0; j < classLine.classes.length; ++j) {
                if (classLine.levels[j][i] == 0) continue;
                classLine.levels[j][i] = level;
            }
        }
    });
}

function insertIntoSortedArray(arr, n) {
    for (var i = 0; i < arr.length; ++i) {
        if (n < arr[i]) {
            arr.splice(i, 0, n);
            return;
        }
    }
    arr.push(n);
}

function getRandomStat(prng, elemValue) {
    return prng.random() * Math.floor(6 + 0.5 * elemValue) + Math.round(7.9 + 0.25 * elemValue);
}

function randomiseStats(instance, prng) {
    instance.forEach((classLine) => {
        var minElemValue = 0;
        var maxElemValue = 0;
        var luck = classLine.stats[0][5];

        classLine.elements[0].forEach((elem) => minElemValue += elem);
        classLine.elements[classLine.elements.length - 1].forEach((elem) => maxElemValue += elem);
        if (minElemValue == 0) {
            minElemValue = 2;
        }

        for (var i = 0; i < 6; ++i) {
            var minStat = getRandomStat(prng, minElemValue);
            var maxStat = Math.max(getRandomStat(prng, maxElemValue), getRandomStat(prng, maxElemValue));
            if (minStat > maxStat) {
                var s = minStat;
                minStat = maxStat;
                maxStat = s;
            }
            if (i == 5) {
                minStat = (luck + minStat) / 2;
                maxStat = (luck + minStat + (maxStat - minStat) / 2) / 2;
            }
            
            var step = (maxStat - minStat) / classLine.classes.length;
            for (var j = 0; j < classLine.classes.length; ++j) {
                classLine.stats[j][i] = Math.floor(minStat + j * step);
            }
        }
    });
}

function removeUtilityPsynergy(instance) {
    instance.forEach((classLine) => {
        for (var i = 0; i < classLine.classes.length; ++i) {
            var psynergy = classLine.psynergy[i];
            var levels = classLine.levels[i];
            for (var j = 0; j < 16; ++j) {
                if (utilPsynergy.includes(psynergy[j])) {
                    psynergy[j] = 0;
                    levels[j] = 0;
                }
            }
        }
    });
}

module.exports = {initialise, writeToRom, clone, removeUtilityPsynergy, randomisePsynergy, randomiseLevels, randomiseStats};