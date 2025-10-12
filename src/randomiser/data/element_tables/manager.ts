import { ElementTableDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { ElementTable } from "./model";

/**
 * Data manager for elemental stats tables for enemies. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class ElementTableManager
{
    private data : ElementTable[];

    constructor ()
    {
        this.data = [];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : ElementTableManager 
    {
        const cloned = new ElementTableManager();
        this.data.forEach(table => { cloned.data.push(table.clone()) });
        return cloned;
    }

    /**
     * Returns a table from this data manager.
     * @param id The id of the table to fetch
     * @returns An `ElementTable` object, or `undefined` if no table with this id exists
     */
    get (id : number) : ElementTable|undefined 
    {
        return this.data[id];
    }

    /**
     * Writes all element tables in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        for (let i = 0; i < this.data.length; ++i) {
            rom.writeBlock(this.data[i].address, this.data[i].toBinary());
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `ElementTableManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : ElementTableManager
    {
        const instance = new ElementTableManager();
        const blockSize = ElementTableDefinition.BLOCK_SIZE;
        const address = ElementTableDefinition.ADDRESS;

        for (let i = 0; i < ElementTableDefinition.COUNT; ++i) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const table = ElementTable.createFromBinary(i, block);
            if (!table) continue;
            instance.data.push(table);
        }

        return instance;
    }
}