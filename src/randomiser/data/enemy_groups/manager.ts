import { EnemyGroupDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { EnemyGroup } from "./model";

/**
 * Data manager for enemy encounter groups. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class EnemyGroupManager extends DataManager<EnemyGroup>
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : EnemyGroupManager
    {
        const cloned = new EnemyGroupManager();
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
    static loadFromRom (rom : RomData) : EnemyGroupManager
    {
        const instance = new EnemyGroupManager();
        const blockSize = EnemyGroupDefinition.BLOCK_SIZE;
        const address = EnemyGroupDefinition.ADDRESS;

        for (let i = 0; i < EnemyGroupDefinition.COUNT; ++i) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const enemyGroup = EnemyGroup.createFromBinary(i, block);
            if (enemyGroup) instance.data[i] = enemyGroup;
        }

        return instance;
    }
}