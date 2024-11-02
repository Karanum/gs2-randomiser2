const { ItemRandomiser } = require('./item_randomiser.js');

class ArchipelagoFiller extends ItemRandomiser {
    constructor(prng, instLocations, settings) {
        super(prng, instLocations, settings);
    }

    placeItems(itemMapping, instItemLocations) {
        this.instItemLocations = instItemLocations;

        Object.keys(this.instItemLocations).forEach((slot) => {
            var mapping = itemMapping[slot] ?? this.instItemLocations[slot][0]['vanillaContents'];

            this.instItemLocations[slot].forEach((t) => {
                t['contents'] = mapping;
            });
        });
    }

    placeDjinn(djinnMapping, djinnClone) {
        djinnClone.forEach((djinni) => {
            let slotId = 0x30 + djinni.vanillaElement * 20 + djinni.vanillaId;
            let mappedDjinni = djinnMapping['0x' + slotId.toString('16')];
            if (mappedDjinni) {
                djinni.element = Math.floor((mappedDjinni - 0x30) / 20);
                djinni.id = (mappedDjinni - 0x30) % 20;
            }
        });
    }

    sortMimics() {}
}

module.exports = {ArchipelagoFiller};