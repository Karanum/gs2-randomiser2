import { readFileSync } from "node:fs";
import { AbilityManager } from "./data/abilities/manager";
import { timeFunction } from "$lib/util";
import { CharacterManager } from "./data/characters/manager";
import { BinaryView } from "./binary_view";
import { TextManager } from "./data/text/manager";
import { ClassManager } from "./data/classes/manager";
import { DjinniManager } from "./data/djinn/manager";
import { EnemyManager } from "./data/enemies/manager";
import { ElementTableManager } from "./data/element_tables/manager";
import { EncounterTableManager } from "./data/encounter_tables/manager";
import { EnemyGroupManager } from "./data/enemy_groups/manager";
import { ForgeResultManager } from "./data/forge_results/manager";
import { ItemManager } from "./data/items/manager";
import { MusicManager } from "./data/music/manager";
import { ShopManager } from "./data/shops/manager";
import { SummonManager } from "./data/summons/manager";
import { ItemLocationManager } from "./data/item_locations/manager";

const MFT = 0x680000;

/**
 * Represents the full ROM data from the game. Includes utility methods for easy reading and writing of binary data.
 */
export class RomData extends BinaryView
{
    readonly abilities : AbilityManager;
    readonly characters : CharacterManager;
    readonly classes : ClassManager;
    readonly djinn : DjinniManager;
    readonly elementTables : ElementTableManager;
    readonly encounterTables : EncounterTableManager;
    readonly enemies : EnemyManager;
    readonly enemyGroups : EnemyGroupManager;
    readonly forgeResults : ForgeResultManager;
    readonly items : ItemManager;
    readonly itemLocations : ItemLocationManager;
    readonly text : TextManager;
    readonly music : MusicManager;
    readonly shops : ShopManager;
    readonly summons : SummonManager;

    /**
     * @param instance (optional) An existing `RomData` instance to clone; will load and parse data from `src/rom/gs2.gba` if not provided
     */
    constructor(instance? : RomData) 
    {
        super();

        if (instance == undefined) {
            // Creates the RomData from the ROM file
            console.log('Loading game data from ROM...');
            const file = readFileSync("./src/rom/gs2.gba");
            this.data = Uint8Array.from(file);

            this.text = timeFunction(() => TextManager.loadFromRom(this), '> Loading text data...');

            this.abilities = timeFunction(() => AbilityManager.loadFromRom(this), '> Loading abilities...');
            this.characters = timeFunction(() => CharacterManager.loadFromRom(this), '> Loading characters...');
            this.classes = timeFunction(() => ClassManager.loadFromRom(this), '> Loading classes...');
            this.djinn = timeFunction(() => DjinniManager.loadFromRom(this), '> Loading djinn...');
            this.elementTables = timeFunction(() => ElementTableManager.loadFromRom(this), '> Loading elemental stat tables...');
            this.encounterTables = timeFunction(() => EncounterTableManager.loadFromRom(this), '> Loading encounter tables...');
            this.enemies = timeFunction(() => EnemyManager.loadFromRom(this), '> Loading enemies...');
            this.enemyGroups = timeFunction(() => EnemyGroupManager.loadFromRom(this), '> Loading enemy battle groups...');
            this.forgeResults = timeFunction(() => ForgeResultManager.loadFromRom(this), '> Loading forge results...');
            this.items = timeFunction(() => ItemManager.loadFromRom(this), '> Loading items...');
            this.music = timeFunction(() => MusicManager.loadFromRom(this), '> Loading music...');
            this.shops = timeFunction(() => ShopManager.loadFromRom(this), '> Loading shops...');
            this.summons = timeFunction(() => SummonManager.loadFromRom(this), '> Loading summons...');

            this.itemLocations = timeFunction(() => ItemLocationManager.loadFromRom(this), '> Loading item locations...');
        } else {
            // Creates the RomData by copying another instance
            this.data = Uint8Array.from(instance.data);

            this.abilities = instance.abilities.clone();
            this.characters = instance.characters.clone();
            this.classes = instance.classes.clone();
            this.djinn = instance.djinn.clone();
            this.elementTables = instance.elementTables.clone();
            this.encounterTables = instance.encounterTables.clone();
            this.enemies = instance.enemies.clone();
            this.enemyGroups = instance.enemyGroups.clone();
            this.forgeResults = instance.forgeResults.clone();
            this.items = instance.items.clone();
            this.itemLocations = instance.itemLocations.clone();
            this.text = instance.text.clone();
            this.music = instance.music.clone();
            this.shops = instance.shops.clone();
            this.summons = instance.summons.clone();
        }
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : RomData
    {
        return new RomData(this);
    }

    /**
     * Returns a pointer from the MFT.
     * @param index Numeric index between 0 and 2047
     */
    readMFT(index : number) : number
    {
        if (index < 0 || index >= 2048 || !Number.isInteger(index)) {
            return 0;
        }
        return this.readWord(MFT + 4 * index);
    }

    /**
     * Overwrites a pointer in the MFT.
     * @param index Numeric index between 0 and 2047
     * @param pointer The value of the new pointer
     */
    writeMFT(index : number, pointer : number)
    {
        if (index < 0 || index >= 2048 || !Number.isInteger(index)) {
            return;
        }
        this.writeWord(MFT + 4 * index, pointer);
    }
}