import { ItemDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import { clamp } from "$lib/util";
import { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import type { Element } from "../enums";
import type { TextManager } from "../text/manager";
import { ItemType, type EquipEffect, type ItemUseEffect } from "./enums";

/**
 * Data class representing a single in-game item.
 */
export class Item extends DataModel 
{
    public name : string;
    public description : string;
    public icon : number;
    public type : ItemType;
    public element : Element;
    public cost : number;
    public attack : number;
    public defense : number;
    public flags : number;
    public equipCompatibility : number;
    public unleash : number;
    public unleashRate : number;
    public useEffect : ItemUseEffect;
    public useAbility : number;
    public equipEffects : [EquipEffect, number][];

    constructor (id : number, name : string, description : string, icon : number, element : Element, type : ItemType, cost : number, 
        attack : number, defense : number, flags : number, equipCompability : number, unleash : number, unleashRate : number, 
        useEffect : ItemUseEffect, useAbility : number, equipEffects : [EquipEffect, number][])
    {
        super(id, ItemDefinition.ADDRESS + id * ItemDefinition.BLOCK_SIZE);
        this.name = name;
        this.description = description;
        this.icon = icon;

        this.element = element;
        this.type = type;
        this.cost = cost;
        this.attack = attack;
        this.defense = defense;
        this.flags = flags;
        this.equipCompatibility = equipCompability;
        this.unleash = unleash;
        this.unleashRate = unleashRate;
        this.useEffect = useEffect;
        this.useAbility = useAbility;

        this.equipEffects = [];
        equipEffects.forEach(effect => equipEffects.push([...effect]));
    }

    /**
     * Returns whether the item is considered a type of armour.
     */
    isArmour() : boolean
    {
        return this.type == ItemType.ARMOUR || this.type == ItemType.FOOTGEAR || this.type == ItemType.HEADGEAR 
            || this.type == ItemType.RING || this.type == ItemType.SHIELD || this.type == ItemType.UNDERSHIRT;
    }

    /**
     * Returns whether the item is considered a type of equipment (weapon or armour).
     */
    isEquipment() : boolean
    {
        return this.type == ItemType.WEAPON || this.isArmour();
    }

    /**
     * Returns an approximation of the relative defensive power of a piece of armour
     * for equipment sorting purposes.
     */
    getArmourScore() : number
    {
        if (this.type == ItemType.ARMOUR) { return (this.defense - 3) / 50; }
        if (this.type == ItemType.SHIELD) { return (this.defense - 2) / 47; }
        if (this.type == ItemType.HEADGEAR) { return (this.defense - 3) / 47; }
        return this.defense / 10;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone(): Item 
    {
        return new Item(this.id, this.name, this.description, this.icon, this.element, this.type, this.cost, this.attack, this.defense, this.flags,
            this.equipCompatibility, this.unleash, this.unleashRate, this.useEffect, this.useAbility, this.equipEffects);
    }

    /**
     * Randomises the equip compatibility (if relevant) of this item.
     * Ensures that at least one character from both Isaac's group and Felix's group can equip it.
     * @param prng The PRNG instance for the currently generating seed
     */
    randomiseCompatibility(prng : PRNG)
    {
        if (this.type == ItemType.WEAPON || this.type == ItemType.ARMOUR || this.type == ItemType.SHIELD || this.type == ItemType.HEADGEAR) {
            this.equipCompatibility = ((prng.randomInt(15) + 1) << 4) + prng.randomInt(15) + 1;
        }
    }

    /**
     * Adjust the price of the item by between -20% and +20%. Only affects equippable items.
     * @param prng The PRNG instance for the currently generating seed
     */
    adjustEquipmentPrice(prng : PRNG) 
    {
        if (this.cost != 0 && this.equipCompatibility != 0) {
            const factor = prng.randomBetween(0.8, 1.2);
            this.cost = Math.min(0xFFFF, Math.round(this.cost * factor));
        }
    }

    /**
     * Adjusts the stats of equipment by between -50% and +50%.
     * Attack cannot exceed 255, and Defense cannot exceed 60.
     * @param prng The PRNG instance for the currently generating seed
     */
    adjustEquipmentStats(prng : PRNG) 
    {
        if (!this.isEquipment()) return;

        if (this.attack != 0) {
            const factor = prng.randomBetween(0.5, 1.5);
            const vanillaAttack = this.attack;
            this.attack = clamp(Math.round(this.attack * factor), 1, this.type == ItemType.WEAPON ? 255 : 20);
            if (this.type == ItemType.WEAPON) {
                this.cost = Math.round(this.cost * (1 + ((this.attack - vanillaAttack) - 1) / 1.5));
            }
        }

        if (this.defense != 0) {
            const factor = prng.randomBetween(0.5, 1.5);
            const vanillaDefense = this.defense;
            this.defense = clamp(Math.round(this.defense * factor), 1, 60);
            if (this.type != ItemType.WEAPON) {
                this.cost = Math.round(this.cost * (1 + ((this.defense - vanillaDefense) - 1) / 1.5));
            }
        }
    }

    /**
     * Removes the "Cursed" property from this item.
     */
    removeCurse()
    {
        if (!this.isEquipment()) return;
        if (this.flags & 0x1) { this.flags &= 0xFC; }
        if (this.description.startsWith('Cursed')) {
            this.description = this.description.substring(7);
        }
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary(): Uint8Array 
    {
        const data = new BinaryView();
        data.expand(ItemDefinition.BLOCK_SIZE);

        data.writeHalfword(0, this.cost);
        data.writeByte(2, this.type);
        data.writeByte(3, this.flags);
        data.writeByte(4, this.equipCompatibility);
        data.writeHalfword(6, this.icon);
        data.writeHalfword(8, this.attack);
        data.writeByte(10, this.defense);
        data.writeByte(11, this.unleashRate);
        data.writeByte(12, this.useEffect);
        data.writeHalfword(14, this.unleash);
        data.writeByte(20, this.element);
        data.writeHalfword(40, this.useAbility);

        for (let i = 0; i < 4; ++i) {
            if (this.equipEffects[i] == undefined) continue;
            data.writeByte(24 + 4 * i, this.equipEffects[i][0]);
            data.writeByte(25 + 4 * i, this.equipEffects[i][1]);
        }
        
        return data.getData();
    }

    /**
     * Creates a new `Item` instance from a binary data block.
     * @param id The zero-indexed id of the item within the game data
     * @param data The binary data block to read from; must be 44 bytes
     * @returns The newly created `Item`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, text : TextManager) : Item|undefined
    {
        if (data.length < ItemDefinition.BLOCK_SIZE) return;

        const name : string = text.get(ItemDefinition.TEXT_NAMES + id) ?? '?';
        const description : string = text.get(ItemDefinition.TEXT_DESCRIPTIONS + id) ?? '?';
        const equipEffects : [EquipEffect, number][] = [];

        for (let i = 0; i < 4; ++i) {
            equipEffects.push([data.readByte(24 + 4 * i), data.readByte(25 + 4 * i)]);
        }

        return new Item(id, name, description, data.readHalfword(6), data.readByte(20), data.readByte(2), data.readHalfword(0), 
            data.readHalfword(8), data.readByte(10), data.readByte(3), data.readByte(4), data.readHalfword(14), data.readByte(11), 
            data.readByte(12), data.readHalfword(40), equipEffects);
    }
}