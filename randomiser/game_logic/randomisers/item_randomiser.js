const locations = require('../locations.js');
const itemLocations = require('../../game_data/item_locations.js');
const itemData = require('../../game_data/items.js');
const shopData = require('../../game_data/shops.js');
const forgeData = require('../../game_data/forgeables.js');

const summonIds = [3856, 3857, 3858, 3859, 3860, 3861, 3862, 3863, 3864, 3865, 3866, 3867, 3868];
const summonNames = ["Zagan", "Megaera", "Flora", "Moloch", "Ulysses", "Haures", "Eclipse", "Coatlicue", 
    "Daedalus", "Azul", "Catastrophe", "Charon", "Iris"];

class ItemRandomiser {
    constructor(prng, instLocations, settings) {
        this.prng = prng;
        this.instLocations = instLocations;
        this.settings = settings;
    }

    fixedFill(item, slot) {
        if (item['isKeyItem'])
            this.flagSet.push(item['vanillaName']);

        this.instItemLocations[slot].forEach((t) => {
            t['eventType'] = item['eventType'];
            t['contents'] = item['vanillaContents'];
            t['name'] = item['vanillaName'];
            t['isKeyItem'] = item['isKeyItem'];
        });

        delete this.slotWeights[slot];
        delete this.availableItems['0x' + item['id'].toString(16)];
    }

    weightedFill(item) {
        if (item['isKeyItem'])
            this.flagSet.push(item['vanillaName']);

        var accessibleSlots = [];
        var totalWeight = 0;
        var forcedSlot = undefined;
        this.accessibleItems.forEach((slot) => {
            if ((item.vanillaContents & 0xF00) == 0xD00 && this.hasRestriction('no-summon', this.instItemLocations[slot][0]))
                return;

            if (this.settings['major-shuffle'] && (item['isMajorItem'] != this.instItemLocations[slot][0]['isMajorItem']))
                return;

            if (item['isMajorItem'] && this.instItemLocations[slot][0]['forcedMinor'])
                return;

            var weight = this.slotWeights[slot];
            if (weight != undefined) {
                if (item['isKeyItem'] && this.instItemLocations[slot][0]['forcedMajor'] && !forcedSlot) {
                    forcedSlot = slot;
                }

                accessibleSlots.push(slot);
                totalWeight += weight;
            }
        });

        var slot;
        if (forcedSlot) {
            slot = forcedSlot;
        } else {
            var rand = this.prng.random() * totalWeight;
            for (var i = 0; i < accessibleSlots.length && rand > 0; ++i) {
                slot = accessibleSlots[i];
                rand -= this.slotWeights[slot];
            }
        }

        this.instItemLocations[slot].forEach((t) => {
            t['eventType'] = item['eventType'];
            t['contents'] = item['vanillaContents'];
            t['name'] = item['vanillaName'];
            t['isKeyItem'] = item['isKeyItem'];
        });

        accessibleSlots.forEach((slot) => this.slotWeights[slot] *= ((forcedSlot ? 0.95 : 0.65) * Math.max(this.prng.random(), 0.1)));
        delete this.slotWeights[slot];
        delete this.availableItems['0x' + item['id'].toString(16)];
    }

    hasRestriction(restriction, location) {
        var loc;
        for (var i = 0; i < this.instLocations[0].length; ++i) {
            loc = this.instLocations[0][i];
            if (loc.Addr == location.id) break;
        }
        if (!loc.hasOwnProperty("Restriction")) return false;
        if (loc['Restriction'] === restriction) return true;
        return loc['Restriction'].includes(restriction);
    }

    isSlotCompatible(slot, item) {
        var slotItem = this.instItemLocations[slot][0];
        var isMimic = item['eventType'] == 0x81;
        var isEmpty = item['vanillaContents'] == 0;
        var isMoney = item['vanillaContents'] > 0x8000;
        var isCharacter = (item['vanillaContents'] & 0xF00) == 0xD00;

        if (this.settings['major-shuffle']) {
            if (item['isMajorItem'] != slotItem['isMajorItem']) return false;
        }
        if (item['isKeyItem'] && slotItem['forcedMinor'] && this.settings['item-shuffle'] > 1) return false;

        if (item['isSummon']) {
            if (this.hasRestriction('no-summon', slotItem) && this.settings['item-shuffle'] > 1) return false;
        }
        if (isCharacter && this.hasRestriction('no-summon', slotItem)) return false;

        if (isMimic || isEmpty) {
            if (slotItem['eventType'] != 0x80 && slotItem['eventType'] != 0x84) return false;
            if (!this.settings['show-items']) {
                if (isMimic && this.hasRestriction('no-mimic', slotItem)) return false;
                if (isEmpty && this.hasRestriction('no-empty', slotItem)) return false;
            }
        }

        if (isMoney && slotItem['addr'] > 0xFA0000) return false;
        if ((isMimic || isEmpty || isMoney) && (slotItem['id'] < 0x10 || (slotItem['id'] & 0xF00) == 0x100)) return false;
        return true;
    }

