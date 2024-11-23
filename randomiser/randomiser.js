const fs = require("fs");
const mersenne = require('../modules/mersenne.js');

const ups = require('./ups.js');
const settingsParser = require('./settings.js');
const spoilerLog = require('./spoiler_log.js');

const locations = require('./game_logic/locations.js');
const textutil = require('./game_logic/textutil.js');
const itemRandomiser = require('./game_logic/randomisers/item_randomiser.js');
const archipelagoFiller = require('./game_logic/randomisers/archipelago_filler.js');
const hintSystem = require('./game_logic/hint_system.js');
const credits = require('./game_logic/credits.js');
const mapCode = require('./game_logic/map_code.js');

const itemLocations = require('./game_data/item_locations.js');
const classData = require('./game_data/classes.js');
const abilityData = require('./game_data/abilities.js');
const djinnData = require('./game_data/djinn.js');
const summonData = require('./game_data/summons.js');
const itemData = require('./game_data/items.js');
const shopData = require('./game_data/shops.js');
const forgeData = require('./game_data/forgeables.js');
const characterData = require('./game_data/characters.js');
const enemyData = require('./game_data/enemies.js');
const elementData = require('./game_data/elem_tables.js');
const musicData = require('./game_data/music.js');

const endgameShortcutPatch = require('./patches/innate/endgame_shortcuts.js');
const extraIconsPatch = require('./patches/innate/extra_icons.js');
const fastForgingPatch = require('./patches/innate/fast_forging.js');
const fixCharPatch = require('./patches/innate/fix_char.js');
const fixLemurianShipPatch = require('./patches/innate/fix_lemurian_ship.js');
const gabombaPuzzlePatch = require('./patches/innate/gabomba_puzzle.js');
const generalPatch = require('./patches/innate/randomiser_general.js');
const teleportPatch = require('./patches/innate/teleport.js');
const tutorialNpcPatch = require('./patches/innate/tutorial_npcs.js');
const trialRoadPatch = require('./patches/innate/trial_road.js');
const backEntrancePatch = require('./patches/innate/register_back_entrances.js');

const addCharacterShufflePatch = require('./patches/options/add_character_items.js');
const anemosRequirementsPatch = require('./patches/options/anemos_requirements.js');
const archipelagoPatch = require('./patches/options/archipelago.js');
const avoidPatch = require('./patches/options/avoid.js');
const cutsceneSkipPatch = require('./patches/options/cutscene_skip.js');
const djinnScalingPatch = require('./patches/options/djinn_scaling.js');
const easierBossesPatch = require('./patches/options/easier_bosses.js');
const mimicDisguisePatch = require('./patches/options/mimic_disguise.js');
const puzzlesPatch = require('./patches/options/puzzles.js');
const retreatGlitchPatch = require('./patches/options/retreat_glitch.js');
const teleportEverywherePatch = require('./patches/options/teleport_everywhere.js');

// List of in-game flags to turn on when cutscene skip is enabled
const cutsceneSkipFlags = [0xf22, 0x890, 0x891, 0x892, 0x893, 0x894, 0x895, 0x896, 0x848, 0x86c, 0x86d, 0x86e, 0x86f,
        0x916, 0x844, 0x863, 0x864, 0x865, 0x867, 0x872, 0x873, 0x84b, 0x91b, 0x91c, 0x91d, 0x8b2, 0x8b3, 0x8b4,
        0x8a9, 0x8ac, 0x904, 0x971, 0x973, 0x974, 0x924, 0x928, 0x929, 0x92a, 0x880, 0x8f1, 0x8f3, 0x8f5, 0xa6c,
        0x8f6, 0x8fc, 0x8fe, 0x910, 0x911, 0x913, 0x980, 0x981, 0x961, 0x964, 0x965, 0x966, 0x968, 0x962, 0x969,
        0x96a, 0xa8c, 0x88f, 0x8f0, 0x9b1, 0xa78, 0x90c, 0xa2e, 0x9c0, 0x9c1, 0x9c2, 0x908, 0x94F, 0x8bd, 0x8dd];

