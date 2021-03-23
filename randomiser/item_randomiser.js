const locations = require('./locations.js');
const itemLocations = require('./game_data/item_locations.js');

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
        this.accessibleItems.forEach((slot) => {
            var weight = this.slotWeights[slot];
            if (weight != undefined) {
                accessibleSlots.push(slot);
                totalWeight += weight;
            }
        });

        var slot;
        var rand = this.prng.random() * totalWeight;
        for (var i = 0; i < accessibleSlots.length && rand > 0; ++i) {
            slot = accessibleSlots[i];
            rand -= this.slotWeights[slot];
        }

        this.instItemLocations[slot].forEach((t) => {
            t['eventType'] = item['eventType'];
            t['contents'] = item['vanillaContents'];
            t['name'] = item['vanillaName'];
            t['isKeyItem'] = item['isKeyItem'];
        });

        accessibleSlots.forEach((slot) => this.slotWeights[slot] *= Math.max(this.prng.random(), 0.1));
        delete this.slotWeights[slot];
        delete this.availableItems['0x' + item['id'].toString(16)];
    }

    isSlotCompatible(slot, item) {
        if (item['isSummon']) {
            var loc;
            this.instLocations[0].forEach((i) => {
                if (i.Addr == slot) {
                    loc = i;
                    return;
                }
            });
            if (loc['Restriction'] == 'no-summon' && this.settings['item-shuffle'] > 1) return false;
        }

        var slotItem = this.instItemLocations[slot][0];
        var isMimic = item['eventType'] == 0x81;
        var isEmpty = item['vanillaContents'] == 0;
        var isMoney = item['vanillaContents'] > 0x8000;

        if (isMimic && slotItem['eventType'] != 0x80 && slotItem['eventType'] != 0x84) return false;
        if (isEmpty && slotItem['eventType'] != 0x80 && slotItem['eventType'] != 0x84) return false;
        if (isMoney && slotItem['addr'] > 0xFA0000) return false;
        if ((isMimic || isEmpty || isMoney) && (slot < 0x10 || (slot & 0xF00) == 0x100)) return false;
        return true;
    }

    randomFill(item) {
        if (item['isKeyItem'])
            this.flagSet.push(item['vanillaName']);

        var accessibleSlots = [];
        this.accessibleItems.forEach((slot) => {
            if (this.slotWeights[slot] != undefined)
                accessibleSlots.push(slot);
        });

        var slot = accessibleSlots[Math.floor(this.prng.random() * accessibleSlots.length)];
        while (!this.isSlotCompatible(slot, item)) {
            slot = accessibleSlots[Math.floor(this.prng.random() * accessibleSlots.length)];
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
        if (this.settings['ship'] == 1) set.push('ShipOpen');
        if (this.settings['ship'] == 2) set.push('Ship');
        if (this.settings['skips-basic']) set.push('SkipBasic');
        if (this.settings['skips-adv']) set.push('SkipAdv');
        if (this.settings['skips-maze']) set.push('SkipMaze');
        return set;
    }

    shuffleItems(instItemLocations) {
        this.instItemLocations = instItemLocations;
        var biasEarly = ['0x84a', '0x878', '0x105', '0x106', '0x88c', '0x9ba', '0x3', '0x8ff'];
        if (this.settings['item-shuffle'] == 1) {
            biasEarly = biasEarly.concat(['0x918', '0xf67']);
            if (!this.settings['start-reveal']) biasEarly.push('0x8d4');
        }

        this.availableItems = itemLocations.getUnlockedItems(instItemLocations);
        this.slotWeights = {};

        for (var flag in this.availableItems) {
            this.slotWeights[flag] = 1;
        }

        this.flagSet = this.getInitialFlagSet();
        this.updateAccessibleItems();

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

    getSpheres() {
        if (this.instItemLocations == undefined) return;
        var spheres = [];
        var flagSet = this.getInitialFlagSet();
        var accessibleItems = locations.getAccessibleItems(this.instLocations, flagSet);
        var checkedItems = [];

        var i = 0;
        while (true) {
            var sphere = [];
            accessibleItems.forEach((slot) => {
                if (checkedItems.includes(slot)) return;
                if (this.instItemLocations[slot][0]['isKeyItem']) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    flagSet.push(this.instItemLocations[slot][0]['name']);
                }
            });

            if (sphere.length == 0) break;
            spheres.push(sphere);

            accessibleItems = locations.getAccessibleItems(this.instLocations, flagSet);
            ++i;
        }
        return spheres;
    }
}

module.exports = {ItemRandomiser};