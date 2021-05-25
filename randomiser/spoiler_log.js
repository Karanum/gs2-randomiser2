const fs = require('fs');

const shopData = require('./game_data/shops.js');
const forgeData = require('./game_data/forgeables.js');

const characterNames = ["Isaac", "Garet", "Ivan", "Mia", "Felix", "Jenna", "Sheba", "Piers"];
const statNames = ["HP", "PP", "Attack", "Defense", "Agility", "Luck"];
const shopNames = ["n/a", "Daila Weapon Shop", "Daila Armour Shop", "Daila Item Shop", "Madra Weapon Shop", "Madra Armour Shop",
    "Madra Item Shop", "Alhafra Weapon Shop", "Alhafra Armour Shop", "Alhafra Item Shop", "Garoh Weapon Shop",
    "Garoh Armour Shop", "Garoh Item Shop", "Mikasalla General Shop", "Naribwe Weapon Shop", "Naribwe Armour Shop",
    "Naribwe Item Shop", "Kibombo Weapon Shop", "Kibombo Armour Shop", "Kibombo Item Shop", "Yallam Weapon Shop",
    "Yallam Armour Shop", "Yallam Item Shop", "Apojii General Shop", "Izumo General Shop", "Champa General Shop",
    "Contigo Weapon Shop", "Contigo Armour Shop", "Contigo Item Shop", "Shaman General Shop", "Loho General Shop", "Prox General Shop"];


function generate(filepath, settings, spheres, itemLocs, djinn, characters, classes, shops, forgeables, itemData) {
    var fileStream = fs.createWriteStream(filepath);
    
    writeSpheres(fileStream, spheres, itemLocs);
    writeDjinn(fileStream, djinn);
    writeCharacterStats(fileStream, characters);
    writeClassStats(fileStream, classes);
    if (settings['adv-equip']) {
        writeShopItems(fileStream, shops, itemData);
        writeForgeItems(fileStream, forgeables, itemData);
    }
    writeAllItems(fileStream, itemLocs);

    fileStream.close();
}

function writeSpheres(fileStream, spheres, itemLocs) {
    fileStream.write("========== Spheres ==========\n");
    for (var i = 0; i < spheres.length; ++i) {
        fileStream.write("Sphere " + i + ":\n");
        spheres[i].forEach((flag) => {
            var item = itemLocs[flag][0];
            var mapName = item['mapName'] || "???";
            fileStream.write("    " + mapName.padEnd(24, ' ') + item.vanillaName + " --> " + item.name + "\n");
        });
        fileStream.write("\n");
    }
}

