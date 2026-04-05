import { AbilityDefinition, ItemDefinition, ItemLocationDefinition } from "$lib/definitions";
import type { BinaryView } from "../../binary_view";
import { SettingShuffleItems } from "../../settings/enums";
import { DataModel } from "../base";
import { PseudoItemGroup } from "../items/enums";
import type { TextManager } from "../text/manager";
import { ItemLocationType } from "./enums";

/** List of item IDs that should be considered key items. */
const keyItems : number[] = [65, 222, 242, 243, 244, 247, 326, 439, 440, 441, 443, 444, 445, 
    448, 449, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460];

/** List of item IDs that are **not** considered major items, despite being equipment. */
const majorExceptionItems : number[] = [398, 399, 400, 401, 405, 406, 407, 408, 411, 412, 413, 415];


/**
 * Data class representing a single (randomisable) in-game item location.
 */
export class ItemLocation extends DataModel
{
    readonly mapId : number;
    readonly objectId : number;
    readonly vanillaType : ItemLocationType;
    private vanillaContents : number;
    private vanillaName : string;

    public type : ItemLocationType;
    public contents : number;
    public name : string;
    public locked : boolean;
    public forceMajor : boolean;
    public forceMinor : boolean;
    public subLocations : ItemLocation[];

    constructor(id : number, address : number, mapId : number, objectId : number, type : ItemLocationType, contents : number, name : string)
    {
        super(id, address);
        
        this.mapId = mapId;
        this.objectId = objectId;
        this.vanillaType = type;
        this.vanillaContents = contents;
        this.vanillaName = name;

        this.type = type;
        this.contents = contents;
        this.name = name;
        this.locked = false;
        this.forceMajor = false;
        this.forceMinor = false;
        this.subLocations = [];
    }

    /** Returns whether the contents of this location is a character pseudo-item. */
    isCharacter() : boolean { return (this.contents & 0xFF00) == PseudoItemGroup.CHARACTER; }

    /** Returns whether the contents of this location is a Psynergy pseudo-item. */
    isPsynergy() : boolean { return (this.contents & 0xFF00) == PseudoItemGroup.PSYNERGY; }

    /** Returns whether the contents of this location is a summon pseudo-item. */
    isSummon() : boolean { return (this.contents & 0xFF00) == PseudoItemGroup.SUMMON; }

    /** Returns whether the contents of this location is coins. */
    isCoins() : boolean { return this.contents >= 0x8000; }

    /**
     * Returns whether this location counts as hidden based on its current contents and type.
     */
    isHidden() : boolean
    {
        if (this.type < ItemLocationType.CHEST || this.type == ItemLocationType.HIDDEN) {
            return this.isCoins() || ![0xF63, 0xF64, 0xF8B, 0xFF6, 0xFF7, 0xFF9].includes(this.id);
        } else if (this.type == ItemLocationType.GROUND_ITEM) {
            return this.isCoins() && this.id != 0xFC6;
        }
        return false;
    }

    /**
     * Returns whether the contents of this location is a piece of equipment.
     * (Returns `false` for rusty weapons.)
     */
    isEquipment() : boolean
    {
        if (this.type == ItemLocationType.MIMIC) return false;
        return this.contents <= 179 || (this.contents >= 250 && this.contents <= 415);
    }

    /**
     * Returns whether the contents of this location is a key item.
     */
    isKeyItem() : boolean
    {
        if (this.isCharacter() || this.isPsynergy() || this.isSummon()) {
            return true;
        }
        return keyItems.includes(this.contents);
    }