    randomFill(item) {
        if (item['isKeyItem'])
            this.flagSet.push(item['vanillaName']);

        var accessibleSlots = [];
        var forcedSlot = undefined;
        this.accessibleItems.forEach((slot) => {
            if (this.slotWeights[slot] != undefined) {
                accessibleSlots.push(slot);
                if (item['isKeyItem'] && this.instItemLocations[slot][0]['forcedMajor'] && this.isSlotCompatible(slot, item) && !forcedSlot) {
                    forcedSlot = slot;
                }
            }
        });

        var slot;
        if (forcedSlot) {
            slot = forcedSlot
        } else {
            slot = accessibleSlots[Math.floor(this.prng.random() * accessibleSlots.length)];
            while (!this.isSlotCompatible(slot, item)) {
                slot = accessibleSlots[Math.floor(this.prng.random() * accessibleSlots.length)];
            }
        }

        this.instItemLocations[slot].forEach((t) => {
            t['eventType'] = item['eventType'];
            t['contents'] = item['vanillaContents'];
            t['name'] = item['vanillaName'];
            t['isKeyItem'] = item['isKeyItem'];
        });

        delete this.slotWeights[slot];
        delete this.availableItems['0x' + item['id'].toString(16)];
    }

    updateAccessibleItems() {
        this.accessibleItems = locations.getAccessibleItems(this.instLocations, this.flagSet);
    }

    getInitialFlagSet() {
        var set = [];
        if (this.settings['boss-logic']) set.push('NoBossLogic');
        if (this.settings['ship'] == 1) set.push('ShipOpen');
        if (this.settings['ship'] == 2) set.push('Ship');
        if (this.settings['ship-wings']) set.push('ShipWings');
        if (this.settings['skips-basic']) set.push('SkipBasic');
        if (this.settings['skips-oob-easy']) set.push('SkipOobEasy');
        if (this.settings['skips-oob-hard']) set.push('SkipOobHard');
        if (this.settings['skips-maze']) set.push('SkipMaze');
        if (!this.settings['shuffle-characters']) set.push('VanillaCharacters');
        return set;
    }

