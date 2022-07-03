const locations = require('../game_logic/locations.js');

const addrFrom = 0xF2204;
const addrUntil = 0xF2E98;
const specialLocOffset = 0xFA00A0;
const itemNameOffset = 607;

const summonData = {
    0x10: "Zagan", 0x11: "Megaera", 0x12: "Flora",
    0x13: "Moloch", 0x14: "Ulysses", 0x15: "Haures",
    0x16: "Eclipse", 0x17: "Coatlicue", 0x18: "Daedalus",
    0x19: "Azul", 0x1A: "Catastrophe", 0x1B: "Charon",
    0x1C: "Iris"
};

const keyItems = [0x8C7, 0x949, 0xF06, 0xF15, 0xF16, 0xF1A, 0xF40, 0xF41, 0xF67, 0xF6D, 0xF74, 0xF80, 0xF93, 0xFE7, 0xFE8, 0xFFE];

const unusedMaps = [5, 43, 97, 247];
const unusedFlags = [0xF5D, 0xFA7, 0xFB6, 0xFB7, 0xFB8, 0xFBE, 0xFF3];

const specialLocations = [
    [0x84A, 0x80, 22, "Lash Pebble"],
    [0x878, 0x80, 38, "Pound Cube"],
    [0x88C, 0x80, 76, "Scoop Gem"],
    [0x918, 0x80, 44, "Cyclone Chip"],
    [0x94D, 0x80, 248, "Hover Jade"],
    [0xA3A, 0x80, 286, "Mars Star"],
    [0x8FF, 0x80, 124, "Black Crystal"],
    [0x978, 0x80, 188, "Trident"],
    [0xAA2, 0x80, 132, "Pretty Stone"],
    [0xAA4, 0x80, 134, "Red Cloth"],
    [0xAA3, 0x80, 133, "Milk"],
    [0xAA1, 0x80, 131, "Li'l Turtle"],
    [0x901, 0x80, 99, "Large Bread"], 
    [0xA20, 0x80, 12, "Sea God's Tear"],   
    [0x9F9, 0x80, 232, "Magma Ball"],
    [0x8D4, 0x84, 89, "Reveal"],
    [0x9AE, 0x84, 169, "Parch"],
    [0x9BA, 0x84, 177, "Sand"],
    [0x9FA, 0x84, 233, "Blaze"],
    [0x90B, 0x84, 205, "Eclipse"],
    [0x945, 0x80, 207, "Center Prong"],
    [0x1, 0x80, 9, "Shaman's Rod"],
    [0x2, 0x84, 9, "Mind Read"],
    [0x3, 0x84, 9, "Whirlwind"],
    [0x4, 0x84, 9, "Growth"],
    [0x101, 0x80, 237, "Carry Stone"],
    [0x102, 0x80, 237, "Lifting Gem"],
    [0x103, 0x80, 237, "Orb of Force"],
    [0x104, 0x80, 237, "Catch Beads"],
    [0x105, 0x80, 111, "Douse Drop"],
    [0x106, 0x80, 111, "Frost Jewel"]
];

const replacePool = [
    [180, "Herb"], [181, "Nut"], [182, "Vial"], [187, "Antidote"], [188, "Elixir"], [228, "Game Ticket"], 
    [229, "Lucky Medal"], [238, "Oil Drop"], [239, "Weasel's Claw"], [240, "Bramble Seed"], [241, "Crystal Powder"]
];
const mimicPool = [
    [228, "Game Ticket"], [229, "Lucky Medal"], [194, "Hard Nut"], [183, "Potion"], [228, "Game Ticket"],
    [191, "Power Bread"], [186, "Psy Crystal"], [193, "Apple"], [192, "Cookie"]
];

var treasureMap = {};

function loadTreasure(rom, mapId, addr) {
    var treasure = {'mapId': mapId, 'addr': addr, 'locked': false, 'isSummon': false};
    treasure['eventType'] = readUint16(rom, addr);
    treasure['locationId'] = readUint16(rom, addr + 2);
    treasure['id'] = readUint16(rom, addr + 4);
    treasure['vanillaContents'] = readUint16(rom, addr + 6);
    treasure['isKeyItem'] = false;
    treasure['isMajorItem'] = false;
    treasure['isHidden'] = false;
    return treasure;
}

