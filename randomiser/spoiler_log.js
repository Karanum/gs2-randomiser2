const fs = require('fs');

function generate(filepath, spheres, itemLocs, djinn) {
    var fileStream = fs.createWriteStream(filepath);
    
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
    
    fileStream.write("\n\n========== All Items ==========\n");
    for (var flag in itemLocs) {
        if (!itemLocs.hasOwnProperty(flag)) continue;
        var item = itemLocs[flag][0];
        if (item['locked']) continue;
        var mapName = item['mapName'] || "???";
        fileStream.write(flag.padEnd(8, ' ') + mapName.padEnd(24, ' ') + item.vanillaName + " --> " + item.name + "\n");
    }

    fileStream.close();
}

module.exports = {generate};