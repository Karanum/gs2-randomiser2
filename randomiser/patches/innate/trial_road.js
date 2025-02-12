/**
 * This patch changes inventory snapshotting in Trial Road
 * to prevent duplication issues and potential item loss.
 */

const { write16b } = require('./../../../util/binary');

function apply(rom) {
    // Disables inventory snapshotting
    write16b(rom, 0xB10A4, 0xE08C);

    // Stop the chest flags in Trial Road from being reset
    write16b(rom, 0xB11D0, 0xE009);

    // Disables restoration of inventory snapshot
    write16b(rom, 0xB125A, 0x0);
    write16b(rom, 0xB1264, 0x0);
}

module.exports = {apply};