    shuffleItems(instItemLocations) {
        this.instItemLocations = instItemLocations;
        if (this.settings['item-shuffle'] == 0) return;

        var biasEarly = [];
        if (this.settings['item-shuffle'] == 1 || this.settings['ship'] < 2) {
            biasEarly = ['0x84a', '0x878', '0x105', '0x106', '0x88c', '0x9ba', '0x3'];
            if (this.settings['item-shuffle'] == 1) {
                biasEarly = biasEarly.concat(['0x918', '0xf67']);
                if (!this.settings['start-reveal']) biasEarly.push('0x8d4');
                if (this.settings['shuffle-characters']) biasEarly = biasEarly.concat(['0xd05', '0xd06', '0xd07', '0xd00', '0xd01', '0xd02', '0xd03']);
            }
            if (this.settings['ship'] == 0) {
                biasEarly.push('0x8ff');
                if (this.settings['shuffle-characters'] && !biasEarly.includes('0xd07')) biasEarly.push('0xd07');
            }
        }

        this.availableItems = itemLocations.getUnlockedItems(instItemLocations);
        this.slotWeights = {};

        for (var flag in this.availableItems) {
            if (!this.settings['major-shuffle'] && this.settings['item-shuffle'] > 0) {
                let slot = this.availableItems[flag];
                if (slot.id >= 0xFCF && slot.id <= 0xFD8) {
                    this.slotWeights[flag] = 0.25;
                } else if (slot.id >= 0xFB0 && slot.id <= 0xFB5) {
                    this.slotWeights[flag] = 0.75;
                } else {
                    this.slotWeights[flag] = 1;
                }
            } else {
                this.slotWeights[flag] = 1;
            }
        }

        this.flagSet = this.getInitialFlagSet();
        this.updateAccessibleItems();

        if (this.settings['shuffle-characters']) {
            var flag = `0xd0${Math.floor(this.prng.random() * 8)}`;
            while (flag == '0xd04') flag = `0xd0${Math.floor(this.prng.random() * 8)}`;

            this.fixedFill(this.availableItems[flag], '0xd05');
            this.updateAccessibleItems();
            if (biasEarly.includes(flag)) {
                biasEarly.splice(biasEarly.indexOf(flag), 1);
            }
        }

        if (this.settings['start-reveal']) {
            this.fixedFill(this.availableItems['0x8d4'], '0x1');
            this.updateAccessibleItems();
        }

        while (biasEarly.length > 0) {
            var i = Math.floor(this.prng.random() * biasEarly.length);
            this.weightedFill(this.availableItems[biasEarly.splice(i, 1)]);
            this.updateAccessibleItems();
        }

        var keyItems = [];
        for (var flag in this.availableItems) {
            if (!this.availableItems.hasOwnProperty(flag)) return;

            var item = this.availableItems[flag];
            if (item['isKeyItem'] && !item['isSummon'])
                keyItems.push(item);
        }

        var shuffledKeyItems = [];
        while (keyItems.length > 0) {
            var i = this.prng.random() * keyItems.length;
            shuffledKeyItems.push(keyItems.splice(i, 1)[0]);
        }
        shuffledKeyItems.forEach((item) => {
            this.weightedFill(item);
            this.updateAccessibleItems();
        });

        for (var flag in this.availableItems) {
            if (!this.availableItems.hasOwnProperty(flag)) return;

            var item = this.availableItems[flag];
            if (item['isSummon'] || item['eventType'] == 0x81 || item['vanillaContents'] == 0 || item['vanillaContents'] > 0x8000) {
                this.randomFill(item);
                this.updateAccessibleItems();
            }
        }

        for (var flag in this.availableItems) {
            this.randomFill(this.availableItems[flag]);
            this.updateAccessibleItems();
        }
    }

    shuffleEquipmentAdvanced(prng, instItems, instShops, instForge) {
        var equipmentSlots = [];
        var equipment = [];

        for (var slot in this.instItemLocations) {
            if (!this.instItemLocations.hasOwnProperty(slot)) continue;

            var item = this.instItemLocations[slot][0];
            if (item['eventType'] == 0x81) continue;

            var data = instItems[item.contents];
            if (!data || data.name.startsWith("Rusty ") || data.name == "Shaman's Rod") continue;
            if (data.itemType == 1 || itemData.isArmour(data.itemType)) {
                equipmentSlots.push(slot);
                equipment.push(item.contents);
            }
        }

        equipment = equipment.concat(forgeData.getAllEquipment(instForge, instItems))
            .concat(shopData.getAllEquipmentArtifacts(instShops, instItems));

        equipmentSlots.forEach((slot) => {
            var rand = Math.floor(prng.random() * equipment.length);
            var item = equipment.splice(rand, 1)[0];
            this.instItemLocations[slot].forEach((loc) => {
                loc['locked'] = false;
                loc['contents'] = item;
                loc['name'] = instItems[item].name;
            });
        });

        forgeData.shuffleEquipment(instForge, prng, equipment);
        shopData.shuffleEquipmentArtifacts(instShops, instItems, prng, equipment);
    }

