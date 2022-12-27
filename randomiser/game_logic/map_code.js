const fs = require('fs');
const decompr = require('../../modules/decompression.js');

var mapCodeData = {};
var preCompressed = {};

/**
 * Reads 16 bits of data from the specified position.
 */
function read16b(data, pos) {
    return data[pos] + (data[pos + 1] << 8);
}

/**
 * Reads 24 bits of data from the specified position.
 */
function read24b(data, pos) {
    return data[pos] + (data[pos + 1] << 8) + (data[pos + 2] << 16);
}

/**
 * Writes 16 bits of data to the specified position.
 */
function write16b(data, pos, write) {
    data[pos] = write & 0xFF;
    data[pos + 1] = (write >> 8) & 0xFF;
}

/**
 * Writes 32 bits of data to the specified position.
 */
function write32b(data, pos, write) {
    data[pos] = write & 0xFF;
    data[pos + 1] = (write >> 8) & 0xFF;
    data[pos + 2] = (write >> 16) & 0xFF;
    data[pos + 3] = (write >> 24) & 0xFF;
}

/**
 * Converts BL calls
 * @param {byte[]} data The map code.
 * @param {boolean} restore The conversion direction (true for compression, false for decompression)
 */
function convertBranchLinks(data, restore) {
    var i = 2;
    while (i < data.length) {
        var r12 = read16b(data, i);
        i += 2;
        if ((r12 & 0xF800) != 0xF800)
            continue;

        var r3 = read16b(data, i - 4);
        if ((r3 & 0xF800) != 0xF000)
            continue;

        r12 = (((r3 & 0x7FF) << 11) | (r12 & 0x7FF)) << 1;
        r12 += (i - 2) * (restore ? 1 : -1);

        write16b(data, i - 4, 0xF000 | ((r12 >> 12) & 0x7FF));
        write16b(data, i - 2, 0xF800 | (r12 >> 1));
    }
}

/**
 * Initialises the map code data.
 * @param {Uint8Array} rom The ROM array to extract from
 */
function initialise(rom) {
    if (!fs.existsSync('./map_code_cache/')) {
        fs.mkdirSync('./map_code_cache/');
    }

    for (var i = 1609; i < 1723; ++i) {
        //Get map code pointer from the master file table
        var pointer = read24b(rom, 0x680000 + 4 * i);

        //Decompress map code file
        var mapCode = decompr.decompress(rom, pointer, 0);
        if (!mapCode) continue;

        //Applying fixes because of old randomiser hackiness
        //NOTE: Not sufficient to solve the Piers issue in Kibombo because this means
        //      it can be difficult to take him out of town under certain conditions
        if (i == 1648) {
            mapCode[0x1224] = 0x0;
        }

        //Store map code in pre-compressed cache
        //Reads from the map_code_cache folder if it exists to speed up initialisation
        if (fs.existsSync(`./map_code_cache/${i}.bin`)) {
            preCompressed[i.toString()] = fs.readFileSync(`./map_code_cache/${i}.bin`);
        } else {
            compressCacheMapCode(i, mapCode);
        }
        
        //Convert BL calls and store map code
        convertBranchLinks(mapCode, false);
        mapCodeData[i.toString()] = [false, mapCode];
    }
}

/**
 * Compresses the map code and writes the result to the map_code_cache folder.
 * @param {number} i The MFT index
 * @param {byte[]} mapCode The map code
 */
function compressCacheMapCode(i, mapCode) {
    preCompressed[i.toString()] = new Uint8Array(decompr.compressC1(mapCode));
    fs.writeFileSync(`./map_code_cache/${i}.bin`, preCompressed[i.toString()]);
}

/**
 * Clones the map code data for safe modification.
 * 
 * The data is formatted as an object with the MFT indices as keys.
 * Each key maps to a `[boolean, byte[]]` struct where the first element is whether the map code has been modified,
 * and the second element is the binary map code data.
 * @returns {object} A deep copy of the map code data
 */
function clone() {
    return JSON.parse(JSON.stringify(mapCodeData));
}

/**
 * Writes the map code data to a ROM array.
 * @param {{}} instance The map code data instance (see `clone`)
 * @param {Uint8Array} rom The ROM array to write into
 */
function writeToRom(instance, rom) {
    //Get the starting position for the map code data
    var romPos = read24b(rom, 0x681924);

    for (var i = 1609; i < 1723; ++i) {
        //Store the new pointer in the master file table
        var pointerAddr = 0x680000 + 4 * i;
        write32b(rom, pointerAddr, romPos + 0x08000000);

        //If the map code changed, compress and convert BLs
        //Otherwise, get the pre-compressed map code from cache
        var entry = instance[i];
        var cmc = undefined;
        if (entry[0]) {
            convertBranchLinks(entry[1], true);
            cmc = new Uint8Array(decompr.compressC1(entry[1]));
        } else {
            cmc = preCompressed[i];
        }

        //Write the compressed map code into the ROM
        rom[romPos++] = 0x1;
        for (let i = 0; i < cmc.length; ++i) {
            rom[romPos++] = cmc[i];
        }

        //Add proper data spacing
        romPos += 3;
        romPos &= 0xFFFFFFFC;
    }

    //Throw a warning if the total map code data exceeds a safe size
    //(The randomiser has data at 0xFA0000 that mustn't be overwritten)
    if (romPos >= 0xF9FF00) {
        console.log("WARNING: The size of the map code data exceeds safe limits");
    }
}

module.exports = {initialise, clone, writeToRom};