/**
 * This patch opens the two shortcut pillars at the bottom of Magma Rock Interior.
 * This allows for a good part of interior to be checked with just Lift and avoids having
 * to backtrack if e.g. the player did an initial runthrough without Whirlwind.
 */

const { write16b } = require("../../../util/binary");

function apply(mapCode, locations) {
    // Set the top interior exit to only be usable once the stone has been Bursted in exterior
    mapCode[1682][0] = true;
    write16b(mapCode[1682][1], 0x603E, 0x18DC);

    // Change the access rules for Magma Rock interior checks
    locations[0].find((loc) => loc.Addr == '0xff0').Reqs.forEach((reqSet) => {
        reqSet.splice(reqSet.indexOf('MagmaInterior'), 1);
        reqSet.push('Burst Brooch');
    });
    locations[0].find((loc) => loc.Addr == '0xff1').Reqs.forEach((reqSet) => {
        reqSet.splice(reqSet.indexOf('MagmaInterior'), 1);
        reqSet.push('Burst Brooch');
    });
    locations[0].find((loc) => loc.Addr == '0xff2').Reqs.forEach((reqSet) => {
        reqSet.splice(reqSet.indexOf('MagmaInterior'), 1);
        reqSet.splice(reqSet.indexOf('Whirlwind'), 1);
        reqSet.push('Burst Brooch');
    });
    locations[0].find((loc) => loc.Addr == '0xff4').Reqs.forEach((reqSet) => {
        reqSet.splice(reqSet.indexOf('MagmaInterior'), 1);
        reqSet.push('Burst Brooch');
    });
    locations[0].find((loc) => loc.Addr == '0x9f9').Reqs.forEach((reqSet) => {
        reqSet.splice(reqSet.indexOf('MagmaInterior'), 1);
        reqSet.splice(reqSet.indexOf('Whirlwind'), 1);
    });
    locations[0].find((loc) => loc.Addr == '0x9fa').Reqs.forEach((reqSet) => {
        reqSet.splice(reqSet.indexOf('MagmaInterior'), 1);
        reqSet.splice(reqSet.indexOf('Whirlwind'), 1);
    });
}

module.exports = {apply};