var vanillaRom = new Uint8Array(fs.readFileSync("./randomiser/rom/gs2.gba"));
var rom = Uint8Array.from(vanillaRom);

/**
 * Perform a timing on the specified function
 * @param {string} msg The message to show in console when starting the task
 * @param {Function} callback The function to execute
 */
function doTiming(msg, callback) {
    var timing = Date.now();
    process.stdout.write(msg + ' ');
    callback();
    console.log(Date.now() - timing + "ms");
}

/**
 * Write a sequence of bytes to the target
 * @param {Uint8Array} target 
 * @param {uint} start 
 * @param {byte[]} bytes 
 */
function writeByteSequence(target, start, bytes) {
    bytes.forEach((byte) => target[start++] = byte);
}

/**
 * Initialises the randomiser
 */
function initialise() {
    doTiming("Applying innate patches...", () => {
        // Adjust ROM size to accomodate for added data
        rom = generalPatch.changeRomSize(rom);

        teleportPatch.apply(rom);
        generalPatch.apply(rom);
        trialRoadPatch.apply(rom);
        extraIconsPatch.apply(rom);
    });
    credits.writeToRom(rom);

    doTiming("Decoding text data...", () => textutil.initialise(rom));
    doTiming("Loading ability data...", () => abilityData.initialise(rom, textutil));
    doTiming("Loading class data...", () => classData.initialise(rom, textutil));
    doTiming("Loading Djinn data...", () => djinnData.initialise(rom, textutil));
    doTiming("Loading summon data...", () => summonData.initialise(rom));
    doTiming("Loading item data...", () => itemData.initialise(rom));
    doTiming("Loading shop data...", () => shopData.initialise(rom));
    doTiming("Loading forgeable data...", () => forgeData.initialise(rom));
    doTiming("Loading character data...", () => characterData.initialise(rom));
    doTiming("Loading enemy data...", () => enemyData.initialise(rom, textutil));
    doTiming("Loading elemental tables...", () => elementData.initialise(rom));
    doTiming("Loading music data...", () => musicData.initialise(rom));
    doTiming("Loading item location data...", () => itemLocations.initialise(rom, textutil, itemData));
    doTiming("Loading map code...", () => mapCode.initialise(rom));

    textutil.writeLine(undefined, 1504, "Starburst");

    // Change critical boost display
    textutil.writeLine(undefined, 4226, "Crit Rate");
    rom[0xFBA18] = 0x2C;
    rom[0xFBA19] = 0xBA;

    // Remove "Update" option from main menu
    rom[0x4D62E] = 0x0;
    rom[0x4D62F] = 0xE0;

    // Apply the back entrance patch
    backEntrancePatch.apply(rom);
}

/**
 * Applies Game Ticket removal patch to the ROM
 * @param {Uint8Array} target 
 */
function applyGameTicketPatch(target) {
    target[0xAFED4] = 0x70;
    target[0xAFED5] = 0x47;
}

/**
 * Applies ship overworld speed patch to the ROM
 * @param {Uint8Array} target 
 */
function applyShipSpeedPatch(target) {
    target[0x285A4] = 0xF0;
}

/**
 * Applies revive cost reduction to the ROM
 * @param {Uint8Array} target 
 */
function applyCheapRevivePatch(target) {
    writeByteSequence(target, 0x10A874, [0x50, 0x00, 0xC0, 0x46, 0xC0, 0x46]);
}

/**
 * Applies fixed revive cost to the ROM
 * @param {Uint8Array} target 
 */
function applyFixedRevivePatch(target) {
    writeByteSequence(target, 0x10A874, [0x64, 0x20, 0xC0, 0x46, 0xC0, 0x46]);
}

/**
 * Applies encounter rate halving to the ROM
 * @param {Uint8Array} target 
 */
function applyHalvedRatePatch(target) {
    target[0xCA0B8] = 0x78;
}

/**
 * Writes a list of flags to auto-enable to the ROM
 * @param {Uint8Array} target 
 * @param {int[]} flags 
 */
