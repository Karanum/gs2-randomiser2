const textStart = 1068;
const textEnd = 1446;
const addrOffset = 0xB9E8B;

const bosses = ["Chestbeater", "King Scorpion", "Sea Fighter", "Briggs", "Aqua Hydra",
    "Serpent", "Avimander", "Poseidon", "Moapa", "Knight", "Agatio", "Karst", "Flame Dragon",
    "Doom Dragon", "Star Magician", "Refresh Ball", "Thunder Ball", "Anger Ball", "Guardian Ball",
    "Valukar", "Sentinel", "Dullahan"];

var enemyData = {};

function loadBasicEnemyData(rom, enemy) {
    var addr = enemy.addr;
    enemy.full = false;
    enemy.hp = rom[addr + 1] + (rom[addr + 2] << 8);
    enemy.pp = rom[addr + 3] + (rom[addr + 4] << 8);
    enemy.attack = rom[addr + 5] + (rom[addr + 6] << 8);
    enemy.defense = rom[addr + 7] + (rom[addr + 8] << 8);
    enemy.agility = rom[addr + 9] + (rom[addr + 10] << 8);
    enemy.luck = rom[addr + 11];
    enemy.hpRegen = rom[addr + 13];
    enemy.ppRegen = rom[addr + 14];

    enemy.coins = rom[addr + 51] + (rom[addr + 52] << 8);
    enemy.drop = rom[addr + 53] + (rom[addr + 54] << 8);
    enemy.dropRate = rom[addr + 55];
    enemy.exp = rom[addr + 57] + (rom[addr + 58] << 8);
}

function loadFullEnemyData(rom, enemy) {
    var addr = enemy.addr;
    enemy.full = true;

    enemy.level = rom[addr];
    enemy.turnCount = rom[addr + 12];

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
}

function initialise(rom, textutil) {
    var line = textStart;
    while (line <= textEnd) {
        var name = textutil.readLinePretty(undefined, line++);
        if (name == '?') continue;

        var addr = addrOffset + 76 * (line - textStart - 1);
        var data = {name: name, id: (line - textStart), addr: addr};
        loadBasicEnemyData(rom, data);
        if (!enemyData.hasOwnProperty(name))
            enemyData[name] = [];
        enemyData[name].push(data);
    }

    enemyData["Venus Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
    enemyData["Mercury Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
    enemyData["Mars Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));
    enemyData["Jupiter Djinni"].forEach((djinni) => loadFullEnemyData(rom, djinni));

    var phoenixLine = [enemyData["Phoenix"][0], enemyData["Fire Bird"][0], enemyData["Wonder Bird"][0]];
    phoenixLine.forEach((phoenix) => {
        phoenix.drop = 229;
        phoenix.dropRate = 1;
    });
}

function clone() {
    return JSON.parse(JSON.stringify(enemyData));
}

function writeUint16(rom, addr, value) {
    rom[addr] = (value & 0xFF);
    rom[addr + 1] = (value >> 8);
}

function writeEnemyData(rom, enemy) {
    var addr = enemy.addr;
    rom[addr + 11] = enemy.luck;
    rom[addr + 13] = enemy.hpRegen;
    rom[addr + 14] = enemy.ppRegen;
    rom[addr + 55] = enemy.dropRate;

    writeUint16(rom, addr + 1, enemy.hp);
    writeUint16(rom, addr + 3, enemy.pp);
    writeUint16(rom, addr + 5, enemy.attack);
    writeUint16(rom, addr + 7, enemy.defense);
    writeUint16(rom, addr + 9, enemy.agility);
    writeUint16(rom, addr + 51, enemy.coins);
    writeUint16(rom, addr + 53, enemy.drop);
    writeUint16(rom, addr + 57, enemy.exp);

    if(enemy.full) {
        rom[addr] = enemy.level;
        rom[addr + 12] = enemy.turnCount;
        rom[addr + 28] = enemy.attackEffect;
        rom[addr + 29] = enemy.attackPattern;
        rom[addr + 30] = enemy.attackFlags;

        for (var i = 0; i < 4; ++i) {
            writeUint16(rom, addr + 15 + 2 * i, enemy.items[i][0]);
            writeUint16(rom, addr + 31 + 4 * i, enemy.attacks[2 * i]);
            writeUint16(rom, addr + 33 + 4 * i, enemy.attacks[2 * i + 1]);
            rom[addr + 23 + i] = enemy.items[i][1];
            rom[addr + 47 + i] = enemy.unknowns[i];
        }
    }
}

function writeToRom(instance, rom) {
    for (var enemyName in instance) {
        if (!instance.hasOwnProperty(enemyName)) continue;
        instance[enemyName].forEach((enemy) => {
            writeEnemyData(rom, enemy);
        });
    }
}

function scaleBattleRewards(instance, coinScale, expScale) {
    var bossExpScale = 1 + (expScale - 1) / 2;
    for (var name in instance) {
        if (!instance.hasOwnProperty(name)) continue;
        instance[name].forEach((enemy) => {
            enemy.coins = Math.min(0xFFFF, enemy.coins * coinScale);
            enemy.exp = Math.min(0xFFFF, Math.round(enemy.exp * (bosses.includes(name) ? bossExpScale : expScale)));
        });
    }
}

function loadFullBossData(rom, instance) {
    loadFullEnemyData(rom, instance["Avimander"][0]);
    loadFullEnemyData(rom, instance["Poseidon"][1]);
    instance["Knight"].forEach((enemy) => loadFullEnemyData(rom, enemy));
    loadFullEnemyData(rom, instance["Flame Dragon"][1]);
    loadFullEnemyData(rom, instance["Doom Dragon"][6]);
    loadFullEnemyData(rom, instance["Doom Dragon"][7]);
    loadFullEnemyData(rom, instance["Doom Dragon"][8]);
    loadFullEnemyData(rom, instance["Refresh Ball"][0]);
    loadFullEnemyData(rom, instance["Thunder Ball"][0]);
    loadFullEnemyData(rom, instance["Valukar"][0]);
    loadFullEnemyData(rom, instance["Dullahan"][1]);
}

module.exports = {initialise, clone, writeToRom, scaleBattleRewards, loadFullBossData};