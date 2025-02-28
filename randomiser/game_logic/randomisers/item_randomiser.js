const {BaseRandomiser} = require('./base_randomiser.js');
const locations = require('../locations.js');
const itemLocations = require('../../game_data/item_locations.js');

class ItemRandomiser extends BaseRandomiser {

    #locations;

    constructor(prng, instLocations, settings) {
        super(prng, settings);
        this.#locations = instLocations;
    }

    locHasRestriction(itemLoc, restriction) {
        var loc;
        for (var i = 0; i < this.#locations[0].length; ++i) {
            loc = this.#locations[0][i];
            if (loc.Addr == itemLoc.id) break;
        }
        if (!loc.hasOwnProperty("Restriction")) return false;
        if (loc['Restriction'] === restriction) return true;
        return loc['Restriction'].includes(restriction);
    }

    updateAccessibleItems() {
        this.accessibleItems = locations.getAccessibleItems(this.#locations, this.flagSet);
    }

    getInitialFlagSet() {
        var set = [];
        if (this.settings['boss-logic']) set.push('NoBossLogic');
        if (this.settings['ship'] == 1) set.push('ShipOpen');
        if (this.settings['ship'] == 2) set.push('Ship');
        if (this.settings['ship-wings']) set.push('ShipWings');
        if (!this.settings['shuffle-characters']) set.push('VanillaCharacters');

        if (this.settings['skips-basic']) set.push('Skips_BasicRG');
        if (this.settings['skips-sq']) set.push('Skips_SaveQuitRG');
        if (this.settings['skips-maze']) set.push('Skips_Maze');
        if (this.settings['skips-sanctum']) set.push('Skips_SanctumWarp');
        if (this.settings['skips-wiggle']) set.push('Skips_WiggleClip');
        if (this.settings['skips-missable']) set.push('Skips_Missable');
        if (this.settings['skips-oob']) set.push('Skips_OOBRG');
        if (this.settings['skips-sand']) set.push('Skips_SandGlitch');
        if (this.settings['skips-storage']) set.push('Skips_DeathStorage');

        return set;
    }

    shuffleItems(instItemLocations) {
        this.itemLocations = instItemLocations;
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

        this.availableItems = itemLocations.getUnlockedItems(this.itemLocations);
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

    getSpheres(allItems = false) {
        if (this.itemLocations == undefined) return;
        var spheres = [];
        var flagSet = this.getInitialFlagSet();
        var accessibleItems = locations.getAccessibleItems(this.#locations, flagSet);
        var checkedItems = [];

        var i = 0;
        while (true) {
            var sphere = [];
            var characterItems = [];

            accessibleItems.forEach((slot) => {
                if (checkedItems.includes(slot)) return;
                if (allItems || this.itemLocations[slot][0]['isKeyItem']) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    flagSet.push(this.itemLocations[slot][0]['name']);
                }

                if (this.itemLocations[slot][0]['contents'] == 0xD00) {
                    characterItems.push('0x104');
                }
                if (this.itemLocations[slot][0]['contents'] == 0xD01) {
                    characterItems.push('0x103');
                }
                if (this.itemLocations[slot][0]['contents'] == 0xD02) {
                    characterItems.push('0x102');
                }
                if (this.itemLocations[slot][0]['contents'] == 0xD03) {
                    characterItems.push('0x101');
                }
                if (this.itemLocations[slot][0]['contents'] == 0xD06) {
                    characterItems.push('0x2');
                    characterItems.push('0x3');
                }
                if (this.itemLocations[slot][0]['contents'] == 0xD07) {
                    characterItems.push('0x105');
                    characterItems.push('0x106');
                }
            });

            if (sphere.length == 0) break;
            accessibleItems = locations.getAccessibleItems(this.#locations, flagSet.filter((flag) => flag != undefined));

            characterItems.forEach((slot) => {
                if (checkedItems.includes(slot) || !accessibleItems.includes(slot)) return;
                if (allItems || this.itemLocations[slot][0]['isKeyItem']) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    flagSet.push(this.itemLocations[slot][0]['name']);
                }
            });

            spheres.push(sphere);
            accessibleItems = locations.getAccessibleItems(this.#locations, flagSet.filter((flag) => flag != undefined));
            ++i;
        }
        return spheres;
    }
}

module.exports = {ItemRandomiser};