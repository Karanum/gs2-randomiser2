/**
 * This patch removes the event where Piers blocks the party from boarding the Lemurian Ship.
 * This should only be applied on the "Door Open" ship logic setting, and is meant to
 * resolve any lingering issues with that setting because it refuses to play nice otherwise.
 * @param {MapCodeData} mapCode The map code data instance
 */
function applyEntranceFix(mapCode) {
    mapCode[1623][0] = true;
    mapCode[1623][1][0x1DA2] = 0xE0;
    mapCode[1623][1][0x1DA3] = 0xBD;
}

function applyChestFix(mapCode) {
    mapCode[1622][0] = true;
    mapCode[1622][1][0x130C] = 0x1;
    mapCode[1622][1][0x130D] = 0xE0;
    mapCode[1622][1][0x288B] = 0xE0;
}

module.exports = {applyEntranceFix, applyChestFix};