import { ForgeResultDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { ForgeResult } from "./model";

export class ForgeResultManager extends DataManager<ForgeResult>
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : ForgeResultManager
    {
        const cloned = new ForgeResultManager();
        this.data.forEach(entry => cloned.data.push(entry.clone()));
        return cloned;
    }

    /**
     * Returns the item IDs of all possible forging results.
     */
    getAllResults() : number[]
    {
        return this.data.map(table => table.results).flat().filter(item => item != 0);
    }

    /**
     * Randomises the forging results for all forgable items.
     * Modifies the array passed as `pool` by removing the items that were picked.
     * @param prng The PRNG instance for the currently generating seed
     * @param pool A list of all possible forging result item IDs
     */
    randomiseResults(prng : PRNG, pool : number[])
    {
        this.data.forEach(table => {
            for (let i = 0; i < table.results.length; ++i) {
                if (table.results[i] == 0) continue;
                let item = prng.randomArrayElement(pool, true);
                table.set(i, item);
            }
        });
    }

    /**
     * Writes all forging results in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom : RomData) 
    {
        const address = ForgeResultDefinition.ADDRESS;
        const blockSize = ForgeResultDefinition.BLOCK_SIZE;

        for (let i = 0; i < this.data.length; ++i) {
            rom.writeBlock(address + i * blockSize, this.data[i].toBinary());
        }
        rom.writeHalfword(address + this.data.length * blockSize, 0xFFFF);
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `ForgeResultManager` instance which has been populated with game data
     */
    static loadFromRom(rom : RomData) : ForgeResultManager
    {
        const instance = new ForgeResultManager();
        const address = ForgeResultDefinition.ADDRESS;
        const blockSize = ForgeResultDefinition.BLOCK_SIZE;

        let i = 0;
        while(true) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            if (block.readHalfword(0) == 0xFFFF) break;

            const forgeResult = ForgeResult.createFromBinary(i, block);
            instance.data.push(forgeResult!);
            ++i;
        }

        return instance;
    }
}