    /**
     * Returns whether the contents of this location is a major item.
     * Key items, (most) equipment, and forging materials are considered major.
     */
    isMajorItem() : boolean
    {
        if (this.isKeyItem()) return true;
        if (this.type == ItemLocationType.MIMIC || this.isCoins() || majorExceptionItems.includes(this.contents)) {
            return false;
        }
        return this.contents <= 179 || this.contents >= 250;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : ItemLocation 
    {
        const cloned = new ItemLocation(this.id, this.address, this.mapId, this.objectId, this.type, this.contents, this.name);
        cloned.locked = this.locked;
        cloned.forceMajor = this.forceMajor;
        cloned.forceMinor = this.forceMinor;
        this.subLocations.forEach(loc => {
            cloned.subLocations.push(loc.clone());
        });

        return cloned;
    }

    /**
     * Returns a copy of the "unrandomised" version of this item location.
     * Does not copy slot settings, and changes to this copy will not be saved to the ROM.
     */
    asVanilla() : ItemLocation
    {
        return new ItemLocation(this.id, this.address, this.mapId, this.objectId, this.vanillaType, this.vanillaContents, this.vanillaName);
    }

    /**
     * Changes the "unrandomised" contents of this item location.
     * @param item The item ID of the new contents
     * @param name The name of the new contents (optional)
     */
    updateVanillaContents(item : number, name? : string)
    {
        this.vanillaContents = item;
        this.contents = item;
        if (name) {
            this.vanillaName = name;
            this.name = name;
        }
        this.subLocations.forEach(loc => loc.updateVanillaContents(item, name));
    }

    /**
     * Changes the contents of this item location.
     * @param item The item ID of the new contents
     * @param name The name of the new contents (optional)
     */
    setContents(item : number, name? : string)
    {
        this.contents = item;
        if (name) {
            this.name = name;
        }
        this.type = (name == 'Mimic' ? ItemLocationType.MIMIC : ItemLocationType.CHEST);
        this.subLocations.forEach(loc => loc.setContents(item, name));
    }

    /**
     * Copies the vanilla contents of another item location into the contents of this item location.
     * @param other The item location to copy from
     */
    copyContents(other : ItemLocation)
    {
        this.contents = other.vanillaContents;
        this.name = other.vanillaName;
        this.type = other.type;
        this.subLocations.forEach(loc => loc.copyContents(other));
    }

    /**
     * Resets the contents of this item location back to their "unrandomised" version.
     */
    resetContents()
    {
        this.contents = this.vanillaContents;
        this.name = this.vanillaName;
        this.type = this.vanillaType;
        this.subLocations.forEach(loc => loc.resetContents());
    }

    /**
     * Sets the event type for this item location.
     * @param type The new event type
     */
    setType(type : ItemLocationType)
    {
        this.type = type;
        this.subLocations.forEach(loc => loc.setType(type));
    }

    /**
     * Sets whether this item location is locked, which will make it be skipped during randomisation.
     */
    setLocked(locked : boolean)
    {
        this.locked = locked;
        this.subLocations.forEach(loc => loc.setLocked(locked));
    }

    /**
     * Sets whether this item location is locked based on the item shuffle settings.
     * @param itemShuffle The value of the `Setting.SHUFFLE_ITEMS` option
     */
    setLockedByShuffleType(itemShuffle : SettingShuffleItems) {
        switch (itemShuffle) {
            case SettingShuffleItems.NONE:
                this.setLocked(true);
                break;
            case SettingShuffleItems.KEY_ITEMS:
                this.setLocked(!this.isKeyItem());
                break;
            case SettingShuffleItems.CHESTS:
                this.setLocked(this.isHidden());
                break;
            case SettingShuffleItems.ALL:
                this.setLocked(false);
                break;
        }
    }

    /**
     * Sets whether this item location should be prevented from having a major item in randomisation.
     */
    setForcedMinor(forced : boolean)
    {
        this.forceMinor = forced;
        if (forced) this.forceMajor = false;
        this.subLocations.forEach(loc => loc.setForcedMinor(forced));
    }

    /**
     * Sets whether this item location should be forced to have a major item in randomisation.
     */
    setForcedMajor(forced : boolean)
    {
        this.forceMajor = forced;
        if (forced) this.forceMinor = false;
        this.subLocations.forEach(loc => loc.setForcedMajor(forced));
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary() : Uint8Array 
    {
        if (this.address >= 0xFA0000) {
            return Uint8Array.from([this.contents & 0xFF, this.contents >> 8]);
        } else {
            return Uint8Array.from([
                this.type & 0xFF, 0,
                this.objectId & 0xFF, this.objectId << 8,
                this.id & 0xFF, this.id << 8,
                this.contents & 0xFF, this.contents << 8
            ]);
        }
    }

    /**
     * Creates a new `ItemLocation` instance from a binary data block.
     * @param address The memory address of the binary data block
     * @param mapId The ID of the map this location belongs to
     * @param data The binary data block to read from; must be 8 bytes
     * @returns The newly created `ItemLocation`, or `undefined` if the binary data block is too short OR if the location type is `PSY_CRYSTAL`
     */
    static createFromBinary(address : number, mapId : number, data : BinaryView, text : TextManager) : ItemLocation|undefined
    {
        if (data.length < ItemLocationDefinition.BLOCK_SIZE) return;

        const type : ItemLocationType = data.readHalfword(0);
        const objectId : number = data.readHalfword(2);
        const flag : number = data.readHalfword(4);
        const contents : number = data.readHalfword(6);

        switch (type) {
            case ItemLocationType.MIMIC:
                return new ItemLocation(flag, address, mapId, objectId, type, contents, "Mimic");

            case ItemLocationType.PSY_CRYSTAL:
                return undefined;

            case ItemLocationType.TABLET:
                const name = text.get(AbilityDefinition.TEXT_NAMES + contents + 380) ?? "?";
                const instance = new ItemLocation(flag, address, mapId, objectId, type, contents + 0xF00, name);
                return instance;

            default:
                if (contents < 0x8000) {
                    const name : string = text.get(ItemDefinition.TEXT_NAMES + contents) ?? "?";
                    const instance = new ItemLocation(flag, address, mapId, objectId, type, contents, name);
                    return instance;
                } else {
                    return new ItemLocation(flag, address, mapId, objectId, type, contents, (contents - 0x8000) + " Coins");   
                }
        }
    }
}