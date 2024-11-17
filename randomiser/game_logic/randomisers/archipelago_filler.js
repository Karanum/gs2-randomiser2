const { ItemRandomiser } = require('./item_randomiser.js');

class ArchipelagoFiller extends ItemRandomiser {
    constructor(prng, instLocations, settings) {
        super(prng, instLocations, settings);
    }

    placeItems(itemMapping, instItemLocations) {
        this.instItemLocations = instItemLocations;

        Object.keys(this.instItemLocations).forEach((slot) => {
            let mapping = itemMapping[slot] ?? this.instItemLocations[slot][0]['vanillaContents'];

            if ((mapping & 0xFFF0) == 0xA00 && mapping != 0xA00) {
                mapping -= 0xA01;
                this.instItemLocations[slot].forEach((t) => {
                    t['eventType'] = 0x81;
                    t['contents'] = mapping;
                });
            } else {
                this.instItemLocations[slot].forEach((t) => {
                    t['contents'] = mapping;
                });
            }
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