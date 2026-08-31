import { EncounterTableDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { EncounterTable } from "./model";

/** 
 * A list of encounter tables that contain fixed enemy data (e.g. bosses) and are used
 * for in-game events, and should thus not be changed under normal circumstances.
 */
const lockedTables : number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 102, 103, 104, 105, 106];

/**
 * Data manager for area encounter tables. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class EncounterTableManager extends DataManager<EncounterTable>
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : EncounterTableManager
    {
        const cloned = new EncounterTableManager();
        for (let i = 0; i < this.data.length; ++i) {
            cloned.data[i] = this.data[i]?.clone();
        }
        return cloned;
    }

    /**
     * Writes all enemy groups in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            rom.writeBlock(this.data[i].address, this.data[i].toBinary());
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `EnemyGroupManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : EncounterTableManager
    {
        const instance = new EncounterTableManager();
        const blockSize = EncounterTableDefinition.BLOCK_SIZE;
        const address = EncounterTableDefinition.ADDRESS;

        for (let i = 0; i < EncounterTableDefinition.COUNT; ++i) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const table = EncounterTable.createFromBinary(i, block);
            if (table) instance.data[i] = table;
        }

        return instance;
    }
}