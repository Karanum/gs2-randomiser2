const fs = require("fs");
const mersenne = require('../modules/mersenne.js');

const ups = require('./ups.js');
const settingsParser = require('./settings.js');
const spoilerLog = require('./spoiler_log.js');
const { VanillaData, GameData } = require('./game_data.js');

const locations = require('./game_logic/locations.js');
const textutil = require('./game_logic/textutil.js');
const itemRandomiser = require('./game_logic/randomisers/item_randomiser.js');
const archipelagoFiller = require('./game_logic/randomisers/archipelago_filler.js');
const hintSystem = require('./game_logic/hint_system.js');
const credits = require('./game_logic/credits.js');
const { IconManager } = require('./game_logic/icons.js');

const endgameShortcutPatch = require('./patches/innate/endgame_shortcuts.js');
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

const {applyGameTicketPatch, applyShipSpeedPatch, applyCheapRevivePatch, applyFixedRevivePatch, applyHalvedRatePatch} = require('./patches/mini_patches.js');

// List of in-game flags to turn on when cutscene skip is enabled
const cutsceneSkipFlags = [0xf22, 0x890, 0x891, 0x892, 0x893, 0x894, 0x895, 0x896, 0x848, 0x86c, 0x86d, 0x86e, 0x86f,
        0x916, 0x844, 0x863, 0x864, 0x865, 0x867, 0x872, 0x873, 0x84b, 0x91b, 0x91c, 0x91d, 0x8b2, 0x8b3, 0x8b4,
        0x8a9, 0x8ac, 0x904, 0x971, 0x973, 0x974, 0x924, 0x928, 0x929, 0x92a, 0x880, 0x8f1, 0x8f3, 0x8f5, 0xa6c,
        0x8f6, 0x8fc, 0x8fe, 0x910, 0x911, 0x913, 0x980, 0x981, 0x961, 0x964, 0x965, 0x966, 0x968, 0x962, 0x969,
        0x96a, 0xa8c, 0x88f, 0x8f0, 0x9b1, 0xa78, 0x90c, 0xa2e, 0x9c0, 0x9c1, 0x9c2, 0x908, 0x94F, 0x8bd, 0x8dd];

var vanillaRom = new Uint8Array(fs.readFileSync("./randomiser/rom/gs2.gba"));
var rom = Uint8Array.from(vanillaRom);

var vanillaData;

/**
 * Initialises the randomiser
 */
function initialise() {
    rom = generalPatch.changeRomSize(rom);

    teleportPatch.apply(rom);
    generalPatch.apply(rom);
    trialRoadPatch.apply(rom);
    backEntrancePatch.apply(rom);

    credits.writeToRom(rom);

    textutil.writeLine(undefined, 1504, "Starburst");

    // Change critical boost display
    textutil.writeLine(undefined, 4226, "Crit Rate");
    rom[0xFBA18] = 0x2C;
    rom[0xFBA19] = 0xBA;

    // Remove "Update" option from main menu
    rom[0x4D62E] = 0x0;
    rom[0x4D62F] = 0xE0;

    vanillaData = new VanillaData(rom);
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
function applyPreRandomisation(target, prng, settings, gameData, iconManager) {
    var defaultFlags = [0xf22, 0x873, 0x844, 0x863, 0x864, 0x865, 0x867];

    // Preparing item locations for randomisation and determining which locations to shuffle
    vanillaData.itemLocations.prepItemLocations(gameData.itemLocations, settings);

    // Applying innate map code patches
    gabombaPuzzlePatch.apply(gameData.mapCode, gameData.text);
    fastForgingPatch.apply(gameData.mapCode, gameData.text);
    tutorialNpcPatch.apply(gameData.mapCode, gameData.text, settings);
    endgameShortcutPatch.apply(gameData.mapCode);
    if (settings['show-items']) fixLemurianShipPatch.applyChestFix(gameData.mapCode);

    // Applying settings
    if (settings['free-avoid']) gameData.abilities[150].cost = 0;
    if (settings['free-retreat']) {
        if (!(settings['skips-basic'] || settings['skips-sq'] || settings['skips-oob']) || settings['manual-rg']) {
            gameData.abilities[149].cost = 0;
            gameData.abilities[156].cost = 0;
        }
    }

    if (settings['djinn-scale']) djinnScalingPatch.apply(target, gameData.enemies, gameData.text);
    if (settings['qol-fastship']) applyShipSpeedPatch(target);
    if (settings['qol-tickets']) applyGameTicketPatch(target);
    if (settings['qol-cutscenes']) {
        cutsceneSkipPatch.apply(gameData.mapCode, gameData.text);
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
            fixLemurianShipPatch.applyEntranceFix(gameData.mapCode);
        }
    }
    if (settings['ship-wings']) defaultFlags = defaultFlags.concat([0x8df]);

    if (settings['hard-mode']) defaultFlags = defaultFlags.concat([0x2E]);

    // Set Anemos Inner Sanctum Djinn requirement
    var anemosDjinnReq = 72;
    if (settings['anemos-access'] == 1) {
        anemosRequirementsPatch.apply(gameData.mapCode, gameData.text);
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
        addCharacterShufflePatch.apply(target, gameData.mapCode, settings, gameData.text, iconManager);
        locations.prepCharacterShuffleLocations(locationsClone, gameData.itemLocations);
    }

    writeStoryFlags(target, defaultFlags);

    return locationsClone;
}

