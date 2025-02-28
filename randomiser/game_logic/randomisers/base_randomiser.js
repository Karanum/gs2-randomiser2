const itemData = require('../../game_data/items.js');
const shopData = require('../../game_data/shops.js');
const forgeData = require('../../game_data/forgeables.js');

const summonNames = ["Zagan", "Megaera", "Flora", "Moloch", "Ulysses", "Haures", "Eclipse", "Coatlicue", 
    "Daedalus", "Azul", "Catastrophe", "Charon", "Iris"];

class BaseRandomiser {

    prng;
    settings;

    itemLocations;

    availableItems = {};
    slotWeights = {};
    flagSet = [];
    accessibleItems = [];

    // Constructor
    constructor(prng, settings) {
        this.prng = prng;
        this.settings = settings;
    }

    // Writes an item to the specified item location slot
    writeItemToLoc(item, slot) {
        this.itemLocations[slot].forEach((t) => {
            t.eventType = item.eventType;
            t.contents = item.vanillaContents;
            t.name = item.vanillaName;
            t.isKeyItem = item.isKeyItem;
        });

        delete this.slotWeights[slot];
        delete this.availableItems['0x' + item['id'].toString(16)];
    }

    // Fills an item location slot with a fixed item
    fixedFill(item, slot) {
        if (item.isKeyItem)
            this.flagSet.push(item.vanillaName);
        this.writeItemToLoc(item, slot)
    }

    // Picks a weighted random accessible item location slot and fills it with the given item
    weightedFill(item) {
        if (item.isKeyItem)
            this.flagSet.push(item.vanillaName);

        let accessibleSlots = [];
        let totalWeight = 0;
        let forcedSlot = undefined;

        this.accessibleItems.filter((slot) => {
            if ((item.vanillaContents & 0xF00) == 0xD00 & this.locHasRestriction(this.itemLocations[slot][0], 'no-summon'))
                return false;
            if (this.settings['major-shuffle'] && (item.isMajorItem != this.itemLocations[slot][0].isMajorItem))
                return false;
            if (item.isMajorItem && this.itemLocations[slot][0].forcedMinor)
                return false;
            return true;
        })
        .forEach((slot) => {
            let weight = this.slotWeights[slot];
            if (weight == undefined) return;

            if (item.isKeyItem && this.itemLocations[slot][0].forcedMajor && !forcedSlot)
                forcedSlot = slot;

            accessibleSlots.push(slot);
            totalWeight += weight;
        });

        let slot = forcedSlot;
        if (!slot) {
            let rand = this.prng.random() * totalWeight;
            for (let i = 0; i < accessibleSlots.length && rand > 0; ++i) {
                slot = accessibleSlots[i];
                rand -= this.slotWeights[slot];
            }
        }

        accessibleSlots.forEach((slot) => this.slotWeights[slot] *= ((forcedSlot ? 0.95 : 0.65) * Math.max(this.prng.random(), 0.1)));
        this.writeItemToLoc(item, slot);
    }

    // Fills a fully random item location slot with the given item
    randomFill(item) {
        if (item.isKeyItem)
            this.flagSet.push(item.vanillaName);

        let accessibleSlots = [];
        let forcedSlot = undefined;

        this.accessibleItems.forEach((slot) => {
            if (this.slotWeights[slot] == undefined) return;

            accessibleSlots.push(slot);
            if (item.isKeyItem && this.itemLocations[slot][0].forcedMajor && this.isSlotCompatible(slot, item) && !forcedSlot)
                forcedSlot = slot;
        });

        if (accessibleSlots.length == 0) {
            console.warn('[WARN] Random item fill had to target an inaccessible item slot');
            accessibleSlots = [...Object.keys(this.slotWeights)];
        }

        let slot = forcedSlot;
        if (!slot) {
            slot = accessibleSlots[Math.floor(this.prng.random() * accessibleSlots.length)];
            while (!this.isSlotCompatible(slot, item)) {
                slot = accessibleSlots[Math.floor(this.prng.random() * accessibleSlots.length)];
            }
        }

        this.writeItemToLoc(item, slot);
    }

    // Returns whether an item location slot can be filled with the given item
    isSlotCompatible(slot, item) {
        let slotItem = this.itemLocations[slot][0];
        let isMimic = item.eventType == 0x81;
        let isEmpty = item.vanillaContents == 0;
        let isMoney = item.vanillaContents > 0x8000;
        let isCharacter = (item.vanillaContents & 0xF00) == 0xD00;

        if (this.settings['major-shuffle'] && item.isMajorItem != slotItem.isMajorItem) return false;
        if (this.settings['item-shuffle'] > 1) {
            if (item.isKeyItem && slotItem.forcedMinor) return false;
            if (item.isSummon && this.locHasRestriction(slotItem, 'no-summon')) return false;
        }
        if (isCharacter && this.locHasRestriction(slotItem, 'no-summon')) return false;
        
        if (isMimic || isEmpty) {
            if (slotItem.eventType != 0x80 && slotItem.eventType != 0x84) return false;
            if (!this.settings['show-items']) {
                if (isMimic && this.locHasRestriction(slotItem, 'no-mimic')) return false;
                if (isEmpty && this.locHasRestriction(slotItem, 'no-empty')) return false;
            } else if (!this.settings['remove-mimics']) {
                if (isMimic && this.locHasRestriction(slotItem, 'no-mimic')) return false;
            }
        }

        if (isMoney && slotItem.addr >= 0xFA0000) return false;
        if ((isMimic || isEmpty || isMoney) && (slotItem.id < 0x10 || (slotItem.id & 0xF00) == 0x100)) return false;

        return true;
    }

