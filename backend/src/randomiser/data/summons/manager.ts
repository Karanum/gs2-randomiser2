import { SummonDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import type { AbilityManager } from "../abilities/manager";
import { DataManager } from "../base";
import { Element } from "../enums";
import { Summon } from "./model";

/**
 * Data manager for summons. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class SummonManager extends DataManager<Summon> 
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : SummonManager 
    {
        const cloned = new SummonManager();
        this.data.forEach(summon => { cloned.data.push(summon.clone()); });
        return cloned;
    }

    /**
     * Randomises the Djinn cost for each summon, and updates the element of the linked ability accordingly.
     * @param prng The PRNG instance for the currently generating seed
     * @param abilityManager The ItemManager instance for the currently generating seed
     */
    randomiseCosts(prng : PRNG, abilityManager : AbilityManager)
    {
        const singleElements = [0, 1, 2, 3];
        this.data.forEach(summon => {
            const totalCost = summon.getTotalCost();
            const newCost : [number, number, number, number] = [0, 0, 0, 0];
            let mainElement : Element = Element.PHYSICAL;

            if (totalCost > 1) {
                // Randomise the cost by spreading the total cost across (up to) 2 elements
                const majorCost = this.makeMajorElementCost(prng, totalCost);
                const minorCost = totalCost - majorCost;
                const majorElement = prng.randomInt(4);
                let minorElement = majorElement;
                
                if (totalCost > 4 || prng.randomFraction() < 0.5) {
                    while (majorElement == minorElement) {
                        minorElement = prng.randomInt(4);
                    }
                }
                
                newCost[majorElement] += majorCost;
                newCost[minorElement] += minorCost;
            } else {
                // Pick a random unused element for single-cost summons to prevent having a blank Summon menu in battles
                const element = prng.randomArrayElement(singleElements, true);
                newCost[element] = 1;
                mainElement = element;
            }

            summon.setCost(newCost);
            const ability = abilityManager.get(summon.ability);
            if (ability !== undefined) { ability.element = mainElement; }
        });

        // Fix for Daedalus' follow-up ability
        abilityManager.get(403)!.element = abilityManager.get(402)!.element;
    }

    /**
     * Writes all summons in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom: RomData) 
    {
        this.data.forEach(summon => {
            rom.writeBlock(summon.address, summon.toBinary());
        });
    }

    /**
     * Calculates a random major element cost for summons based on the provided total cost.
     * @param prng The PRNG instance for the currently generating seed
     * @param totalCost The total cost of the summon
     */
    private makeMajorElementCost(prng : PRNG, totalCost : number) : number {
        const min = Math.ceil(totalCost * 0.5);
        const max = Math.floor(totalCost * 0.8);
        return Math.floor(prng.randomBetween(min, max + 0.75));
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `SummonManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : SummonManager
    {
        const instance = new SummonManager();
        const blockSize = SummonDefinition.BLOCK_SIZE;
        const address = SummonDefinition.ADDRESS;

        for (let i = 0; i < SummonDefinition.COUNT; ++i) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const summon = Summon.createFromBinary(i, block, rom.text);
            if (summon) instance.data[i] = summon;
        }

        return instance;
    }
}