/**
 * Applies patches and edits that should occur after the item randomisation step
 */
function applyPostRandomisation(prng, target, randomiser, settings, gameData) {
    // Applying more settings
    if (settings['easier-bosses']) easierBossesPatch.apply(rom, gameData.enemies, gameData.abilities);

    if (settings['psynergy-power']) vanillaData.abilities.adjustAbilityPower(gameData.abilities, "Psynergy", prng);
    if (settings['psynergy-cost']) vanillaData.abilities.adjustPsynergyCost(gameData.abilities, prng);
    if (settings['psynergy-aoe']) vanillaData.abilities.randomiseAbilityRange(gameData.abilities, "Psynergy", prng);
    if (settings['enemypsy-power']) vanillaData.abilities.adjustAbilityPower(gameData.abilities, "Enemy", prng);
    if (settings['enemypsy-aoe']) vanillaData.abilities.randomiseAbilityRange(gameData.abilities, "Enemy", prng);

    vanillaData.classes.randomisePsynergy(gameData.classes, settings['class-psynergy'], prng);
    vanillaData.classes.randomiseLevels(gameData.classes, settings['class-levels'], prng);
    if (settings['class-stats']) vanillaData.classes.randomiseStats(gameData.classes, prng);
    if (settings['no-learning']) vanillaData.classes.removeUtilityPsynergy(gameData.classes);

    if (settings['djinn-stats']) vanillaData.djinn.shuffleStats(gameData.djinn, prng);
    if (settings['djinn-power']) vanillaData.abilities.adjustAbilityPower(gameData.abilities, "Djinn", prng);
    if (settings['djinn-aoe']) vanillaData.abilities.randomiseAbilityRange(gameData.abilities, "Djinn", prng);
    if (settings['summon-power']) vanillaData.abilities.adjustAbilityPower(gameData.abilities, "Summon", prng);
    if (settings['summon-cost']) vanillaData.summons.randomiseCost(gameData.summons, gameData.abilities, prng);

    if (settings['equip-shuffle']) vanillaData.items.randomiseCompatibility(gameData.items, prng);
    if (settings['equip-stats']) vanillaData.items.adjustStats(gameData.items, prng);
    if (settings['equip-cost']) vanillaData.items.adjustEquipPrices(gameData.items, prng);
    if (settings['equip-unleash']) vanillaData.items.shuffleWeaponEffects(gameData.items, prng);
    if (settings['equip-effect']) vanillaData.items.shuffleArmourEffects(gameData.items, prng);

    if (settings['curse-disable']) vanillaData.items.disableCurses(gameData.items);
    else if (settings['equip-curse']) vanillaData.items.shuffleCurses(gameData.items, prng);

    if (settings['equip-attack']) vanillaData.items.shuffleWeaponStats(gameData.items, prng);
    if (settings['equip-defense']) vanillaData.items.shuffleArmourStats(gameData.items, prng);

    if (settings['char-stats'] == 1) vanillaData.characters.shuffleStats(gameData.characters, prng);
    if (settings['char-stats'] == 2) vanillaData.characters.adjustStats(gameData.characters, prng);
    if (settings['char-element'] == 1) vanillaData.characters.shuffleElements(gameData.characters, prng, true);
    if (settings['char-element'] == 2) vanillaData.characters.shuffleElements(gameData.characters, prng, false);

    if (settings['enemy-eres'] == 1) vanillaData.elements.shuffleResistances(gameData.elements, prng);
    if (settings['enemy-eres'] == 2) vanillaData.elements.randomiseResistances(gameData.elements, prng);

    if (settings['adv-equip']) randomiser.shuffleEquipmentAdvanced(prng, gameData.items, gameData.shops, gameData.forge);
    if (settings['music-shuffle']) vanillaData.music.shuffleBGM(gameData.music, prng);

    if (settings['equip-sort']) randomiser.sortEquipment(gameData.items);
    if (settings['summon-sort']) randomiser.sortSummons();
    if (!settings['boss-logic']) randomiser.sortMimics();
    
    vanillaData.enemies.scaleBattleRewards(gameData.enemies, settings['scale-coins'], settings['scale-exp']);

    let characters = [4, 5, 6];
    if (settings['shuffle-characters']) {
        characters = [4, gameData.itemLocations['0xd05'][0].contents - 0xD00];
    }
    vanillaData.abilities.setStartingPsynergy(target, settings, prng, characters);

    if (settings['manual-rg']) retreatGlitchPatch.apply(target, gameData.text);

    fixCharPatch.apply(gameData.mapCode, gameData.djinn);

    if (settings['fixed-puzzles']) {
        puzzlesPatch.applyFixed(gameData.mapCode);
    } else if (settings['random-puzzles']) {
        puzzlesPatch.applyRandom(gameData.mapCode, prng);
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

    var iconManager = new IconManager();
    var gameData = new GameData(vanillaData);

    var locationsClone = applyPreRandomisation(target, prng, settings, gameData, iconManager);

    // Performing randomisation until a valid seed is found, or too many randomisations have been performed
    var randomiser = new itemRandomiser.ItemRandomiser(prng, locationsClone, settings);
    if (settings['item-shuffle'] > 0) {
        var attempts = 0;
        var success = false;
        while (attempts < 10 && !success) {
            try {
                randomiser.shuffleItems(gameData.itemLocations);
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
        randomiser.shuffleItems(gameData.itemLocations);
    }

    // Post-randomisation
    if (settings['djinn-shuffle']) vanillaData.djinn.shuffleDjinn(gameData.djinn, prng);
    if (settings['show-items'] && !settings['remove-mimics']) mimicDisguisePatch.apply(target, gameData.text, prng, false, settings['shuffle-characters']);

    applyPostRandomisation(prng, target, randomiser, settings, gameData);

    var spheres = randomiser.getSpheres();
    vanillaData.characters.adjustStartingLevels(gameData.characters, settings['start-levels'], settings['shuffle-characters'], spheres, gameData.itemLocations);
    if (settings['qol-hints']) hintSystem.writeHints(prng, gameData.text, spheres, gameData.itemLocations);

    // Writing the modified data containers to the new ROM file
    gameData.writeToRom(target, prng, settings);
    iconManager.writeToRom(target);

    // Creating the spoiler log and calling the callback function with the patch data
    spoilerLog.generate(spoilerFilePath, settings, spheres, gameData.itemLocations, gameData.djinn, gameData.characters,
        gameData.classes, gameData.shops, gameData.forge, gameData.items, () => {callback(ups.createPatch(vanillaRom, target));});
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
    var prng = mersenne(Array.from(seed));
    var settings = settingsParser.parse(rawSettings);

    var iconManager = new IconManager();
    var gameData = new GameData(vanillaData);

    var locationsClone = applyPreRandomisation(target, prng, settings, gameData, iconManager);

    var i = 0;
    while (i < userName.length && i < 64) {
        target[0xFFF000 + i] = (userName.charCodeAt(i) & 0xFF);
        ++i;
    }

    // Apply the Archipelago patch
    archipelagoPatch.apply(target, gameData.text, iconManager);

    // Apply fixed locations
    var randomiser = new archipelagoFiller.ArchipelagoFiller(prng, locationsClone, settings);
    randomiser.placeItems(itemMapping, gameData.itemLocations);
    randomiser.placeDjinn(djinnMapping, gameData.djinn);

    // Post-randomisation
    if (settings['show-items'] && !settings['remove-mimics']) mimicDisguisePatch.apply(target, gameData.text, prng, randomiser.isMultiworld, false);

    applyPostRandomisation(prng, target, randomiser, settings, gameData);

    vanillaData.characters.adjustStartingLevels(gameData.characters, settings['start-levels'], false, [], gameData.itemLocations);

    // Writing the modified data containers to the new ROM file
    gameData.writeToRom(target, prng, settings);
    iconManager.writeToRom(target);

    callback(ups.createPatch(vanillaRom, target));
}

initialise();

module.exports = {randomise, randomiseArchipelago};