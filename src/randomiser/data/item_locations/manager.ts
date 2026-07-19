import { ItemLocationDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { Setting, SettingOmitLocations, SettingShuffleItems } from "../../settings/enums";
import type { SettingsObject } from "../../settings/settings";
import { DataManager } from "../base";
import { ItemID } from "../items/enums";
import { ItemEventType } from "./enums";
import { ItemLocation } from "./model";

/** A list of map IDs that should not be registered. */
const skipMaps : number[] = [5, 43, 97];

/** A list of individual location IDs that should not be registered. */
const skipLocations : number[] = [0xF5D, 0xFA7, 0xFB6, 0xFB7, 0xFB8, 0xFBE, 0xFF3];

/** A list of items used to replace empty chests. */
const replacePool : [number, string][] = [
    [ItemID.HERB, "Herb"], [ItemID.NUT, "Nut"], [ItemID.VIAL, "Vial"], [ItemID.ANTIDOTE, "Antidote"], [ItemID.ELIXIR, "Elixir"], 
    [ItemID.GAME_TICKET, "Game Ticket"], [ItemID.LUCKY_MEDAL, "Lucky Medal"], [ItemID.OIL_DROP, "Oil Drop"], 
    [ItemID.WEASELS_CLAW, "Weasel's Claw"], [ItemID.BRAMBLE_SEED, "Bramble Seed"], [ItemID.CRYSTAL_POWDER, "Crystal Powder"]
];

/** A list of item drops for each Mimic. */
const mimicPool : [number, string][] = [
    [ItemID.GAME_TICKET, "Game Ticket"], [ItemID.LUCKY_MEDAL, "Lucky Medal"], [ItemID.HARD_NUT, "Hard Nut"], 
    [ItemID.POTION, "Potion"], [ItemID.GAME_TICKET, "Game Ticket"], [ItemID.POWER_BREAD, "Power Bread"], 
    [ItemID.PSY_CRYSTAL, "Psy Crystal"], [ItemID.APPLE, "Apple"], [ItemID.COOKIE, "Cookie"]
];

    
/**
 * Data manager for item locations. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class ItemLocationManager extends DataManager<ItemLocation>
{
    private nextAddress : number = 0;
    private settingShowItemSprites : boolean = false;
    private settingRemoveMimics : boolean = false;
    private prng : PRNG|undefined;

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
     * @param prng The PRNG instance of the currently generating seed
     */
    prepare(settings : SettingsObject, prng : PRNG)
    {
        // Insert extra items into the pool
        if (settings[Setting.INSERT_GS1_ITEMS]) {
            this.data[0xFD6].updateVanillaContents(ItemID.CLERICS_RING, "Cleric's Ring");
            this.data[0xFD8].updateVanillaContents(ItemID.ELVEN_SHIRT, "Elven Shirt");
        }
        if (settings[Setting.INSERT_DUMMY_ITEMS]) {
            this.data[0xFB0].updateVanillaContents(ItemID.CASUAL_SHIRT, "Casual Shirt");
            this.data[0xFB1].updateVanillaContents(ItemID.GOLDEN_BOOTS, "Golden Boots");
            this.data[0xFB2].updateVanillaContents(ItemID.AROMA_RING, "Aroma Ring");
            this.data[0xFB3].updateVanillaContents(ItemID.GOLDEN_SHIRT, "Golden Shirt");
            this.data[0xFB4].updateVanillaContents(ItemID.NINJA_SANDALS, "Ninja Sandals");
            this.data[0xFB5].updateVanillaContents(ItemID.GOLDEN_RING, "Golden Ring");
            this.data[0xFCF].updateVanillaContents(ItemID.HERBED_SHIRT, "Herbed Shirt");
            this.data[0xFD0].updateVanillaContents(ItemID.KNGIHTS_GREAVE, "Knight's Greave");
            this.data[0xFD1].updateVanillaContents(ItemID.RAINBOW_RING, "Rainbow Ring");
            this.data[0xFD4].updateVanillaContents(ItemID.DIVINE_CAMISOLE, "Divine Camisole");
            this.data[0xFD5].updateVanillaContents(ItemID.SILVER_GREAVE, "Silver Greave");
            this.data[0xFD7].updateVanillaContents(ItemID.SOUL_RING, "Soul Ring");
        }

        // Lock or unlock item locations based on the item shuffle setting, and update the event type
        const itemShuffle : SettingShuffleItems = settings[Setting.SHUFFLE_ITEMS];
        this.data.forEach(loc => {
            loc.setLockedByShuffleType(itemShuffle);
            if (loc.isKeyItem() && (loc.type < ItemEventType.CHEST || loc.type == ItemEventType.GROUND_ITEM)) {
                loc.setType(ItemEventType.CHEST);
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

        // Save relevant settings and the prng instance for post-shuffle edits
        this.prng = prng;
        this.settingShowItemSprites = (settings[Setting.SHOW_ITEM_SPRITES] == 1);
        this.settingRemoveMimics = (settings[Setting.REMOVE_MIMICS] == 1);
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
        this.registerCustomLocation(0x84A, 22, ItemEventType.CHEST, 0xE85, "Lash Pebble");
        this.registerCustomLocation(0x878, 38, ItemEventType.CHEST, 0xE86, "Pound Cube");
        this.registerCustomLocation(0x88C, 76, ItemEventType.CHEST, 0xE88, "Scoop Gem");
        this.registerCustomLocation(0x918, 44, ItemEventType.CHEST, 0xE89, "Cyclone Chip");
        this.registerCustomLocation(0x94D, 248, ItemEventType.CHEST, 0xE99, "Hover Jade");
        this.registerCustomLocation(0xA3A, 286, ItemEventType.CHEST, ItemID.MARS_STAR, "Mars Star");
        this.registerCustomLocation(0x8FF, 124, ItemEventType.CHEST, ItemID.BLACK_CRYSTAL, "Black Crystal");
        this.registerCustomLocation(0x978, 188, ItemEventType.CHEST, ItemID.TRIDENT, "Trident");
        this.registerCustomLocation(0xAA2, 132, ItemEventType.CHEST, ItemID.PRETTY_STONE, "Pretty Stone");
        this.registerCustomLocation(0xAA4, 134, ItemEventType.CHEST, ItemID.RED_CLOTH, "Red Cloth");
        this.registerCustomLocation(0xAA3, 133, ItemEventType.CHEST, ItemID.MILK, "Milk");
        this.registerCustomLocation(0xAA1, 131, ItemEventType.CHEST, ItemID.LIL_TURTLE, "Li'l Turtle");
        this.registerCustomLocation(0x901, 99, ItemEventType.CHEST, ItemID.LARGE_BREAD, "Large Bread");
        this.registerCustomLocation(0xA20, 12, ItemEventType.CHEST, ItemID.SEA_GODS_TEAR, "Sea God's Tear");
        this.registerCustomLocation(0x9F9, 232, ItemEventType.CHEST, ItemID.MAGMA_BALL, "Magma Ball");
        this.registerCustomLocation(0x8D4, 89, ItemEventType.TABLET, 0xE90, "Reveal");
        this.registerCustomLocation(0x9AE, 169, ItemEventType.TABLET, 0xE8A, "Parch");
        this.registerCustomLocation(0x9BA, 177, ItemEventType.TABLET, 0xE8B, "Sand");
        this.registerCustomLocation(0x9FA, 233, ItemEventType.TABLET, 0xE9A, "Blaze");
        this.registerCustomLocation(0x90B, 205, ItemEventType.TABLET, 0xF16, "Eclipse");
        this.registerCustomLocation(0x945, 207, ItemEventType.CHEST, ItemID.CENTER_PRONG, "Center Prong");
        this.registerCustomLocation(0x1, 9, ItemEventType.CHEST, ItemID.SHAMANS_ROD, "Shaman's Rod");
        this.registerCustomLocation(0x2, 9, ItemEventType.TABLET, 0xE8D, "Mind Read");
        this.registerCustomLocation(0x3, 9, ItemEventType.TABLET, 0xE4E, "Whirlwind");
        this.registerCustomLocation(0x4, 9, ItemEventType.TABLET, 0xE0C, "Growth");
        this.registerCustomLocation(0x101, 237, ItemEventType.TABLET, 0xE93, "Carry Stone");
        this.registerCustomLocation(0x102, 237, ItemEventType.TABLET, 0xE8F, "Lifting Gem");
        this.registerCustomLocation(0x103, 237, ItemEventType.TABLET, 0xE8E, "Orb of Force");
        this.registerCustomLocation(0x104, 237, ItemEventType.TABLET, 0xE94, "Catch Beads");
        this.registerCustomLocation(0x105, 111, ItemEventType.TABLET, 0xE21, "Douse Drop");
        this.registerCustomLocation(0x106, 111, ItemEventType.TABLET, 0xE18, "Frost Jewel");

        // Add character item locations
        this.nextAddress = ItemLocationDefinition.ADDRESS_MAPPING_CHARACTERS;
        this.registerCustomLocation(0xD00, 237, ItemEventType.TABLET, 0xD00, "Isaac");
        this.registerCustomLocation(0xD01, 237, ItemEventType.TABLET, 0xD01, "Garet");
        this.registerCustomLocation(0xD02, 237, ItemEventType.TABLET, 0xD02, "Ivan");
        this.registerCustomLocation(0xD03, 237, ItemEventType.TABLET, 0xD03, "Mia");
        this.registerCustomLocation(0xD05, 9, ItemEventType.TABLET, 0xD05, "Jenna");
        this.registerCustomLocation(0xD06, 9, ItemEventType.TABLET, 0xD06, "Sheba");
        this.registerCustomLocation(0xD07, 111, ItemEventType.TABLET, 0xD07, "Piers");

        // Lock the Large Bread from being randomised
        this.data[0x901].locked = true;
    }

    /**
     * Registers a single custom item location.
     */
    private registerCustomLocation(id : number, mapId : number, type : ItemEventType, contents : number, name : string)
    {
        this.data[id] = new ItemLocation(id, this.nextAddress, mapId, -1, type, contents, name);
        this.nextAddress += 2;
    }

    /**
     * Fixes the event type of an item location post-shuffle.
     * @param loc The item location object to fix
     */
    private fixEventType(loc : ItemLocation)
    {
        let type = loc.type;
        if (loc.vanillaType <= ItemEventType.CHEST && type != ItemEventType.MIMIC) {
            type = loc.vanillaType;
        }

        // Don't alter certain vanilla event types
        if (type != ItemEventType.MIMIC) {
            if (loc.vanillaType != ItemEventType.CHEST && loc.vanillaType != ItemEventType.MIMIC) {
                loc.setType(loc.vanillaType);
                return;
            }
        }

        // Handle Psynergy and summons
        if (loc.isPsynergy() || loc.isSummon()) {
            if (loc.vanillaType == ItemEventType.GROUND_ITEM) {
                loc.setType(ItemEventType.GROUND_ITEM);
            } else {
                loc.setType(ItemEventType.TABLET);
            }
            return;
        }

        // Handle mimic locations
        if (loc.vanillaType == ItemEventType.MIMIC && type != ItemEventType.MIMIC) {
            type = ItemEventType.CHEST;
        }

        loc.setType(type);
    }

    /**
     * Apply the `SHOW_ITEM_SPRITES` setting to an item location.
     * @param loc The item location to apply the setting to
     */
    private applyShowItemSprites(loc : ItemLocation) 
    {
        if (loc.type != ItemEventType.CHEST && loc.type != ItemEventType.TABLET)
            return;

        if (this.settingShowItemSprites) {
            loc.setType(ItemEventType.GROUND_ITEM);
            if (loc.contents == 0) {
                this.replaceEmptyContents(loc);
            }
        } else {
            // Not sure if this else-block is necessary because it feels like
            // it's already being handled by the `fixEventType` logic.
            // TODO: Verify the above
            if (loc.isPsynergy() || loc.isSummon()) {
                loc.setType(ItemEventType.TABLET);
            } else {
                loc.setType(ItemEventType.CHEST);
            }
        }
    }

    /**
     * Apply the `REMOVE_MIMICS` setting to an item location.
     * @param loc The item location to apply the setting to
     */
    private replaceMimic(loc : ItemLocation) 
    {
        const item = mimicPool[loc.contents] ?? mimicPool[0];
        loc.setType(this.settingShowItemSprites ? ItemEventType.GROUND_ITEM : ItemEventType.CHEST);
        loc.setContents(item[0], item[1] + ' (Mimic)');
    }

    /**
     * Replace an empty item location with a random filler item.
     * @param loc The item location to fill
     */
    private replaceEmptyContents(loc : ItemLocation)
    {
        const item = this.prng?.randomArrayElement(replacePool) ?? replacePool[0];
        loc.setType(ItemEventType.GROUND_ITEM);
        loc.setContents(item[0], item[1] + ' (empty)');
    }

    /**
     * Writes all item locations in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom: RomData) 
    {
        this.data.forEach(loc => {
            this.fixEventType(loc);
            this.applyShowItemSprites(loc);
            if (loc.type == ItemEventType.MIMIC && this.settingRemoveMimics) {
                this.replaceMimic(loc);
            }

            if ((loc.type <= ItemEventType.CHEST || loc.type == ItemEventType.GROUND_ITEM) && loc.contents == 0 ) {
                loc.setContents(ItemID.GAME_TICKET, "Game Ticket");
            }

            rom.writeBlock(loc.address, loc.toBinary());
            loc.subLocations.forEach(subLocation => {
                rom.writeBlock(subLocation.address, subLocation.toBinary());
            });
        });
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