function writeStoryFlags(target, flags) {
    var addr = 0xF4280;
    flags.forEach((flag) => {
        target[addr] = (flag & 0xFF);
        target[addr + 1] = (flag >> 8);
        addr += 2;
    });
}

/**
 * Applies patches and edits that should occur before the item randomisation step
 */
function applyPreRandomisation(target, prng, settings, abilityClone, enemyClone, itemLocClone, mapCodeClone, textClone) {
    var defaultFlags = [0xf22, 0x873, 0x844, 0x863, 0x864, 0x865, 0x867];

    // Preparing item locations for randomisation and determining which locations to shuffle
    itemLocations.prepItemLocations(itemLocClone, settings);

    // Applying innate map code patches
    gabombaPuzzlePatch.apply(mapCodeClone, textClone);
    fastForgingPatch.apply(mapCodeClone, textClone);
    tutorialNpcPatch.apply(mapCodeClone, textClone, settings);
    endgameShortcutPatch.apply(mapCodeClone);
    if (settings['show-items']) fixLemurianShipPatch.applyChestFix(mapCodeClone);

    // Applying settings
    if (settings['free-avoid']) abilityClone[150].cost = 0;
    if (settings['free-retreat']) {
        if (!(settings['skips-basic'] || settings['skips-sq'] || settings['skips-oob']) || settings['manual-rg']) {
            abilityClone[149].cost = 0;
            abilityClone[156].cost = 0;
        }
    }

    if (settings['djinn-scale']) djinnScalingPatch.apply(target, enemyClone, textClone);
    if (settings['qol-fastship']) applyShipSpeedPatch(target);
    if (settings['qol-tickets']) applyGameTicketPatch(target);
    if (settings['qol-cutscenes']) {
        cutsceneSkipPatch.apply(mapCodeClone, textClone);
        defaultFlags = cutsceneSkipFlags;
    }
    if (settings['sanc-revive'] == 1) applyCheapRevivePatch(target);
    if (settings['sanc-revive'] == 2) applyFixedRevivePatch(target);
    if (settings['halve-enc']) applyHalvedRatePatch(target);
    if (settings['avoid-patch']) avoidPatch.apply(target);
    if (settings['teleport-everywhere']) teleportEverywherePatch.apply(target);

    if (settings['ship'] >= 1) {
        defaultFlags = defaultFlags.concat([0x985]);
        if (settings['ship'] == 2) {
            defaultFlags = defaultFlags.concat([0x982, 0x983, 0x8de, 0x907]);
        } else if (settings['ship'] == 1) {
            fixLemurianShipPatch.applyEntranceFix(mapCodeClone);
        }
    }
    if (settings['ship-wings']) defaultFlags = defaultFlags.concat([0x8df]);

    if (settings['hard-mode']) defaultFlags = defaultFlags.concat([0x2E]);

    // Set Anemos Inner Sanctum Djinn requirement
    var anemosDjinnReq = 72;
    if (settings['anemos-access'] == 1) {
        anemosRequirementsPatch.apply(mapCodeClone, textClone);
        anemosDjinnReq = Math.min(Math.floor(prng.random() * 13) + 16, Math.floor(prng.random() * 13) + 16);
        target[0x1007902] = anemosDjinnReq;
    } else if (settings['anemos-access'] == 2) {
        anemosDjinnReq = 0;
        defaultFlags = defaultFlags.concat([0xa87, 0xa88, 0xa89, 0xa8a, 0xa8b]);
    }

    var locationsClone = locations.clone();
    if (anemosDjinnReq > 0) {
        locationsClone[0].filter((loc) => loc.Origin == 'Anemos Inner Sanctum').forEach((loc) => {
            loc.Reqs.forEach((req) => req.push(`AnyDjinn_${anemosDjinnReq}`));
        });
    }

    // Apply character shuffle
    if (settings['shuffle-characters']) {
        addCharacterShufflePatch.apply(target, mapCodeClone, settings, textClone);
        locations.prepCharacterShuffleLocations(locationsClone, itemLocClone);
    }

    writeStoryFlags(target, defaultFlags);

    return locationsClone;
}