    // Shuffles equipment post-randomisation, including shop and forge items
    shuffleEquipmentAdvanced(instItems, instShops, instForge) {
        let equipmentSlots = [];
        let equipment = [];

        Object.keys(this.itemLocations).forEach((slot) => {
            let item = this.itemLocations[slot][0];
            if (item.eventType == 0x81) return;

            let data = instItems[item.contents];
            if (!data || data.name.startsWith("Rusty ") || data.name == "Shaman's Rod") return;
            if (data.itemType == 1 || itemData.isArmour(data.itemType)) {
                equipmentSlots.push(slot);
                equipment.push(item.contents);
            }
        });

        equipment = [...equipment, ...forgeData.getAllEquipment(instForge, instItems), ...shopData.getAllEquipmentArtifacts(instShops, instItems)];

        equipmentSlots.forEach((slot) => {
            let item = equipment.splice(Math.floor(this.prng.random() * equipment.length), 1)[0];
            this.itemLocations[slot].forEach((loc) => {
                loc.locked = false;
                loc.contents = item;
                loc.name = instItems[item].name;
            })
        });

        forgeData.shuffleEquipment(instForge, this.prng, equipment);
        shopData.shuffleEquipmentArtifacts(instShops, instItems, this.prng, equipment);
    }

    // Sorts all equipment item locations by Attack/Defense values
    sortEquipment(instItems) {
        let spheres = this.getSpheres(true);
        let weaponSlots = [], armourSlots = [];
        let weapons = [], armour = [];

        spheres.forEach((sphere) => {
            weaponSlots.push([]);
            armourSlots.push([]);
            sphere.forEach((slot) => {
                let item = this.itemLocations[slot][0];
                if (item.eventType == 0x81) return;

                let data = instItems[item.contents];
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

        let weaponCount = 0, armourCount = 0;
        weaponSlots.forEach((sphere) => {
            while (sphere.length > 0) {
                var itemLoc = this.itemLocations[sphere.splice(Math.floor(this.prng.random() * sphere.length), 1)[0]];
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
                var itemLoc = this.itemLocations[sphere.splice(Math.floor(this.prng.random() * sphere.length), 1)[0]];
                itemLoc.forEach((item) => {
                    item['locked'] = false;
                    item['contents'] = armour[armourCount];
                    item['name'] = instItems[armour[armourCount]].name;
                });
                ++armourCount;
            }
        });
    }

    // Sorts all summon tablet item locations by summon ID
    sortSummons() {
        let spheres = this.getSpheres(true);
        let slots = [];

        spheres.forEach((sphere) => {
            slots.push([]);
            sphere.forEach((slot) => {
                let item = this.itemLocations[slot][0];
                if (item.contents >= 0xF10 && item.contents <= 0xF1C)
                    slots[slots.length - 1].push(slot);
            });
        });

        let count = 0;
        slots.forEach((sphere) => {
            while (sphere.length > 0) {
                var itemLoc = this.itemLocations[sphere.splice(Math.floor(this.prng.random() * sphere.length), 1)[0]];
                itemLoc.forEach((item) => {
                    item['locked'] = false;
                    item['contents'] = 0xF10 + count;
                    item['name'] = summonNames[count];
                });
                ++count;
            }
        });
    }

    // Sorts all mimic item locations by mimic ID
    sortMimics() {
        let spheres = this.getSpheres(true);
        let count = 0;
        spheres.forEach((sphere, i) => {
            let maxMimicLevel = Math.ceil(((i + 1) / spheres.length) * 10);
            sphere.forEach((slot) => {
                let itemLoc = this.itemLocations[slot];
                if (itemLoc[0].name == "Mimic") {
                    itemLoc.forEach((item) => { item.contents = Math.min(count, maxMimicLevel) });
                    ++count;
                }
            });
        });
    }

    // [Abstract] Returns whether the specified item location carries a given restriction
    locHasRestriction(itemLoc, restriction) {
        return false;
    }

    // [Abstract] Updates the array of accessible item locations
    updateAccessibleItems() {
        this.accessibleItems = [];
    }

    // [Abstract] Returns the initial flag set for the randomiser for the provided settings
    getInitialFlagSet() {
        return [];
    }

    // [Abstract] Returns a multi-dimensional array of all (key) item locations per sphere depth
    getSpheres(allItems = false) {
        return [];
    }
    
}

module.exports = {BaseRandomiser};