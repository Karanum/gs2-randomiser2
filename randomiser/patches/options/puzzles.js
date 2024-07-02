/*
Because the Gabomba Statue puzzle only has 16 permutations, it can be handled by a single byte,
and the patch for that is as easy as doing a `mov r0, ##` then returning out of the function.
(Yes, it's nicely within its own function call too.)

For Gaia Rock and Trial Road the method is similar, but the name sum can be a 32-bit (maybe 16-bit?) number.
So for that, the value is stored as a literal and fetched with a pc-relative ldr before branching
to bypass the rest of the code block that determines the name sum.
*/

/**
 * Fixes all name-based puzzles to a random 16-bit name sum.
 * @param {MapCodeData} mapCode 
 * @param {MersenneTwister} prng 
 */
function applyRandom(mapCode, prng) {
    let sum = Math.floor(prng.random() * 0xFFFF);
    applyGabomba(mapCode, sum);
    applyGaiaRock(mapCode, sum);
    applyTrialRoad(mapCode, sum);
}

/**
 * Fixes all name-based puzzles to the name "Felix". (sum 0x1F8)
 * @param {MapCodeData} mapCode 
 */
function applyFixed(mapCode) {
    applyGabomba(mapCode, 8);
    applyGaiaRock(mapCode, 0x1F8);
    applyTrialRoad(mapCode, 0x1F8);
}


function applyGabomba(mapCode, sum) {
    mapCode[1649][0] = true;
    applyMapCode(mapCode[1649][1], 0x3606, [sum & 0xF, 0x20, 0x0, 0xBD]);
}

function applyGaiaRock(mapCode, sum) {
    mapCode[1665][0] = true;
    applyMapCode(mapCode[1665][1], 0x42AE, [0x1, 0x48, 0xB, 0xE0, 0x0, 0x0, sum & 0xFF, (sum >> 8) & 0xFF, 0x0, 0x0]);
}

function applyTrialRoad(mapCode, sum) {
    mapCode[1687][0] = true;
    applyMapCode(mapCode[1687][1], 0x2492, [0x1, 0x48, 0x7, 0xE0, 0x0, 0x0, sum & 0xFF, (sum >> 8) & 0xFF, 0x0, 0x0]);
}

/**
 * Writes an array of bytes into the map code, overwriting existing data
 * @param {byte[]} mapCode The binary map code data
 * @param {number} offset The position to start writing at
 * @param {byte[]} data The data to write
 */
function applyMapCode(mapCode, offset, data) {
    for (var i = 0; i < data.length; ++i) {
        mapCode[offset++] = data[i];
    }
}

module.exports = { applyRandom, applyFixed };