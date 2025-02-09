/**
 * This patch changes upper Mars Lighthouse to be openable just by having the Mars Star
 * in your possession, skipping the need to fight Flame Dragons.
 */

const { writeArray, write32b, write16b } = require("../../../util/binary");

function apply(mapCode, locations) {
    mapCode[1708][0] = true;

    // Add a Mars Star check to the init of upper Mars Lighthouse
    write32b(mapCode[1708][1], 0x4, 0x0200BC21);
    writeArray(mapCode[1708][1], 0x3C20, [0x0, 0xB5, 0xA3, 0x20, 0x0, 0x1, 0xFF, 0xF7, 0x67, 0xFA, 0x0, 0x28, 0x9, 0xD1, 0xDE, 0x20, 0x0, 0xF0, 0xE, 
        0xF8, 0x0, 0x28, 0x4, 0xDA, 0xF7, 0x20, 0x0, 0xF0, 0x9, 0xF8, 0x0, 0x28, 0x3, 0xDB, 0xAB, 0x20, 0x0, 0x1, 0xFF, 0xF7, 0x5B, 0xFA, 0xFC, 0xF7, 
        0x8B, 0xFF, 0x0, 0xBD, 0x0, 0x4C, 0x20, 0x47, 0xC9, 0xEE, 0xA, 0x8 ]);

    // Change the flag requirement for the elemental wing doors
    for (let i = 0; i < 8; ++i) {
        write16b(mapCode[1708][1], 0x37AA + i * 0xC, 0x1AB0);
    }

    // Change the access rules for upper Mars Lighthouse checks
    const affectedItems = ['0xe03', '0xfff'];
    const affectedFlags = ['JupiterWing', 'MercuryWing', 'MarsWing', 'VenusWing'];

    locations[0].filter((loc) => affectedItems.includes(loc.Addr)).forEach((loc) => {
        loc.Reqs.forEach((reqSet) => { 
            if (!reqSet.includes('Boss_FlameDragons')) return;
            reqSet.splice(reqSet.indexOf('Boss_FlameDragons'), 1);
        });
    });
    locations[2].filter((loc) => affectedFlags.includes(loc.Addr)).forEach((loc) => {
        loc.Reqs.forEach((reqSet) => { 
            if (!reqSet.includes('Boss_FlameDragons')) return;
            reqSet.splice(reqSet.indexOf('Boss_FlameDragons'), 1);
        });
    });
}

module.exports = {apply};