/**
 * Applies patches and edits that should occur after the item randomisation step
 */
function applyPostRandomisation(prng, target, randomiser, settings, abilityClone, characterClone, classClone, djinnClone, elementClone, enemyClone, forgeClone, itemClone, itemLocClone, mapCodeClone, musicClone, shopClone, summonClone, textClone) {
    // Applying more settings
    if (settings['easier-bosses']) easierBossesPatch.apply(rom, enemyClone, abilityClone);

    if (settings['psynergy-power']) abilityData.adjustAbilityPower(abilityClone, "Psynergy", prng);
    if (settings['psynergy-cost']) abilityData.adjustPsynergyCost(abilityClone, prng);
    if (settings['psynergy-aoe']) abilityData.randomiseAbilityRange(abilityClone, "Psynergy", prng);
    if (settings['enemypsy-power']) abilityData.adjustAbilityPower(abilityClone, "Enemy", prng);
    if (settings['enemypsy-aoe']) abilityData.randomiseAbilityRange(abilityClone, "Enemy", prng);

    classData.randomisePsynergy(classClone, settings['class-psynergy'], prng);
    classData.randomiseLevels(classClone, settings['class-levels'], prng);
    if (settings['class-stats']) classData.randomiseStats(classClone, prng);
    if (settings['no-learning']) classData.removeUtilityPsynergy(classClone);

    if (settings['djinn-stats']) djinnData.shuffleStats(djinnClone, prng);
    if (settings['djinn-power']) abilityData.adjustAbilityPower(abilityClone, "Djinn", prng);
    if (settings['djinn-aoe']) abilityData.randomiseAbilityRange(abilityClone, "Djinn", prng);
    if (settings['summon-power']) abilityData.adjustAbilityPower(abilityClone, "Summon", prng);
    if (settings['summon-cost']) summonData.randomiseCost(summonClone, abilityClone, prng);

    if (settings['equip-shuffle']) itemData.randomiseCompatibility(itemClone, prng);
    if (settings['equip-stats']) itemData.adjustStats(itemClone, prng);
    if (settings['equip-cost']) itemData.adjustEquipPrices(itemClone, prng);
    if (settings['equip-unleash']) itemData.shuffleWeaponEffects(itemClone, prng);
    if (settings['equip-effect']) itemData.shuffleArmourEffects(itemClone, prng);
    if (settings['curse-disable'])
        itemData.disableCurses(itemClone);
    else if (settings['equip-curse']) 
        itemData.shuffleCurses(itemClone, prng);
    if (settings['equip-attack']) itemData.shuffleWeaponStats(itemClone, prng);
    if (settings['equip-defense']) itemData.shuffleArmourStats(itemClone, prng);

    if (settings['char-stats'] == 1) characterData.shuffleStats(characterClone, prng);
    if (settings['char-stats'] == 2) characterData.adjustStats(characterClone, prng);
    if (settings['char-element'] == 1) characterData.shuffleElements(characterClone, prng, true);
    if (settings['char-element'] == 2) characterData.shuffleElements(characterClone, prng, false);

    if (settings['enemy-eres'] == 1) elementData.shuffleResistances(elementClone, prng);
    if (settings['enemy-eres'] == 2) elementData.randomiseResistances(elementClone, prng);

    if (settings['adv-equip']) randomiser.shuffleEquipmentAdvanced(prng, itemClone, shopClone, forgeClone);
    if (settings['music-shuffle']) musicData.shuffleBGM(musicClone, prng);

    if (settings['equip-sort']) randomiser.sortEquipment(itemClone);
    if (settings['summon-sort']) randomiser.sortSummons();
    if (!settings['boss-logic']) randomiser.sortMimics();
    
    enemyData.scaleBattleRewards(enemyClone, settings['scale-coins'], settings['scale-exp']);

    let characters = [4, 5, 6];
    if (settings['shuffle-characters']) {
        characters = [4, itemLocClone['0xd05'][0].contents - 0xD00];
    }
    abilityData.setStartingPsynergy(target, settings, prng, characters);

    if (settings['manual-rg']) retreatGlitchPatch.apply(target, textClone);

    fixCharPatch.apply(mapCodeClone, djinnClone);

    if (settings['fixed-puzzles']) {
        puzzlesPatch.applyFixed(mapCodeClone);
    } else if (settings['random-puzzles']) {
        puzzlesPatch.applyRandom(mapCodeClone, prng);
    }
}

