const fs = require("fs");
const mersenne = require('../modules/mersenne.js');

const ups = require('./ups.js');
const locations = require('./locations.js');
const textutil = require('./textutil.js');
const itemLocations = require('./game_data/item_locations.js');
const classData = require('./game_data/classes.js');
const settingsParser = require('./settings.js');
const itemRandomiser = require('./item_randomiser.js');

const cutsceneSkipFlags = [0xf22, 0x890, 0x891, 0x892, 0x893, 0x894, 0x895, 0x896, 0x848, 0x86c, 0x86d, 0x86e, 0x86f,
        0x916, 0x844, 0x863, 0x864, 0x865, 0x867, 0x872, 0x873, 0x84b, 0x91b, 0x91c, 0x91d, 0x8b2, 0x8b3, 0x8b4,
        0x8a9, 0x8ac, 0x904, 0x971, 0x973, 0x974, 0x924, 0x928, 0x929, 0x92a, 0x880, 0x8f1, 0x8f3, 0x8f5, 0xa6c,
        0x8f6, 0x8fc, 0x8fe, 0x910, 0x911, 0x913, 0x980, 0x981, 0x961, 0x964, 0x965, 0x966, 0x968, 0x962, 0x969,
        0x96a, 0xa8c, 0x88f, 0x8f0, 0x9b1, 0xa78, 0x90c, 0xa2e, 0x9c0, 0x9c1, 0x9c2];

var upsCutsceneSkip, upsDjinnScaling, upsAvoid, upsTeleport, upsRandomiser;

var vanillaRom = new Uint8Array(fs.readFileSync("./randomiser/rom/gs2.gba"));
var rom = Uint8Array.from(vanillaRom);

function doTiming(msg, callback) {
    var timing = Date.now();
    process.stdout.write(msg + ' ');
    callback();
    console.log(Date.now() - timing + "ms");
}

function initialise() {
    doTiming("Loading UPS patches...", () => {
        upsAvoid = fs.readFileSync("./randomiser/ups/avoid.ups");
        upsTeleport = fs.readFileSync("./randomiser/ups/teleport.ups");
        upsRandomiser = fs.readFileSync("./randomiser/ups/randomiser_general.ups");
        upsCutsceneSkip = fs.readFileSync("./randomiser/ups/cutscene_skip.ups");
        upsDjinnScaling = fs.readFileSync("./randomiser/ups/djinn_scaling.ups");
    });

    doTiming("Applying innate UPS patches...", () => {
        rom = ups.applyPatch(rom, upsAvoid);
        rom = ups.applyPatch(rom, upsTeleport);
        rom = ups.applyPatch(rom, upsRandomiser);
    })

    doTiming("Decoding text data...", () => textutil.initialise(rom));
    doTiming("Loading item location data...", () => itemLocations.initialise(rom, textutil));
    doTiming("Loading class data...", () => classData.initialise(rom, textutil));
}

function applyGameTicketPatch(target) {
    target[0xAFED4] = 0x70;
    target[0xAFED5] = 0x47;
}

function applyShipSpeedPatch(target) {
    target[0x285A4] = 0xF0;
}

function writeStoryFlags(target, flags) {
    var addr = 0xF4280;
    flags.forEach((flag) => {
        target[addr] = (flag & 0xFF);
        target[addr + 1] = (flag >> 8);
        addr += 2;
    });
}

function randomise(seed, rawSettings) {
    console.log("Performing randomisation: seed " + seed + ", settings " + rawSettings);

    var target = rom.slice(0);
    var prng = mersenne(seed);
    var defaultFlags = [0xf22, 0x873];

    var settings = settingsParser.parse(rawSettings);
    var itemLocClone = itemLocations.clone();
    var classClone = classData.clone();

    itemLocations.prepItemLocations(itemLocClone, settings);

    if (settings['no-learning']) classData.removeUtilityPsynergy(classClone);
    if (settings['djinn-scale']) target = ups.applyPatch(target, upsDjinnScaling);

    if (settings['qol-fastship']) applyShipSpeedPatch(target);
    if (settings['qol-tickets']) applyGameTicketPatch(target);
    if (settings['qol-cutscenes']) {
        target = ups.applyPatch(target, upsCutsceneSkip);
        defaultFlags = cutsceneSkipFlags;
    }

    if (settings['ship'] >= 1) {
        defaultFlags.push(0x985);
        if (settings['ship'] == 2) {
            defaultFlags = defaultFlags.concat([0x982, 0x983, 0x8de, 0x907]);
        }
    }

    writeStoryFlags(target, defaultFlags);

    var spheres = [];
    if (settings['item-shuffle'] > 0) {
        var randomiser = new itemRandomiser.ItemRandomiser(prng, locations.clone(), settings);
        var attempts = 0;
        var success = false;
        while (attempts < 10 && !success) {
            try {
                randomiser.shuffleItems(itemLocClone);
                success = true;
            } catch (e) {
                ++attempts;
            }
        }
        if (!success) {
            console.log("RANDOMISATION FAILED AFTER 10 ATTEMPTS!");
            console.log("  > Seed: " + seed);
            console.log("  > Settings: " + rawSettings);
            return;
        }
        spheres = randomiser.getSpheres();
    }

    classData.randomisePsynergy(classClone, settings['class-psynergy'], prng);

    itemLocations.writeToRom(itemLocClone, target, settings['show-items']);
    classData.writeToRom(classClone, target);

    /*
    NOTE: TextUtil doesn't have a proper instance yet, so changing any line changes it globally

    textutil.writeLine(6152, "Karanum says hi.\x02");
    target = textutil.writeToRom(target);
    */

    /* ========== Spoiler Log ========== 
    var data = "";
    for (var i = 0; i < spheres.length; ++i) {
        if (data.length > 0) data += '\n';
        data += "=== Sphere " + i + " ===\n";
        spheres[i].forEach((flag) => {
            var item = itemLocClone[flag][0];
            data += flag + ": " + item['vanillaName'] + " => " + item['name'] + "\n";
        });
    }
    data += "\n=== All Items ===\n";

    for (var flag in itemLocClone) {
        if (!itemLocClone.hasOwnProperty(flag)) continue;
        var item = itemLocClone[flag][0];
        if (item['locked']) continue;
        data += flag + ": " + item['vanillaName'] + " => " + item['name'] + "\n"; 
    }
    fs.writeFileSync('./debug/output.log', data);
    // =================================*/

    var patch = ups.createPatch(vanillaRom, target);
    return patch;
}

initialise();

module.exports = {randomise};