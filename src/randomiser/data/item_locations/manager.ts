import { ItemLocationDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { Setting, SettingOmitLocations, SettingShuffleItems } from "../../settings/enums";
import type { SettingsObject } from "../../settings/settings";
import { DataManager } from "../base";
import { ItemLocationType } from "./enums";
import { ItemLocation } from "./model";

/** A list of map IDs that should not be registered. */
const skipMaps : number[] = [5, 43, 97];

/** A list of individual location IDs that should not be registered. */
const skipLocations : number[] = [0xF5D, 0xFA7, 0xFB6, 0xFB7, 0xFB8, 0xFBE, 0xFF3];

/** A list of items used to replace empty chests. */
const replacePool : [number, string][] = [
    [180, "Herb"], [181, "Nut"], [182, "Vial"], [187, "Antidote"], [188, "Elixir"], [228, "Game Ticket"], 
    [229, "Lucky Medal"], [238, "Oil Drop"], [239, "Weasel's Claw"], [240, "Bramble Seed"], [241, "Crystal Powder"]
];

/** A list of item drops for each Mimic. */
const mimicPool : [number, string][] = [
    [228, "Game Ticket"], [229, "Lucky Medal"], [194, "Hard Nut"], [183, "Potion"], [228, "Game Ticket"],
    [191, "Power Bread"], [186, "Psy Crystal"], [193, "Apple"], [192, "Cookie"]
];

    
/**
 * Data manager for item locations. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class ItemLocationManager extends DataManager<ItemLocation>
{
    private nextAddress : number = 0;

    /**
     * Returns a deep copy of this object.
     */
    clone() : ItemLocationManager 
    {
        const cloned = new ItemLocationManager();
        this.data.forEach((loc, flag) => {
            if (loc == undefined) return;
            cloned.data[flag] = loc.clone();
        });
        return cloned;
    }

    /**
     * Returns a list of all item locations that haven't been locked 
     * based on the current settings.
     */
    getUnlockedLocations() : ItemLocation[] {
        return this.data.filter(loc => !loc.locked);
    }

    /**
     * Prepares all item locations for randomisation based on the provided settings.
     * @param settings The settings for the currently generating seed
     */
    prepare(settings : SettingsObject)
    {
        // Insert extra items into the pool
        if (settings[Setting.INSERT_GS1_ITEMS]) {
            this.data[0xFD6].updateVanillaContents(268, "Cleric's Ring");
            this.data[0xFD8].updateVanillaContents(93, "Elven Shirt");
        }
        if (settings[Setting.INSERT_DUMMY_ITEMS]) {
            this.data[0xFB0].updateVanillaContents(401, "Casual Shirt");
            this.data[0xFB1].updateVanillaContents(408, "Golden Boots");
            this.data[0xFB2].updateVanillaContents(411, "Aroma Ring");
            this.data[0xFB3].updateVanillaContents(400, "Golden Shirt");
            this.data[0xFB4].updateVanillaContents(407, "Ninja Sandals");
            this.data[0xFB5].updateVanillaContents(415, "Golden Ring");
            this.data[0xFCF].updateVanillaContents(399, "Herbed Shirt");
            this.data[0xFD0].updateVanillaContents(405, "Knight's Greave");
            this.data[0xFD1].updateVanillaContents(412, "Rainbow Ring");
            this.data[0xFD4].updateVanillaContents(398, "Divine Camisole");
            this.data[0xFD5].updateVanillaContents(406, "Silver Greave");
            this.data[0xFD7].updateVanillaContents(413, "Soul Ring");
        }

        // Lock or unlock item locations based on the item shuffle setting, and update the event type
        const itemShuffle : SettingShuffleItems = settings[Setting.SHUFFLE_ITEMS];
        this.data.forEach(loc => {
            loc.setLockedByShuffleType(itemShuffle);
            if (loc.isKeyItem() && (loc.type < ItemLocationType.CHEST || loc.type == ItemLocationType.GROUND_ITEM)) {
                loc.setType(ItemLocationType.CHEST);
            }
        });

        // Lock item locations based on the omission setting
        const omit : SettingOmitLocations = settings[Setting.OMIT_LOCATIONS];
        if ((omit & SettingOmitLocations.OMIT_ANEMOS) != 0) {
            [0xE05, 0xE06, 0x1B, 0x1C].forEach(flag => {
                this.data[flag].setLocked(true);
            });
        }
        if ((omit & SettingOmitLocations.OMIT_SUPERBOSSES) != 0) {
            [0x18, 0x19, 0x1A, 0x1B, 0x1C].forEach(flag => {
                this.data[flag].setLocked(true);
            });
        }

        // Set the forced major or minor flags based on the relevant boss settings
        if (settings[Setting.FORCE_BOSS_MAJORS]) {
            [0x18, 0x19, 0x1A, 0x1C, 0x101, 0x88C, 0x94D, 0x978, 0x9BA, 0xA3A, 0xD00, 0xE41, 0xF58].forEach(flag => {
                this.data[flag].setForcedMajor(true);
            });
        }
        if (settings[Setting.FORCE_SUPERBOSS_MINORS]) {
            [0x18, 0x19, 0x1A, 0x1C].forEach(flag => {
                this.data[flag].setForcedMinor(true);
            });
        }

        // Lock character locations if character shuffle is disabled
        if (!settings[Setting.SHUFFLE_CHARACTERS]) {
            [0xD00, 0xD01, 0xD02, 0xD03, 0xD05, 0xD06, 0xD07].forEach(flag => {
                this.data[flag].setLocked(true);
            });
        }
    }

    /**
     * Replaces Psynergy items and tablets with their randomiser pseudo-item variant.
     */
    private replacePseudoItems() 
    {
        // Replace Psynergy items
        this.data[0x949].updateVanillaContents(0xE97);
        this.data[0xF16].updateVanillaContents(0xE87);
        this.data[0xF67].updateVanillaContents(0xE98);
        this.data[0xFFE].updateVanillaContents(0xE9C);
    }

    /**
     * Registers all custom randomiser item locations, such as items given through events or
     * other in-game mechanisms which have no formal item location in the game data.
     * ROM addresses are assigned sequentially, so the registration order within this function matters.
     */
    private registerCustomLocations()
    {
        // Add custom item locations
        this.nextAddress = ItemLocationDefinition.ADDRESS_MAPPING_SPECIAL;
        this.registerCustomLocation(0x84A, 22, ItemLocationType.CHEST, 0xE85, "Lash Pebble");
        this.registerCustomLocation(0x878, 38, ItemLocationType.CHEST, 0xE86, "Pound Cube");
        this.registerCustomLocation(0x88C, 76, ItemLocationType.CHEST, 0xE88, "Scoop Gem");
        this.registerCustomLocation(0x918, 44, ItemLocationType.CHEST, 0xE89, "Cyclone Chip");
        this.registerCustomLocation(0x94D, 248, ItemLocationType.CHEST, 0xE99, "Hover Jade");
        this.registerCustomLocation(0xA3A, 286, ItemLocationType.CHEST, 247, "Mars Star");
        this.registerCustomLocation(0x8FF, 124, ItemLocationType.CHEST, 242, "Black Crystal");
        this.registerCustomLocation(0x978, 188, ItemLocationType.CHEST, 326, "Trident");
        this.registerCustomLocation(0xAA2, 132, ItemLocationType.CHEST, 452, "Pretty Stone");
        this.registerCustomLocation(0xAA4, 134, ItemLocationType.CHEST, 453, "Red Cloth");
        this.registerCustomLocation(0xAA3, 133, ItemLocationType.CHEST, 454, "Milk");
        this.registerCustomLocation(0xAA1, 131, ItemLocationType.CHEST, 455, "Li'l Turtle");
        this.registerCustomLocation(0x901, 99, ItemLocationType.CHEST, 457, "Large Bread");
        this.registerCustomLocation(0xA20, 12, ItemLocationType.CHEST, 458, "Sea God's Tear");
        this.registerCustomLocation(0x9F9, 232, ItemLocationType.CHEST, 460, "Magma Ball");
        this.registerCustomLocation(0x8D4, 89, ItemLocationType.TABLET, 0xE90, "Reveal");
        this.registerCustomLocation(0x9AE, 169, ItemLocationType.TABLET, 0xE8A, "Parch");
        this.registerCustomLocation(0x9BA, 177, ItemLocationType.TABLET, 0xE8B, "Sand");
        this.registerCustomLocation(0x9FA, 233, ItemLocationType.TABLET, 0xE9A, "Blaze");
        this.registerCustomLocation(0x90B, 205, ItemLocationType.TABLET, 0xF16, "Eclipse");
        this.registerCustomLocation(0x945, 207, ItemLocationType.CHEST, 441, "Center Prong");
        this.registerCustomLocation(0x1, 9, ItemLocationType.CHEST, 65, "Shaman's Rod");
        this.registerCustomLocation(0x2, 9, ItemLocationType.TABLET, 0xE8D, "Mind Read");
        this.registerCustomLocation(0x3, 9, ItemLocationType.TABLET, 0xE4E, "Whirlwind");
        this.registerCustomLocation(0x4, 9, ItemLocationType.TABLET, 0xE0C, "Growth");
        this.registerCustomLocation(0x101, 237, ItemLocationType.TABLET, 0xE93, "Carry Stone");
        this.registerCustomLocation(0x102, 237, ItemLocationType.TABLET, 0xE8F, "Lifting Gem");
        this.registerCustomLocation(0x103, 237, ItemLocationType.TABLET, 0xE8E, "Orb of Force");
        this.registerCustomLocation(0x104, 237, ItemLocationType.TABLET, 0xE94, "Catch Beads");
        this.registerCustomLocation(0x105, 111, ItemLocationType.TABLET, 0xE21, "Douse Drop");
        this.registerCustomLocation(0x106, 111, ItemLocationType.TABLET, 0xE18, "Frost Jewel");

        // Add character item locations
        this.nextAddress = ItemLocationDefinition.ADDRESS_MAPPING_CHARACTERS;
        this.registerCustomLocation(0xD00, 237, ItemLocationType.TABLET, 0xD00, "Isaac");
        this.registerCustomLocation(0xD01, 237, ItemLocationType.TABLET, 0xD01, "Garet");
        this.registerCustomLocation(0xD02, 237, ItemLocationType.TABLET, 0xD02, "Ivan");
        this.registerCustomLocation(0xD03, 237, ItemLocationType.TABLET, 0xD03, "Mia");
        this.registerCustomLocation(0xD05, 9, ItemLocationType.TABLET, 0xD05, "Jenna");
        this.registerCustomLocation(0xD06, 9, ItemLocationType.TABLET, 0xD06, "Sheba");
        this.registerCustomLocation(0xD07, 111, ItemLocationType.TABLET, 0xD07, "Piers");

        // Lock the Large Bread from being randomised
        this.data[0x901].locked = true;
    }

    /**
     * Registers a single custom item location.
     */
    private registerCustomLocation(id : number, mapId : number, type : ItemLocationType, contents : number, name : string)
    {
        this.data[id] = new ItemLocation(id, this.nextAddress, mapId, -1, type, contents, name);
        this.nextAddress += 2;
    }

    /**
     * Writes all item locations in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom: RomData) 
    {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `ItemLocationManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : ItemLocationManager
    {
        const instance = new ItemLocationManager();
        const blockSize = ItemLocationDefinition.BLOCK_SIZE;
        const addressEnd = ItemLocationDefinition.ADDRESS_END;
        let address = ItemLocationDefinition.ADDRESS;

        while (address < addressEnd) {
            let mapId = rom.readHalfword(address) & 0xFFF;
            address += 4;

            while (address < addressEnd) {
                if (rom.readHalfword(address) & 0x4000) {
                    break;
                }
                
                if (!skipMaps.includes(mapId)) {
                    const block = rom.readBlock(address, blockSize);
                    const location = ItemLocation.createFromBinary(address, mapId, block, rom.text);

                    if (location && !skipLocations.includes(location.id)) {
                        const flag = location.id;
                        if (instance.data[flag] == undefined) {
                            instance.data[flag] = location;
                        } else {
                            instance.data[flag].subLocations.push(location);
                        }
                    }
                }
                address += blockSize;
            }
        }

        instance.registerCustomLocations();
        instance.replacePseudoItems();
        return instance;
    }
}