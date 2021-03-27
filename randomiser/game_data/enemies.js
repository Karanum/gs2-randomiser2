const textStart = 1068;
const textEnd = 1446;
const addrOffset = 0xB9E8B;

var enemyData = {};

function loadFullEnemyData(rom, enemy) {
    var addr = enemy.addr;
    enemy.full = true;

    enemy.level = rom[addr];
    enemy.hp = rom[addr + 1] + (rom[addr + 2] << 8);
    enemy.pp = rom[addr + 3] + (rom[addr + 4] << 8);
    enemy.attack = rom[addr + 5] + (rom[addr + 6] << 8);
    enemy.defense = rom[addr + 7] + (rom[addr + 8] << 8);
    enemy.agility = rom[addr + 9] + (rom[addr + 10] << 8);
    enemy.luck = rom[addr + 11];
    enemy.turnCount = rom[addr + 12];
    enemy.hpRegen = rom[addr + 13];
    enemy.ppRegen = rom[addr + 14];

    enemy.items = [], enemy.attacks = [], enemy.unknowns = [];
    for (var i = 0; i < 4; ++i) {
        enemy.items.push([
            rom[addr + 15 + 2 * i] + (rom[addr + 16 + 2 * i] << 8), 
            rom[addr + 23 + i]
        ]);
        enemy.attacks.push(rom[addr + 31 + 4 * i] + (rom[addr + 32 + 4 * i] << 8));
        enemy.attacks.push(rom[addr + 33 + 4 * i] + (rom[addr + 34 + 4 * i] << 8));
        enemy.unknowns.push(rom[addr + 47 + i]);
    }

    enemy.attackEffect = rom[addr + 28];
    enemy.attackPattern = rom[addr + 29];
    enemy.attackFlags = rom[addr + 30];
    enemy.drop = rom[addr + 53] + (rom[addr + 54] << 8);
    enemy.dropRate = rom[addr + 55];
}

function initialise(rom, textutil) {
    var line = textStart;
    while (line <= textEnd) {
        var name = textutil.readLinePretty(undefined, line++);
        if (name == '?') continue;

        var addr = addrOffset + 76 * (line - textStart - 1);
        var coins = rom[addr + 51] + (rom[addr + 52] << 8);
        var exp = rom[addr + 57] + (rom[addr + 58] << 8);

        if (!enemyData.hasOwnProperty(name))
            enemyData[name] = [];
        enemyData[name].push({full: false, id: (line - textStart), addr: addr, coins: coins, exp: exp});
    }

    enemyData["Venus Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
    enemyData["Mercury Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
    enemyData["Mars Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
    enemyData["Jupiter Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
}

function clone() {
    JSON.parse(JSON.stringify(enemyData));
}

function writeUint16(rom, addr, value) {
    rom[addr] = (value & 0xFF);
    rom[addr + 1] = (value >> 8);
}

function writeFullEnemyData(rom, enemy) {
    var addr = enemy.addr;
    rom[addr] = enemy.level;
    rom[addr + 11] = enemy.luck;
    rom[addr + 12] = enemy.turnCount;
    rom[addr + 13] = enemy.hpRegen;
    rom[addr + 14] = enemy.ppRegen;
    rom[addr + 28] = enemy.attackEffect;
    rom[addr + 29] = enemy.attackPattern;
    rom[addr + 30] = enemy.attackFlags;
    rom[addr + 55] = enemy.dropRate;

    writeUint16(rom, addr + 1, enemy.hp);
    writeUint16(rom, addr + 3, enemy.pp);
    writeUint16(rom, addr + 5, enemy.attack);
    writeUint16(rom, addr + 7, enemy.defense);
    writeUint16(rom, addr + 9, enemy.agility);
    writeUint16(rom, addr + 53, enemy.drop);

    for (var i = 0; i < 4; ++i) {
        writeUint16(rom, addr + 15 + 2 * i, enemy.items[i][0]);
        writeUint16(rom, addr + 31 + 4 * i, enemy.attacks[2 * i]);
        writeUint16(rom, addr + 33 + 4 * i, enemy.attacks[2 * i + 1]);
        rom[addr + 23 + i] = enemy.items[i][1];
        rom[addr + 47 + i] = enemy.unknowns[i];
    }
}

function writeToRom(instance, rom) {
    for (var enemyName in instance) {
        if (!instance.hasOwnProperty(enemyName)) continue;
        instance[enemyName].forEach((enemy) => {
            var addr = enemy.addr;
            writeUint16(rom, addr + 51, enemy.coins);
            writeUint16(rom, addr + 57, enemy.exp);
            if (enemy.full) writeFullEnemyData(rom, enemy);
        });
    }
}

module.exports = {initialise, clone, writeToRom};