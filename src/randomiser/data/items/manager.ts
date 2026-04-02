import { ItemDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { ItemType } from "./enums";
import { Item } from "./model";

/* Auxiliary types for transfering equipment properties. */
type WeaponProperties = Pick<Item, "unleash" | "unleashRate" | "useEffect" | "useAbility" | "element" | "equipEffects" | "description">;
type ArmourProperties = Pick<Item, "useEffect" | "useAbility" | "equipEffects" | "attack" | "defense" | "description">;

/**
 * Data manager for items. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class ItemManager extends DataManager<Item> 
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : ItemManager
    {
        const cloned = new ItemManager();
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            cloned.data[i] = this.data[i].clone();
        }
        return cloned;
    }

    /**
     * Shuffles the Attack stat between all weapons.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleWeaponAttack(prng : PRNG) 
    {
        const itemPool : Item[] = [];
        const attackPool : number[] = [];

        this.data.forEach(item => {
            if (item.type !== ItemType.WEAPON) return;
            itemPool.push(item);
            attackPool.push(item.attack);
        });

        itemPool.forEach(item => { item.attack = prng.randomArrayElement(attackPool, true); });
    }

    /**
     * Shuffles the Defense stat between all armour.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleArmourDefense(prng : PRNG) 
    {
        const itemPool : Item[] = [];
        const defensePool : number[] = [];

        this.data.forEach(item => {
            if (!item.isArmour()) return;
            itemPool.push(item);
            defensePool.push(item.defense);
        });

        itemPool.forEach(item => { item.defense = prng.randomArrayElement(defensePool, true); });
    }

    /**
     * Shuffles the added properties (element, equip effects, unleashes, etc.) of all weapons.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleWeaponProperties(prng : PRNG)
    {
        const itemPool : Item[] = [];
        const propPool : WeaponProperties[] = [];

        this.data.forEach(item => {
            if (item.type !== ItemType.WEAPON) return;
            itemPool.push(item);
            propPool.push({
                unleash: item.unleash, unleashRate: item.unleashRate, useEffect: item.useEffect, useAbility: item.useAbility, 
                element: item.element, equipEffects: [...item.equipEffects], description: item.description.split(': ')[1]
            });
            item.description = item.description.split(': ')[0];
        });

        itemPool.forEach(item => {
            const props = prng.randomArrayElement(propPool, true);
            item.unleash = props.unleash;
            item.unleashRate = props.unleashRate;
            item.useEffect = props.useEffect;
            item.useAbility = props.useAbility;
            item.element = props.element;
            item.equipEffects = props.equipEffects;
            
            const desc = props.description;
            if (desc != undefined && desc != 'Needs to be reforged') {
                item.description += ': ' + desc;
            }
        });
    }

    /**
     * Shuffles the added properties (element, equip effects, use effects, etc.) of all armour.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleArmourProperties(prng : PRNG)
    {
        const itemPool : Item[] = [];
        const propPool : ArmourProperties[] = [];

        this.data.forEach(item => {
            if (!item.isArmour()) return;
            const props : ArmourProperties = {
                useEffect: item.useEffect, useAbility: item.useAbility, equipEffects: [...item.equipEffects], attack: item.attack,
                defense: 0, description: item.description.split(': ')[1]
            };

            if (item.type >= ItemType.FOOTGEAR) {
                props.defense = item.defense;
                item.defense = 0;
            }

            itemPool.push(item);
            propPool.push(props);
            item.description = item.description.split(': ')[0];
        });

        itemPool.forEach(item => {
            const props = prng.randomArrayElement(propPool, true);
            item.useEffect = props.useEffect;
            item.useAbility = props.useAbility;
            item.equipEffects = props.equipEffects;
            item.attack = props.attack;
            item.defense += props.defense;

            const desc = props.description;
            if (desc != undefined) { item.description += ': ' + desc; }
        });
    }

    /**
     * Shuffles the "Cursed" property between all equipment.
     * The total number of cursed equipment will be between 10 and 20.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleCurses(prng : PRNG)
    {
        const numCurses = Math.round(prng.randomBetween(10, 20));
        const itemPool = this.data.filter(item => item.isEquipment());
        itemPool.forEach(item => item.removeCurse());

        for (let i = 0; i < numCurses; ++i) {
            const item = prng.randomArrayElement(itemPool, true);
            item.flags |= 0x3;
            item.description = (item.description.length > 30 ? 'C. ' : 'Cursed ') + item.description;
        }
    }

    /**
     * Writes all items in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom: RomData)
    {
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            const item = this.data[i];

            rom.text.set(ItemDefinition.TEXT_NAMES + i, item.name);
            rom.text.set(ItemDefinition.TEXT_DESCRIPTIONS + i, item.description);
            rom.writeBlock(item.address, item.toBinary());
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `ItemManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : ItemManager
    {
        const instance = new ItemManager();
        const blockSize = ItemDefinition.BLOCK_SIZE;
        const address = ItemDefinition.ADDRESS;

        // Load item data
        for (let i = 0; i < ItemDefinition.COUNT; ++i) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const item = Item.createFromBinary(i, block, rom.text);
            if (item) instance.data[i] = item;
        }

        // Apply item description fixes
        instance.data[171].description = "Circlet: Use to delude enemies";
        instance.data[344].description = "Clothes: Boosts Attack & Criticals";
        instance.data[365].description = "Gloves: Boosts Attack & Criticals";
        instance.data.filter(item => item.description.endsWith("Raises Evade")).map(item => {
            item.description = item.description.split(':')[0] + ": Boosts Criticals";
        });

        return instance;
    }
}