/**
 * Generates a randomised ROM
 * @param {number} seed The PRNG initialisation seed
 * @param {byte[]} rawSettings The binary encoded randomiser settings
 * @param {string} spoilerFilePath The file path to save the spoiler log to
 * @param {(patch : Uint8Array) => void} callback Callback function upon completion, passing the UPS patch data as a parameter
 */
function randomise(seed, rawSettings, spoilerFilePath, callback) {
    var target = rom.slice(0);
    var prng = mersenne(seed);
    var settings = settingsParser.parse(rawSettings);

    // Cloning the (mostly) vanilla data containers
    var textClone = textutil.clone();
    var itemLocClone = itemLocations.clone();
    var classClone = classData.clone();
    var abilityClone = abilityData.clone();
    var djinnClone = djinnData.clone();
    var summonClone = summonData.clone();
    var itemClone = itemData.clone();
    var shopClone = shopData.clone();
    var forgeClone = forgeData.clone();
    var characterClone = characterData.clone();
    var enemyClone = enemyData.clone();
    var elementClone = elementData.clone();
    var musicClone = musicData.clone();
    var mapCodeClone = mapCode.clone();

    var locationsClone = applyPreRandomisation(target, prng, settings, abilityClone, enemyClone, itemLocClone, mapCodeClone, textClone);

    // Performing randomisation until a valid seed is found, or too many randomisations have been performed
    var randomiser = new itemRandomiser.ItemRandomiser(prng, locationsClone, settings);
    if (settings['item-shuffle'] > 0) {
        var attempts = 0;
        var success = false;
        while (attempts < 10 && !success) {
            try {
                randomiser.shuffleItems(itemLocClone);
                success = true;
            } catch (e) {
                console.error(e);
                ++attempts;
            }
        }
        if (!success) {
            console.log("RANDOMISATION FAILED AFTER 10 ATTEMPTS!");
            console.log("  > Seed: " + seed);
            console.log("  > Settings: " + rawSettings);
            return;
        }
    } else {
        randomiser.shuffleItems(itemLocClone);
    }

    // Post-randomisation
    if (settings['djinn-shuffle']) djinnData.shuffleDjinn(djinnClone, prng);
    if (settings['show-items'] && !settings['remove-mimics']) mimicDisguisePatch.apply(target, textClone, prng, false, settings['shuffle-characters']);

    applyPostRandomisation(prng, target, randomiser, settings, abilityClone, characterClone, classClone, djinnClone, elementClone, enemyClone, 
        forgeClone, itemClone, itemLocClone, mapCodeClone, musicClone, shopClone, summonClone, textClone);

    var spheres = randomiser.getSpheres();
    characterData.adjustStartingLevels(characterClone, settings['start-levels'], settings['shuffle-characters'], spheres, itemLocClone);
    if (settings['qol-hints']) hintSystem.writeHints(prng, textClone, spheres, itemLocClone);

    // Writing the modified data containers to the new ROM file
    itemLocations.writeToRom(itemLocClone, prng, target, settings['show-items'], settings['remove-mimics']);
    classData.writeToRom(classClone, target);
    abilityData.writeToRom(abilityClone, target);
    djinnData.writeToRom(djinnClone, target);
    summonData.writeToRom(summonClone, target);
    itemData.writeToRom(itemClone, target, textClone);
    shopData.writeToRom(shopClone, target);
    forgeData.writeToRom(forgeClone, target);
    characterData.writeToRom(characterClone, target);
    enemyData.writeToRom(enemyClone, target);
    elementData.writeToRom(elementClone, target);
    musicData.writeToRom(musicClone, target);

    textutil.writeToRom(textClone, target);
    mapCode.writeToRom(mapCodeClone, target);

    // Creating the spoiler log and calling the callback function with the patch data
    spoilerLog.generate(spoilerFilePath, settings, spheres, itemLocClone, djinnClone, characterClone,
        classClone, shopClone, forgeClone, itemClone, () => {callback(ups.createPatch(vanillaRom, target));});
}