function readUint16(rom, addr) {
    return rom[addr] + (rom[addr + 1] << 8);
}

function overridePsynergyItems() {
    treasureMap['0x101'].forEach((t) => t['vanillaContents'] = 0xE93);
    treasureMap['0x102'].forEach((t) => t['vanillaContents'] = 0xE8F);
    treasureMap['0x103'].forEach((t) => t['vanillaContents'] = 0xE8E);
    treasureMap['0x104'].forEach((t) => t['vanillaContents'] = 0xE94);
    treasureMap['0x105'].forEach((t) => t['vanillaContents'] = 0xE21);
    treasureMap['0x106'].forEach((t) => t['vanillaContents'] = 0xE18);
    treasureMap['0x84a'].forEach((t) => t['vanillaContents'] = 0xE85);
    treasureMap['0x878'].forEach((t) => t['vanillaContents'] = 0xE86);
    treasureMap['0x88c'].forEach((t) => t['vanillaContents'] = 0xE88);
    treasureMap['0x918'].forEach((t) => t['vanillaContents'] = 0xE89);
    treasureMap['0x949'].forEach((t) => t['vanillaContents'] = 0xE97);
    treasureMap['0x94d'].forEach((t) => t['vanillaContents'] = 0xE99);
    treasureMap['0xf16'].forEach((t) => t['vanillaContents'] = 0xE87);
    treasureMap['0xf67'].forEach((t) => t['vanillaContents'] = 0xE98);
    treasureMap['0xffe'].forEach((t) => t['vanillaContents'] = 0xE9C);
}

function setLocked(treasure) {
    treasure['locked'] = true;
    treasure['name'] = treasure['vanillaName'];
    treasure['contents'] = treasure['vanillaContents'];
}

function prepItemLocations(locations, settings) {
    var itemSetting = settings['item-shuffle'];
    var omitSetting = settings['omit'];

    if (settings['gs1-items']) {
        locations['0xfd6'].forEach((t) => {
            t['vanillaContents'] = 268;
            t['vanillaName'] = "Cleric's Ring";
        });
        locations['0xfd8'].forEach((t) => {
            t['vanillaContents'] = 93;
            t['vanillaName'] = "Elven Shirt";
        });
    }

    if (settings['dummy-items']) {
        locations['0xfb0'].forEach((t) => {
            t['vanillaContents'] = 401;
            t['vanillaName'] = "Casual Shirt";
        });
        locations['0xfb1'].forEach((t) => {
            t['vanillaContents'] = 408;
            t['vanillaName'] = "Golden Boots";
        });
        locations['0xfb2'].forEach((t) => {
            t['vanillaContents'] = 411;
            t['vanillaName'] = "Aroma Ring";
        });
        locations['0xfb3'].forEach((t) => {
            t['vanillaContents'] = 400;
            t['vanillaName'] = "Golden Shirt";
        });
        locations['0xfb4'].forEach((t) => {
            t['vanillaContents'] = 407;
            t['vanillaName'] = "Ninja Sandals";
        });
        locations['0xfb5'].forEach((t) => {
            t['vanillaContents'] = 415;
            t['vanillaName'] = "Golden Ring";
        });
        locations['0xfcf'].forEach((t) => {
            t['vanillaContents'] = 399;
            t['vanillaName'] = "Herbed Shirt";
        });
        locations['0xfd0'].forEach((t) => {
            t['vanillaContents'] = 405;
            t['vanillaName'] = "Knight's Greave";
        });
        locations['0xfd1'].forEach((t) => {
            t['vanillaContents'] = 412;
            t['vanillaName'] = "Rainbow Ring";
        });
        locations['0xfd4'].forEach((t) => {
            t['vanillaContents'] = 398;
            t['vanillaName'] = "Divine Camisole";
        });
        locations['0xfd5'].forEach((t) => {
            t['vanillaContents'] = 406;
            t['vanillaName'] = "Silver Greave";
        });
        locations['0xfd7'].forEach((t) => {
            t['vanillaContents'] = 413;
            t['vanillaName'] = "Soul Ring";
        });
    }

    for (var flag in locations) {
        if (!locations.hasOwnProperty(flag)) continue;

        locations[flag].forEach((t) => {
            if (itemSetting == 0 || (itemSetting == 1 && !t['isKeyItem']) || (itemSetting == 2 && t['isHidden'])) {
                setLocked(t);
            }

            if (t['isKeyItem'] && (t['eventType'] < 0x80 || t['eventType'] == 0x83)) {
                t['eventType'] = 0x80;
            }
        });
    }

    if(omitSetting > 0) {
        if (omitSetting > 1) {
            locations['0x18'].forEach((t) => setLocked(t));
            locations['0x19'].forEach((t) => setLocked(t));
            locations['0x1a'].forEach((t) => setLocked(t));
        }
        locations['0xe05'].forEach((t) => setLocked(t));
        locations['0xe06'].forEach((t) => setLocked(t));
        locations['0x1b'].forEach((t) => setLocked(t));
        locations['0x1c'].forEach((t) => setLocked(t));
    }
}

