const { BaseRandomiser } = require('./base_randomiser.js');

class ArchipelagoFiller extends BaseRandomiser {
    constructor(prng, instLocations, settings) {
        super(prng, instLocations, settings);
        this.isMultiworld = false;
    }

    placeItems(itemMapping, instItemLocations) {
        this.itemLocations = instItemLocations;

        Object.keys(this.itemLocations).forEach((slot) => {
            let mapping = itemMapping[slot] ?? this.itemLocations[slot][0]['vanillaContents'];

            if (mapping >= 0xA01 && mapping <= 0xA09) {
                mapping -= 0xA01;
                this.itemLocations[slot].forEach((t) => {
                    t['eventType'] = 0x81;
                    t['contents'] = mapping;
                });
            } else {
                if (mapping == 0xA00 || mapping == 0xA0A) {
                    this.isMultiworld = true;
                }

                this.itemLocations[slot].forEach((t) => {
                    t['contents'] = mapping;
                    if (t['eventType'] == 0x81) t['eventType'] = 0x80;
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