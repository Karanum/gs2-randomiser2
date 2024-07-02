const enemyData = require('../../game_data/enemies.js');

function apply(rom, enemyInst, abilityInst) {
    enemyData.loadFullBossData(rom, enemyInst);
    updateEnemyData(enemyInst);
    updateAbilityData(abilityInst);
}

function updateEnemyData(instance) {
    instance["Briggs"][0].attack = 119;
    instance["Sea Fighter"][0].attack = 104;

    instance["Aqua Hydra"][0].hp = 2276;
    instance["Aqua Hydra"][0].attack = 163;

    var serpent = instance["Serpent"];
    serpent[3].hp = 3136;
    serpent[3].attack = 229;
    serpent[3].hpRegen = 3;
    serpent[4].hp = 2736;
    serpent[4].attack = 219;

    var avimander = instance["Avimander"][0];
    avimander.hp = 3042;
    avimander.attacks = [421, 673, 1, 674, 55, 106, 108, 1];

    var poseidon = instance["Poseidon"];
    poseidon[1].attacks[4] = 28;
    poseidon.forEach((enemy) => {
        enemy.hp = 3505;
        enemy.attack = 262;
        enemy.agility = 175;
    });

    instance["Moapa"].forEach((enemy) => {
        enemy.hp = 2792;
        enemy.attack = 304;
    });
    instance["Knight"].forEach((enemy) => {
        enemy.hp = 1454;
        enemy.attack = 281;
        enemy.items[0][0] = 241;
    });

    var agatioDragon = instance["Flame Dragon"][0];
    agatioDragon.hp = 3924;
    agatioDragon.attack = 360;
    var karstDragon = instance["Flame Dragon"][1];
    karstDragon.hp = 3648;
    karstDragon.attack = 349;
    karstDragon.attacks = [648, 55, 686, 58, 88, 127, 687, 1];

    var dd = instance["Doom Dragon"];
    [dd[0], dd[1], dd[2], dd[3]].forEach((enemy) => {
        enemy.hp = 3500;
        enemy.attack = 450;
        enemy.defense = 100;
    });
    [dd[4], dd[5], dd[6]].forEach((enemy) => {
        enemy.hp = 3200;
        enemy.attack = 445;
        enemy.defense = 100;
    });
    [dd[7], dd[8]].forEach((enemy) => {
        enemy.hp = 3000;
        enemy.attack = 440;
        enemy.defense = 100;
    });
    dd[6].attacks[3] = 49;
    dd[7].attacks[7] = 16;
    dd[8].attacks = [724, 724, 724, 724, 724, 7, 7, 16];

    instance["Star Magician"][0].hp = 5486;
    instance["Star Magician"][0].attack = 400;
    instance["Anger Ball"][0].hp = 230;
    instance["Guardian Ball"][0].hp = 260;
    instance["Refresh Ball"][0].hp = 180;
    instance["Refresh Ball"][0].attacks = [94, 94, 94, 94, 94, 99, 100, 1];
    instance["Thunder Ball"][0].attacks = [67, 70, 72, 67, 70, 72, 1, 1];

    instance["Sentinel"][0].hp = 6236;
    instance["Sentinel"][0].attack = 508;
    instance["Sentinel"][0].defense = 167;

    instance["Valukar"][0].hp = 8960;
    instance["Valukar"][0].attack = 450;
    instance["Valukar"][0].attacks[6] = 1;

    instance["Dullahan"].forEach((enemy) => {
        enemy.hp = 12000;
        enemy.attack = 576;
        enemy.defense = 219;
    });
    instance["Dullahan"][1].attacks[2] = 720;
}

function updateAbilityData(instance) {
    instance[644].power = 120;
    instance[645].power = 130;
    instance[647].power = 180;
    instance[666].power = 20;
    instance[669].power = 75;
    instance[672].addedEffect = 0;
    instance[673].power = 25;
    instance[675].power = 30;
    instance[676].power = 110;
    instance[676].addedEffect = 0;
    instance[679].power = 14;
    instance[680].power = 13;
    instance[681].power = 50;
    instance[682].power = 200;
    instance[683].power = 90;
    instance[715].power = 14;
    instance[717].power = 24;
    instance[724].power = 100;
    instance[727].power = 240;
}

module.exports = {apply};