    sortEquipment(instItems) {
        var spheres = this.getSpheres(true);
        var weaponSlots = [];
        var armourSlots = [];
        var weapons = [];
        var armour = [];

        spheres.forEach((sphere) => {
            weaponSlots.push([]);
            armourSlots.push([]);
            sphere.forEach((slot) => {
                var item = this.instItemLocations[slot][0];
                if (item['eventType'] == 0x81) return;

                var data = instItems[item.contents];
                if (!data || data.name.startsWith("Rusty ") || data.name == "Shaman's Rod") return;
                if (data.itemType == 1) {
                    weaponSlots[weaponSlots.length - 1].push(slot);
                    weapons.push(item.contents);
                } else if (data.itemType >= 2 && data.itemType <= 4) {
                    armourSlots[armourSlots.length - 1].push(slot);
                    armour.push(item.contents);
                }
            });
        });

        weapons = itemData.sortWeaponArray(instItems, weapons);
        armour = itemData.sortArmourArray(instItems, armour);

        var weaponCount = 0, armourCount = 0;
        weaponSlots.forEach((sphere) => {
            while (sphere.length > 0) {
                var rand = Math.floor(this.prng.random() * sphere.length);
                var itemLoc = this.instItemLocations[sphere.splice(rand, 1)[0]];
                itemLoc.forEach((item) => {
                    item['locked'] = false;
                    item['contents'] = weapons[weaponCount];
                    item['name'] = instItems[weapons[weaponCount]].name;
                });
                ++weaponCount;
            }
        });
        armourSlots.forEach((sphere) => {
            while (sphere.length > 0) {
                var rand = Math.floor(this.prng.random() * sphere.length);
                var itemLoc = this.instItemLocations[sphere.splice(rand, 1)[0]];
                itemLoc.forEach((item) => {
                    item['locked'] = false;
                    item['contents'] = armour[armourCount];
                    item['name'] = instItems[armour[armourCount]].name;
                });
                ++armourCount;
            }
        });
    }

    sortSummons() {
        var spheres = this.getSpheres(true);
        var slots = [];

        spheres.forEach((sphere) => {
            slots.push([]);
            sphere.forEach((slot) => {
                var item = this.instItemLocations[slot][0];
                if (summonIds.includes(item['contents']))
                    slots[slots.length - 1].push(slot);
            });
        });

        var count = 0;
        slots.forEach((sphere) => {
            while (sphere.length > 0) {
                var rand = Math.floor(this.prng.random() * sphere.length);
                var itemLoc = this.instItemLocations[sphere.splice(rand, 1)[0]];
                itemLoc.forEach((item) => {
                    item['locked'] = false;
                    item['contents'] = summonIds[count];
                    item['name'] = summonNames[count];
                });
                ++count;
            }
        });
    }

    sortMimics() {
        var spheres = this.getSpheres(true);
        var count = 0;
        spheres.forEach((sphere) => {
            sphere.forEach((slot) => {
                var itemLoc = this.instItemLocations[slot];
                if (itemLoc[0]['name'] == "Mimic") {
                    itemLoc.forEach((item) => { item['contents'] = count });
                    ++count;
                }
            });
        });
    }

    getSpheres(allItems = false) {
        if (this.instItemLocations == undefined) return;
        var spheres = [];
        var flagSet = this.getInitialFlagSet();
        var accessibleItems = locations.getAccessibleItems(this.instLocations, flagSet);
        var checkedItems = [];

        var i = 0;
        while (true) {
            var sphere = [];
            var characterItems = [];

            accessibleItems.forEach((slot) => {
                if (checkedItems.includes(slot)) return;
                if (allItems || this.instItemLocations[slot][0]['isKeyItem']) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    flagSet.push(this.instItemLocations[slot][0]['name']);
                }

                if (this.instItemLocations[slot][0]['contents'] == 0xD00) {
                    characterItems.push('0x104');
                }
                if (this.instItemLocations[slot][0]['contents'] == 0xD01) {
                    characterItems.push('0x103');
                }
                if (this.instItemLocations[slot][0]['contents'] == 0xD02) {
                    characterItems.push('0x102');
                }
                if (this.instItemLocations[slot][0]['contents'] == 0xD03) {
                    characterItems.push('0x101');
                }
                if (this.instItemLocations[slot][0]['contents'] == 0xD06) {
                    characterItems.push('0x2');
                    characterItems.push('0x3');
                }
                if (this.instItemLocations[slot][0]['contents'] == 0xD07) {
                    characterItems.push('0x105');
                    characterItems.push('0x106');
                }
            });

            if (sphere.length == 0) break;
            accessibleItems = locations.getAccessibleItems(this.instLocations, flagSet.filter((flag) => flag != undefined));

            characterItems.forEach((slot) => {
                if (checkedItems.includes(slot) || !accessibleItems.includes(slot)) return;
                if (allItems || this.instItemLocations[slot][0]['isKeyItem']) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    flagSet.push(this.instItemLocations[slot][0]['name']);
                }
            });

            spheres.push(sphere);
            accessibleItems = locations.getAccessibleItems(this.instLocations, flagSet.filter((flag) => flag != undefined));
            ++i;
        }
        return spheres;
    }
}

module.exports = {ItemRandomiser};