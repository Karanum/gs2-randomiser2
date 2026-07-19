import type { PRNG } from "$lib/prng";
import type { ForgeResultManager } from "../data/forge_results/manager";
import { ItemEventType } from "../data/item_locations/enums";
import type { ItemLocationManager } from "../data/item_locations/manager";
import type { ItemLocation } from "../data/item_locations/model";
import { ItemType } from "../data/items/enums";
import type { ItemManager } from "../data/items/manager";
import type { Item } from "../data/items/model";
import type { ShopManager } from "../data/shops/manager";
import type { BaseLogic } from "../logic/base_logic";
import { Progression, Restriction } from "../logic/enums";
import type { LogicItem } from "../logic/locations/types";
import { Setting, SettingShuffleItems } from "../settings/enums";
import type { SettingsObject } from "../settings/settings";

/**
 * Type definition for a single sphere within a sphere map.
 */
export type Sphere = { 
    items: number[],
    djinn: number[],
    progression: Progression[]
}


/**
 * Base class for item randomisation.
 */
export abstract class BaseItemRandomiser 
{
    protected prng : PRNG;
    protected settings : SettingsObject;
    protected itemLocations : ItemLocationManager;
    protected logic : BaseLogic;

    protected availableItems : number[] = [];
    protected accessibleSlots : LogicItem[] = [];
    protected slotWeights : Record<number, number> = {};

    constructor(prng : PRNG, settings : SettingsObject, itemLocations : ItemLocationManager, logic : BaseLogic) 
    {
        this.prng = prng;
        this.settings = settings;
        this.itemLocations = itemLocations;
        this.logic = logic;

        this.itemLocations.prepare(settings, prng);
    }

    /**
     * Writes the vanilla item contents from one item location to a fixed (accessible) item location.
     * @param from fromLoc The item location ID to copy the vanilla contents from
     * @param to The item location ID to write the new contents to
     */
    protected fixedFill(from : number, to : number)
    {
        const fromLoc = this.itemLocations.get(from);
        const toLoc = this.itemLocations.get(to);
        if (fromLoc == undefined || toLoc == undefined) return;

        this.writeItemLocation(fromLoc, toLoc);
    }

    /**
     * Writes the vanilla item contents from an item location to a random accessible item location,
     * taking the current slot weights into account when picking the target location.
     * Has limited compatibility checks as weighted fill should only be used for progression items!
     * @param from The item location ID to copy the vanilla contents from
     */
    protected weightedFill(from : number)
    {
        const fromLoc = this.itemLocations.get(from)?.asVanilla();
        if (fromLoc == undefined) return;

        const validSlots : number[] = [];
        const validWeights : number[] = [];
        let totalWeight : number = 0;
        let forcedSlot : number|undefined;

        this.accessibleSlots.forEach(slot => {
            const loc = this.itemLocations.get(slot.flag);
            const weight = this.slotWeights[slot.flag];
            if (loc == undefined || weight == undefined) return;

            if (fromLoc.isCharacter() && slot.restrictions == Restriction.INVENTORY) return;
            if (fromLoc.isMajorItem() && loc.forceMinor) return;
            if (this.settings[Setting.SPLIT_MAJOR_MINOR] && fromLoc.isMajorItem() != loc.isMajorItem()) return;

            if (fromLoc.isKeyItem() && loc.forceMajor && forcedSlot == undefined) {
                forcedSlot = slot.flag;
            }

            validSlots.push(slot.flag);
            validWeights.push(weight);
            totalWeight += weight;
        });

        const targetSlot = forcedSlot ?? validSlots[this.prng.randomWeighted(validWeights, totalWeight)];
        const targetLoc = this.itemLocations.get(targetSlot);
        if (targetLoc == undefined) {
            throw new Error("A location flag somehow got past validation while not having an item location!");
        }

        this.writeItemLocation(fromLoc, targetLoc);
        this.accessibleSlots.forEach(slot => {
            if (this.slotWeights[slot.flag] == undefined) return;

            const factor : number = (forcedSlot ? 0.95 : 0.65);
            this.slotWeights[slot.flag] *= factor * Math.max(this.prng.randomFraction(), 0.1);
        });
    }

