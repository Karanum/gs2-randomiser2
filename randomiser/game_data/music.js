const addrOffset = 0x1C4530;

var musicData = [];

function shuffleBGM(instance, prng) {
    var pointers = instance.map((entry) => entry.pointer);
    instance.forEach((entry) => {
        var i = Math.floor(prng.random() * pointers.length);
        entry.pointer = pointers.splice(i, 1);
    });
}

function initialise(rom) {
    var addr = addrOffset;
    var i = 0;
    while (i < 799) {
        var pointer = rom[addr] + (rom[addr + 1] << 8) + (rom[addr + 2] << 16) + (rom[addr + 3] << 24);
        var type = rom[addr + 4] + (rom[addr + 5] << 8);

        if (pointer == 0) {
            break;
        }

        if (pointer != 0x081C5E30 && type == 1) {
            musicData.push({ i, addr, pointer, type });
        }

        ++i;
        addr += 8;
    }
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