function getUnlockedItems(locations) {
    var items = {};
    for (var flag in locations) {
        var treasure = locations[flag][0];
        if (treasure['locked']) {
            delete clone[flag];
        } else {
            items[flag] = JSON.parse(JSON.stringify(treasure));
        }
    }
    return items;
}

function initialise(rom, textutil, itemData) {
    treasureMap = {};

    var addr = addrFrom;
    while (addr < addrUntil) {
        var mapId = readUint16(rom, addr) & 0xFFF;
        addr += 4;

        while (addr < addrUntil) {
            var peek = readUint16(rom, addr);
            if (peek & 0x4000) break;

            var treasure = loadTreasure(rom, mapId, addr);
            var flag = treasure['id'];
            if ((treasure['id'] & 0xF00) != 0x300 && !unusedMaps.includes(mapId) && !unusedFlags.includes(flag)) {
                flag = "0x" + flag.toString(16);
                if (treasureMap.hasOwnProperty(flag)) {
                    treasureMap[flag].push(treasure);
                } else {
                    treasureMap[flag] = [treasure];
                }
            }
            addr += 8;
        }
    }

    for (var flag in treasureMap) {
        if (!treasureMap.hasOwnProperty(flag)) continue;

        treasureMap[flag].forEach((treasure) => {
            switch (treasure['eventType']) {
                case 0x81:
                    treasure['vanillaName'] = "Mimic";
                    break;
                case 0x84:
                    treasure['vanillaName'] = summonData[treasure['vanillaContents']];
                    treasure['vanillaContents'] += 0xF00;
                    treasure['isSummon'] = true;
                    treasure['isKeyItem'] = true;
                    treasure['isMajorItem'] = true;
                    break;
                default:
                    var item = treasure['vanillaContents'];
                    if (item < 0x8000) {
                        treasure['vanillaName'] = textutil.readLinePretty(undefined, item + itemNameOffset);
                        if (keyItems.includes(treasure['id'])) {
                            treasure['isKeyItem'] = true;
                            treasure['isMajorItem'] = true;
                        } else {
                            if (treasure['eventType'] < 0x80 || treasure['eventType'] == 0x85 
                                    || (treasure['eventType'] == 0x83 && treasure['id'] != 0xFC6)) {
                                treasure['isHidden'] = true;
                            } 
                            if (itemData.isIdEquipment(treasure['vanillaContents'])) {
                                if (!treasure['vanillaName'].startsWith("Rusty") || treasure['isHidden'])
                                    treasure['isMajorItem'] = true;
                            }
                        }
                    } else {
                        treasure['vanillaName'] = (item & 0xFFF).toString() + " coins";
                        if(treasure['eventType'] < 0x80 || treasure['eventType'] == 0x85 
                                || (treasure['eventType'] == 0x83 && treasure['id'] != 0xFC6))
                            treasure['isHidden'] = true;
                    }
            }
        });
    }

    specialLocations.forEach((entry, i) => {
        if (entry[0] == '0x901') return;

        var treasure = {'mapId': entry[2], 'locked': false, 'isSummon': false, 'isKeyItem': true, 'isMajorItem': true, 'isHidden': false};
        treasure['addr'] = specialLocOffset + (2 * i);
        treasure['eventType'] = entry[1];
        treasure['locationId'] = -1;
        treasure['id'] = entry[0];
        treasure['vanillaContents'] = readUint16(rom, treasure['addr']);
        treasure['vanillaName'] = entry[3];
        if (entry[0] == 0x90B) treasure['isSummon'] = true;
        
        var flag = "0x" + entry[0].toString(16);   
        if (treasureMap.hasOwnProperty(flag)) {
            treasureMap[flag].splice(0, 0, treasure);
        } else {
            treasureMap[flag] = [treasure];
        }
    });

    overridePsynergyItems();
    locations.markLocationMapNames(treasureMap);
}