    /**
     * Writes the vanilla item contents from an item location to a random accessible item location.
     * @param from The item location ID to copy the vanilla contents from
     */
    protected randomFill(from : number)
    {
        const fromLoc = this.itemLocations.get(from)?.asVanilla();
        if (fromLoc == undefined) return;

        const validSlots : number[] = [];
        let forcedSlot : number|undefined;

        this.accessibleSlots.forEach(slot => {
            const loc = this.itemLocations.get(slot.flag);
            if (loc == undefined || this.slotWeights[slot.flag] == undefined) return;

            if (!this.isSlotCompatible(fromLoc, slot, loc)) return;
            if (fromLoc.isKeyItem() && loc.forceMajor && forcedSlot == undefined) {
                forcedSlot = slot.flag;
            }

            validSlots.push(slot.flag);
        });

        if (validSlots.length == 0) {
            console.warn("[WARN] Random item fill had to target an inaccessible item slot");
            Object.keys(this.slotWeights).forEach(flag => { validSlots.push(Number(flag)); });
        }

        const targetSlot = forcedSlot ?? this.prng.randomArrayElement(validSlots);
        const targetLoc = this.itemLocations.get(targetSlot);
        if (targetLoc == undefined) {
            throw new Error("A location flag somehow got past validation while not having an item location!");
        }

        this.writeItemLocation(fromLoc, targetLoc);
    }

    /**
     * Writes the vanilla item contents from one item location into the current contents of another
     * @param fromLoc The item location to copy the vanilla contents from
     * @param toLoc The item location to write the new contents to
     */
    protected writeItemLocation(fromLoc : ItemLocation, toLoc : ItemLocation) 
    {
        toLoc.copyContents(fromLoc);
        this.addProgression(toLoc);

        this.availableItems.splice(this.availableItems.indexOf(fromLoc.id), 1);
        delete this.slotWeights[toLoc.id];
    }

    /**
     * Adds the contents of an item location to the progression state.
     * @param itemLocation The item location to add from
     */
    protected addProgression(itemLocation : ItemLocation)
    {
        if ((itemLocation.isKeyItem() && !itemLocation.isSummon()) || itemLocation.contents == 229) {
            let item = itemLocation.contents;
            if (item < 0x400) item += 0x400;

            this.logic.addProgression(item);
            if (itemLocation.isCharacter()) this.logic.addCharacter();
        }
    }

    /**
     * Returns whether a given item is compatible with a slot and location.
     */
    private isSlotCompatible(fromLoc : ItemLocation, slot : LogicItem, toLoc : ItemLocation) : boolean
    {
        // Reject the slot if major/minor split is enabled and the classification doesn't match
        if (this.settings[Setting.SPLIT_MAJOR_MINOR] && fromLoc.isMajorItem() != toLoc.isMajorItem()) {
            return false;
        }

        // Check generic slot restrictions
        if (this.settings[Setting.SHUFFLE_ITEMS] > SettingShuffleItems.KEY_ITEMS) {
            if (fromLoc.isKeyItem() && toLoc.forceMinor) return false;
            if (fromLoc.isSummon() && slot.restrictions == Restriction.INVENTORY) return false;
        }
        if (fromLoc.isCharacter() && slot.restrictions == Restriction.INVENTORY) return false;

        // Check more specific slot restrictions for mimics and empty item locations
        if (fromLoc.type == ItemEventType.MIMIC) {
            if (toLoc.type != ItemEventType.CHEST && toLoc.type != ItemEventType.TABLET) return false;
            if (!this.settings[Setting.REMOVE_MIMICS] && slot.restrictions !== undefined) return false;
        } 
        else if (fromLoc.contents == 0) {
            if (toLoc.type != ItemEventType.CHEST && toLoc.type != ItemEventType.TABLET) return false;
            if (!this.settings[Setting.SHOW_ITEM_SPRITES] && slot.restrictions !== undefined) return false;
        }

        // Reject the slot in specific cases and item/id combinations
        if (fromLoc.isCoins() && toLoc.objectId == -1) return false;
        if (fromLoc.isCoins() || fromLoc.type == ItemEventType.MIMIC || fromLoc.contents == 0) {
            if (toLoc.id < 0x10 || (toLoc.id & 0xF00) == 0x100) return false;
        }

        // If all checks pass, the slot is compatible
        return true;
    }

