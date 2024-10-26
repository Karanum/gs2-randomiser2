const { read32b, read16b } = require("../../util/binary");

const addrOffset = 0x1C4530;

const fieldBGM = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 34, 35, 36, 37, 38, 39, 
    41, 42, 43, 44, 60, 61, 62, 63, 65, 67, 74, 76, 700, 701, 702, 703, 704, 705, 706, 707, 708, 709, 710, 720, 721, 722, 723, 724, 725, 726, 
    727, 728, 729, 730, 741, 742, 743];
const battleBGM = [49, 50, 51, 52, 53, 54, 55, 56, 57, 750, 751, 752, 753, 754];

var musicData = [];

function shuffleBGM(instance, prng) {
    var pointers = instance.map((entry) => entry.pointer);
    instance.forEach((entry) => {
        var i = Math.floor(prng.random() * pointers.length);
        entry.pointer = pointers.splice(i, 1);
    });
}

function initialise(rom) {
    fieldBGM.forEach((i) => {
        var addr = addrOffset + (i * 8);
        var pointer = read32b(rom, addr);
        var type = read16b(rom, addr + 4);
        musicData.push({ addr, pointer, type, forBattle: false });
    });
    battleBGM.forEach((i) => {
        var addr = addrOffset + (i * 8);
        var pointer = read32b(rom, addr);
        var type = read16b(rom, addr + 4);
        musicData.push({ addr, pointer, type, forBattle: true });
    });
}

function clone() {
    return JSON.parse(JSON.stringify(musicData));
}

function writeToRom(instance, rom) {
    instance.forEach((entry) => {
        rom[entry.addr] = entry.pointer & 0xFF;
        rom[entry.addr + 1] = (entry.pointer >> 8) & 0xFF;
        rom[entry.addr + 2] = (entry.pointer >> 16) & 0xFF;
        rom[entry.addr + 3] = (entry.pointer >> 24) & 0xFF; 
    });
}

module.exports = { shuffleBGM, initialise, clone, writeToRom };