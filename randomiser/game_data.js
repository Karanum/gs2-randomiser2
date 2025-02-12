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
const textutil = require('./game_logic/textutil.js');
const mapCode = require('./game_logic/map_code.js');

class VanillaData {
    constructor(rom) {
        this.text = textutil;
        this.itemLocations = itemLocations;
        this.music = musicData;
        this.mapCode = mapCode;

        this.classes = classData;
        this.abilities = abilityData;
        this.djinn = djinnData;
        this.summons = summonData;
        this.items = itemData;
        this.shops = shopData;
        this.forge = forgeData;
        this.characters = characterData;
        this.enemies = enemyData;
        this.elements = elementData;

        textutil.initialise(rom);
        abilityData.initialise(rom, textutil);
        classData.initialise(rom, textutil);
        djinnData.initialise(rom, textutil);
        summonData.initialise(rom);
        itemData.initialise(rom);
        shopData.initialise(rom);
        forgeData.initialise(rom);
        characterData.initialise(rom);
        enemyData.initialise(rom, textutil);
        elementData.initialise(rom);
        musicData.initialise(rom);
        itemLocations.initialise(rom, textutil, itemData);
        mapCode.initialise(rom);
    }
}

class GameData {
    constructor() {
        this.text = textutil.clone();
        this.itemLocations = itemLocations.clone();
        this.music = musicData.clone();
        this.mapCode = mapCode.clone();

        this.classes = classData.clone();
        this.abilities = abilityData.clone();
        this.djinn = djinnData.clone();
        this.summons = summonData.clone();
        this.items = itemData.clone();
        this.shops = shopData.clone();
        this.forge = forgeData.clone();
        this.characters = characterData.clone();
        this.enemies = enemyData.clone();
        this.elements = elementData.clone();
    }

    writeToRom(rom, prng, settings) {
        itemLocations.writeToRom(this.itemLocations, prng, rom, settings['show-items'], settings['remove-mimics']);

        classData.writeToRom(this.classes, rom);
        abilityData.writeToRom(this.abilities, rom);
        djinnData.writeToRom(this.djinn, rom);
        summonData.writeToRom(this.summons, rom);
        itemData.writeToRom(this.items, rom, this.text);
        shopData.writeToRom(this.shops, rom);
        forgeData.writeToRom(this.forge, rom);
        characterData.writeToRom(this.characters, rom);
        enemyData.writeToRom(this.enemies, rom);
        elementData.writeToRom(this.elements, rom);

        musicData.writeToRom(this.music, rom);
        textutil.writeToRom(this.text, rom);
        mapCode.writeToRom(this.mapCode, rom);
    }
}

module.exports = { VanillaData, GameData };