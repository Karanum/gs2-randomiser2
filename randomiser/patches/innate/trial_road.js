/**
 * This patch changes inventory snapshotting in Trial Road
 * to prevent duplication issues and potential item loss.
 */

function apply(rom) {
    // Disables inventory snapshotting
    rom[0xB10A4] = 0x8C;
    rom[0xB10A5] = 0xE0;

    // Disables restoration of inventory snapshot
    rom[0xB125A] = 0x0;
    rom[0xB125B] = 0x0;
    rom[0xB1264] = 0x0;
    rom[0xB1265] = 0x0;
}

module.exports = {apply};