/**
 * Generates an Archipelago ROM
 * @param {Uint8Array} seed 
 * @param {Uint8Array} rawSettings 
 * @param {string} userName 
 * @param {any} itemMapping 
 * @param {any} djinnMapping 
 * @param {(patch : Uint8Array) => void} callback 
 */
function randomiseArchipelago(seed, rawSettings, userName, itemMapping, djinnMapping, callback) {
    var target = rom.slice(0);
    var prng = mersenne(seed);
    var settings = settingsParser.parse(rawSettings);

    // Cloning the (mostly) vanilla data containers
    var textClone = textutil.clone();
    var itemLocClone = itemLocations.clone();
    var classClone = classData.clone();
    var abilityClone = abilityData.clone();
    var djinnClone = djinnData.clone();
    var summonClone = summonData.clone();
    var itemClone = itemData.clone();
    var shopClone = shopData.clone();
    var forgeClone = forgeData.clone();
    var characterClone = characterData.clone();
    var enemyClone = enemyData.clone();
    var elementClone = elementData.clone();
    var musicClone = musicData.clone();
    var mapCodeClone = mapCode.clone();

    var locationsClone = applyPreRandomisation(target, prng, settings, abilityClone, enemyClone, itemLocClone, mapCodeClone, textClone);

    var i = 0;
    while (i < userName.length && i < 64) {
        target[0xFFF000 + i] = (userName.charCodeAt(i) & 0xFF);
        ++i;
    }

    // Apply the Archipelago patch
    archipelagoPatch.apply(target, settings, textClone);

    // Apply fixed locations
    var randomiser = new archipelagoFiller.ArchipelagoFiller(prng, locationsClone, settings);
    randomiser.placeItems(itemMapping, itemLocClone);
    randomiser.placeDjinn(djinnMapping, djinnClone);

    // Post-randomisation
    if (settings['show-items'] && !settings['remove-mimics']) mimicDisguisePatch.apply(target, textClone, prng, true, false);

    applyPostRandomisation(prng, target, randomiser, settings, abilityClone, characterClone, classClone, djinnClone, elementClone, enemyClone, 
        forgeClone, itemClone, itemLocClone, mapCodeClone, musicClone, shopClone, summonClone, textClone);

    //var spheres = randomiser.getSpheres();
    //var spheres = [['Isaac', 'Garet', 'Ivan', 'Mia', 'Jenna', 'Sheba', 'Piers']];
    characterData.adjustStartingLevels(characterClone, settings['start-levels'], false, [], itemLocClone);

    // Writing the modified data containers to the new ROM file
    itemLocations.writeToRom(itemLocClone, prng, target, settings['show-items'], settings['remove-mimics']);
    classData.writeToRom(classClone, target);
    abilityData.writeToRom(abilityClone, target);
    djinnData.writeToRom(djinnClone, target);
    summonData.writeToRom(summonClone, target);
    itemData.writeToRom(itemClone, target, textClone);
    shopData.writeToRom(shopClone, target);
    forgeData.writeToRom(forgeClone, target);
    characterData.writeToRom(characterClone, target);
    enemyData.writeToRom(enemyClone, target);
    elementData.writeToRom(elementClone, target);
    musicData.writeToRom(musicClone, target);

    textutil.writeToRom(textClone, target);
    mapCode.writeToRom(mapCodeClone, target);

    callback(ups.createPatch(vanillaRom, target));
}

initialise();

module.exports = {randomise, randomiseArchipelago};