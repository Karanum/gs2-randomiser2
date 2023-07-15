/**
 * Applies this patch to the map code
 * @param {MapCodeData} mapCode The map code data instance
 * @param {object[]} djinn The djinni data instance
 */
function apply(mapCode, djinn) {
    mapCode[1625][0] = true;

    mapCode[1625][1][0x23D8] = 0xF3 + djinn[46].element;
}

module.exports = {apply};