    /**
     * Shuffles all available equipment, including shops and forge results.
     * @param items The ItemManager for the currently generating seed
     * @param shops The ShopManager for the currently generating seed
     * @param forgeResults The ForgeResultManager for the currently generating seed
     */
    shuffleShopEquipment(items : ItemManager, shops : ShopManager, forgeResults : ForgeResultManager) 
    {
        const slots : ItemLocation[] = [];
        const equipment : [number, string][] = [];

        // Get all equipment from item locations
        this.itemLocations.getUnlockedLocations().forEach(loc => {
            if (loc.isEquipment() && !loc.isKeyItem()) {
                slots.push(loc);
                equipment.push([loc.contents, loc.name]);
            }
        });

        // Get all equipment from shops and forge results
        [...shops.getAllArtifacts(), ...forgeResults.getAllResults()].forEach(id => {
            const item = items.get(id);
            if (item?.isEquipment()) {
                equipment.push([item.id, item.name]);
            }
        });

        // Assign all equipment randomly back into their spots
        slots.forEach(loc => {
            const item = this.prng.randomArrayElement(equipment, true);
            loc.setContents(item[0], item[1]);
        });

        const equipmentIds : number[] = equipment.map(entry => entry[0]);
        forgeResults.randomiseResults(this.prng, equipmentIds);
        shops.shuffleEquipmentArtifacts(this.prng, items, equipmentIds);
    }

    /**
     * Sorts all equipment in item locations based on their Attack and Defense values.
     * @param items The ItemManager for the currently generating seed
     * @param spheres The sphere map of the current randomiser state
     */
    sortEquipment(items : ItemManager, spheres : Sphere[])
    {
        const weaponSlots : ItemLocation[][] = [];
        const armourSlots : ItemLocation[][] = [];
        const weapons : Item[] = [];
        const armour : Item[] = [];

        // Collect all item locations that contain equipment and their respective contents
        spheres.forEach(sphere => {
            const sphereWeapons : ItemLocation[] = [];
            const sphereArmour : ItemLocation[] = [];

            sphere.items.forEach(flag => {
                const loc = this.itemLocations.get(flag);
                if (!loc?.isEquipment() || loc.isKeyItem()) return;

                const item = items.get(loc.contents);
                if (item == undefined) return;

                if (item.type == ItemType.WEAPON) {
                    sphereWeapons.push(loc);
                    weapons.push(item);
                } else {
                    sphereArmour.push(loc);
                    armour.push(item);
                }
            });

            weaponSlots.push(sphereWeapons);
            armourSlots.push(sphereArmour);
        });

        // Sort all equipment based on their primary stat value
        weapons.sort((a, b) => a.attack - b.attack);
        armour.sort((a, b) => a.getArmourScore() - b.getArmourScore());

        // Insert all equipment back into the item locations
        weaponSlots.forEach(sphere => {
            while (sphere.length > 0) {
                const slot = this.prng.randomArrayElement(sphere, true);
                const item = weapons.splice(0, 1)[0];
                slot.setLocked(false);
                slot.setContents(item.id, item.name);
            }
        });
        armourSlots.forEach(sphere => {
            while (sphere.length > 0) {
                const slot = this.prng.randomArrayElement(sphere, true);
                const item = armour.splice(0, 1)[0];
                slot.setLocked(false);
                slot.setContents(item.id, item.name);
            }
        });
    }

    /**
     * Sorts all summons in item locations based on their vanilla ordering.
     * @param spheres The sphere map of the current randomiser state
     */
    sortSummons(spheres : Sphere[])
    {
        const slots : ItemLocation[][] = [];
        const summons : [number, string][] = [];

        // Collect all item locations that contain summons and their respective contents
        spheres.forEach(sphere => {
            const sphereSlots : ItemLocation[] = [];
            sphere.items.forEach(flag => {
                const loc = this.itemLocations.get(flag);
                if (!loc?.isSummon()) return;

                sphereSlots.push(loc);
                summons.push([loc.contents, loc.name]);
            });
            slots.push(sphereSlots);
        });

        // Sort the summons and insert them back into the item locations
        summons.sort((a, b) => a[0] - b[0]);
        slots.forEach(sphere => {
            while (sphere.length > 0) {
                const slot = this.prng.randomArrayElement(sphere, true);
                const item = summons.splice(0, 1)[0];
                slot.setContents(item[0], item[1]);
            }
        });
    }

    /**
     * Sorts all mimics in item locations based on their enemy ID.
     * Mimic difficulty is capped per sphere, so this may result in multiple
     * of the easier Mimic enemies if they are leaning towards the lower spheres.
     * @param spheres The sphere map of the current randomiser state
     */
    sortMimics(spheres : Sphere[])
    {
        let nextMimic : number = 0;
        spheres.forEach((sphere, i) => {
            const maxMimicLevel = Math.ceil(10 * (i + 1) / spheres.length);
            sphere.items.forEach(flag => {
                const loc = this.itemLocations.get(flag);
                if (loc?.type == ItemEventType.MIMIC) {
                    loc.setContents(Math.min(nextMimic++, maxMimicLevel));
                }
            });
        });
    }

    abstract run() : void;
    abstract getSpheres(allItems : boolean, djinn : boolean, progression : boolean) : Sphere[];
}