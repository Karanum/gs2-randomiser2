const addrFrom = 0xC6684;
const addrTo = 0xC6B04;

var tableData = [];

function initialise(rom) {
    var addr = addrFrom;
    while (addr < addrTo) {
        var element = rom[addr];
        var levels = [rom[addr + 4], rom[addr + 5], rom[addr + 6], rom[addr + 7]];
        var pow = [], res = [];
        for (var i = 0; i < 4; ++i) {
            pow.push(rom[addr + 4 * i + 8] + (rom[addr + 4 * i + 9] << 8));
            res.push(rom[addr + 4 * i + 10] + (rom[addr + 4 * i + 11] << 8));
        }
        tableData.push({addr: addr, element: element, levels: levels, elemPow: pow, elemRes: res});
        addr += 24;
    }
}

function clone() {
    return JSON.parse(JSON.stringify(tableData));
}

function writeToRom(instance, rom) {
    instance.forEach((table) => {
        var addr = table.addr;
        rom[addr] = table.element;
        for (var i = 0; i < 4; ++i) {
            rom[addr + i + 4] = table.levels[i];
            rom[addr + 4 * i + 8] = (table.elemPow[i] & 0xFF);
            rom[addr + 4 * i + 9] = (table.elemPow[i] >> 8);
            rom[addr + 4 * i + 10] = (table.elemRes[i] & 0xFF);
            rom[addr + 4 * i + 11] = (table.elemRes[i] >> 8);
        }
    });
}

function shuffleResistances(prng, instance) {
    instance.forEach((table) => {
        var oldRes = table.elemRes;
        table.elemRes = [];
        while (oldRes.length > 0) {
            table.elemRes.push(oldRes.splice(Math.floor(prng.random() * oldRes.length), 1)[0]);
        }
    });
}

function randomiseResistances(prng, instance) {
    instance.forEach((table) => {
        var totalRes = 0;
        var newRes = [];
        table.elemRes.forEach((res) => {totalRes += res});
        while (newRes.length < 4) {
            var res = totalRes;
            if (newRes.length != 4)
                res = Math.floor(Math.max(totalRes / 4, prng.random() * totalRes * 0.5));
            totalRes -= res;
            newRes.push(res);
        }
        for (var i = 0; i < 4; ++i) {
            table.elemRes[i] = newRes.splice(Math.floor(prng.random() * newRes.length), 1)[0];
        }
    });
}

module.exports = {initialise, clone, writeToRom, shuffleResistances, randomiseResistances};