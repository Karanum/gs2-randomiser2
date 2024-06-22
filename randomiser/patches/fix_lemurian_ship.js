/**
 * This patch removes the event where Piers blocks the party from boarding the Lemurian Ship.
 * This should only be applied on the "Door Open" ship logic setting, and is meant to
 * resolve any lingering issues with that setting because it refuses to play nice otherwise.
 */

/**
 * Applies this patch to the map code
 * @param {MapCodeData} mapCode The map code data instance
 */
function apply(mapCode) {
    mapCode[1623][0] = true;
    mapCode[1623][1][0x1DA2] = 0xE0;
    mapCode[1623][1][0x1DA3] = 0xBD;
}

module.exports = {apply};