function fixEventType(treasure, vanillaType) {
    var type = treasure['eventType'];
    var contents = treasure['contents'];

    if (vanillaType < 0x80 && type != 0x81) type = vanillaType;
    if (type != 0x81 && (vanillaType <= 0x80 || vanillaType == 0x83 || vanillaType == 0x84 || vanillaType == 0x85)) {
        treasure['eventType'] = vanillaType;
        return;
    }
    if (contents >= 0xE00 && contents <= 0xFFF) {
        treasure['eventType'] = (vanillaType != 0x83) ? 0x84 : 0x83;
        return;
    }
    if (vanillaType == 0x81) {
        if (contents >= 0xE00 && contents <= 0xFFF) {
            treasure['eventType'] = 0x84;
            return;
        } else if (type != 0x81) {
            treasure['eventType'] = 0x80;
            return;
        }
    }

    treasure['eventType'] = type;
}

function replaceMimic(treasure) {
    var mimicId = treasure['contents'];
    treasure['eventType'] = 0x83;
    treasure['contents'] = mimicPool[mimicId][0];
    treasure['name'] = mimicPool[mimicId][1] + " (Mimic)";
}

function replaceEmptyChest(prng, treasure) {
    var random = Math.floor(prng.random() * replacePool.length);
    treasure['eventType'] = 0x83;
    treasure['contents'] = replacePool[random][0];
    treasure['name'] = replacePool[random][1] + " (empty)";
}

function applyShowItemsSetting(prng, treasure, setting) {
    if (setting) {
        if (treasure['eventType'] == 0x80 || treasure['eventType'] == 0x84) {
            treasure['eventType'] = 0x83;
            if (treasure['contents'] == 0) replaceEmptyChest(prng, treasure);
        } else if (treasure['eventType'] == 0x81) {
            replaceMimic(treasure);
        }
    } else {
        if (treasure['eventType'] == 0x80 || treasure['eventType'] == 0x84) {
            if (treasure['contents'] >= 0xE00 && treasure['contents'] <= 0xFFF) {
                treasure['eventType'] = 0x84;
            } else {
                treasure['eventType'] = 0x80;
            }
        }
    }
}

function writeToRom(instance, prng, target, showItems) {
    for (var flag in instance) {
        if (!instance.hasOwnProperty(flag)) continue;
        instance[flag].forEach((t, i) => {
            var vanillaEventType = treasureMap[flag][i]['eventType'];

            fixEventType(t, vanillaEventType);
            applyShowItemsSetting(prng, t, showItems);
            if ((t['eventType'] < 0x80 || t['eventType'] == 0x83) && t['contents'] == 0) {
                t['contents'] = 228;
                t['name'] = "Game Ticket";
            }

            var addr = t['addr'];
            var eventType = t['eventType'];
            var contents = t['contents'];

            if (addr >= 0xFA0000) {
                target[addr] = (contents & 0xFF);
                target[addr + 1] = (contents >> 8);
            } else {
                target[addr] = (eventType & 0xFF);
                target[addr + 1] = (eventType >> 8);
                target[addr + 6] = (contents & 0xFF);
                target[addr + 7] = (contents >> 8);
            }
        });
    }
}

function clone() {
    return JSON.parse(JSON.stringify(treasureMap));
}

module.exports = {initialise, setLocked, clone, prepItemLocations, getUnlockedItems, writeToRom};