function writeDjinn(fileStream, djinn) {
    fileStream.write("\n========== Djinn ==========\n");
    fileStream.write("GS2 Djinn:\n");
    for (var i = 7; i <= 17; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\n");
    for (var i = 25; i <= 35; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\n");
    for (var i = 43; i <= 53; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\n");
    for (var i = 61; i <= 71; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\nReunion Djinn:\n");
    for (var i = 0; i <= 5; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\n");
    for (var i = 18; i <= 23; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\n");
    for (var i = 36; i <= 41; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\n");
    for (var i = 54; i <= 59; ++i) {
        fileStream.write("    " + djinn[i].vanillaName + " --> " + djinn[i].name + "\n");
    }
    fileStream.write("\nReserve Djinn:\n");
    fileStream.write("    " + djinn[6].vanillaName + " --> " + djinn[6].name + "\n");
    fileStream.write("    " + djinn[24].vanillaName + " --> " + djinn[24].name + "\n");
    fileStream.write("    " + djinn[42].vanillaName + " --> " + djinn[42].name + "\n");
    fileStream.write("    " + djinn[60].vanillaName + " --> " + djinn[60].name + "\n");
}

function writeCharacterStats(fileStream, characters) {
    fileStream.write("\n\n========== Character Stats ==========\n");
    for (var i = 0; i < 8; ++i) {
        var index = (i + 4) % 8;
        var name = characterNames[index] + ":";
        var stats = characters[index].stats;
        fileStream.write(name.padEnd(12, ' ') + "Lv1     Lv20    Lv40    Lv60    Lv80    Lv99\n");
        for (var j = 0; j < 6; ++j) {
            fileStream.write("  " + statNames[j].padEnd(10, ' '));
            for (var k = 0; k < 6; ++k) {
                fileStream.write(stats[j][k].toString().padEnd(8, ' '));
            }
            fileStream.write("\n");
        }
        fileStream.write("\n");
    }

    fileStream.write("\n\n========== Character Elements ==========\n");
    fileStream.write("        V   Me  Ma  J\n");
    for (var i = 0; i < 8; ++i) {
        var index = (i + 4) % 8;
        var elements = characters[index].elements;
        fileStream.write(characterNames[index].padEnd(8, ' '));
        for (var j = 0; j < 4; ++j) {
            if (elements[j] >= 50) {
                fileStream.write("X   ");
            } else {
                fileStream.write("-   ");
            }
        }
        fileStream.write("\n");
        if (i == 3) fileStream.write("\n");
    }
}

function writeClassStats(fileStream, classes) {
    fileStream.write("\n\n========== Class Stats ==========\n");
    fileStream.write("            HP      PP      Atk     Def     Agi     Luk\n");
    classes.forEach((classLine) => {
        for (var i = 0; i < classLine.classes.length; ++i) {
            fileStream.write(classLine.classes[i].padEnd(12, ' '));
            classLine.stats[i].forEach((stat) => {
                fileStream.write((stat + "0%").padEnd(8, ' '));
            });
            fileStream.write("\n");
        }
        fileStream.write("\n");
    });
}

function writeShopItems(fileStream, shops, itemData) {
    fileStream.write("\n========== Shop Artifacts ==========\n");
    var vanillaShops = shopData.clone();
    for (var i = 1; i < shops.length; ++i) {
        var vanillaArtifacts = vanillaShops[i].artifacts;
        if (!shopData.hasEquipmentArtifact(vanillaArtifacts, itemData)) continue;
        
        fileStream.write(shopNames[i] + ":\n");
        var artifacts = shops[i].artifacts;
        for (var j = 0; j < vanillaArtifacts.length; ++j) {
            if (vanillaArtifacts[j] == 0) continue;
            var vanillaData = itemData[vanillaArtifacts[j]];
            var type = vanillaData.itemType;
            if ((type >= 1 && type <= 5 ) || type == 8 || type == 9) {
                var data = itemData[artifacts[j]];
                fileStream.write("    " + vanillaData.name + " --> " + data.name + "\n");
            }
        }
        fileStream.write("\n");
    }
}

function writeForgeItems(fileStream, forgeables, itemData) {
    fileStream.write("\n========== Forging ==========\n");
    var vanillaForgeables = forgeData.clone();
    for (var item in forgeables) {
        if (!forgeables.hasOwnProperty(item)) continue;
        
        var name = itemData[item].name;
        if (name.startsWith("Rusty ")) name += " (" + item + ")";
        fileStream.write(name + ":\n");

        for (var i = 0; i < 8; ++i) {
            if (vanillaForgeables[item].results[i] == 0) continue;
            var vanillaData = itemData[vanillaForgeables[item].results[i]];
            var data = itemData[forgeables[item].results[i]];
            fileStream.write("    " + vanillaData.name + " --> " + data.name + "\n");
        }
        fileStream.write("\n");
    }
}

function writeAllItems(fileStream, itemLocs) {
    fileStream.write("\n========== All Items ==========\n");
    for (var flag in itemLocs) {
        if (!itemLocs.hasOwnProperty(flag)) continue;
        var item = itemLocs[flag][0];
        if (item['locked']) continue;
        var mapName = item['mapName'] || "???";
        fileStream.write(flag.padEnd(8, ' ') + mapName.padEnd(24, ' ') + item.vanillaName + " --> " + item.name + "\n");
    }
}

module.exports = {generate};