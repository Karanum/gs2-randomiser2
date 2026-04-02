import { DjinniDefinition, EnemyDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { Enemy } from "./model";

/** List of enemy IDs that are to be considered bosses. */
const bossEnemies = [ 66, 69, 72, 73, 80, 83, 84, 85, 86, 87, 88, 89, 90, 93, 94, 95, 96, 97, 98, 99, 100, 101,
    102, 103, 104, 105, 106, 107, 156, 186, 187, 201, 202, 203, 210, 211, 212, 213, 214, 215, 361, 362, 363, 364, 
    365, 366, 367, 368, 369, 370, 371, 372, 373];

/**
 * Data manager for enemies. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class EnemyManager extends DataManager<Enemy> 
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : EnemyManager 
    {
        const cloned = new EnemyManager();
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            cloned.data[i] = this.data[i].clone();
        }
        return cloned;
    }

    /**
     * Scales the battle rewards for all enemies in this data manager. Experience point scaling affects boss enemies 50% less.
     * @param coinScale The amount to scale coin drops by
     * @param expScale The amount to scale experience points by
     */
    scaleBattleRewards(coinScale : number, expScale : number)
    {
        const bossExpScale = 1 + (expScale - 1) / 2;
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;

            const rewards = this.data[i].rewards;
            rewards.coins = Math.min(0xFFFF, Math.floor(rewards.coins * coinScale));
            rewards.exp = Math.min(0xFFFF, Math.floor(rewards.exp * (bossEnemies.includes(i) ? bossExpScale : expScale)));
        }
    }

    /**
     * Writes all enemies in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            const enemy = this.data[i];

            rom.text.set(EnemyDefinition.TEXT_NAMES + i, enemy.name);
            rom.writeBlock(enemy.address, enemy.toBinary());
            rom.writeBlock(enemy.displayAddress, enemy.display.toBinary());
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `EnemyManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : EnemyManager
    {
        const instance = new EnemyManager();
        const blockSize = EnemyDefinition.BLOCK_SIZE;
        const address = EnemyDefinition.ADDRESS;
        const displayAddress = EnemyDefinition.ADDRESS_DISPLAY;

        // Load enemy data
        let i = 0;
        while (true) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const displayBlock = rom.readBlock(displayAddress + 8 * i, 8);
            if (block.readByte(0) == 0xFF) break;

            const enemy = Enemy.createFromBinary(i, block, displayBlock, rom.text);
            if (enemy) instance.data[i] = enemy;
            ++i;
        }

        // Make the Phoenix enemy line drop Lucky Medals as part of the innate randomiser changes
        instance.data[180].setDrop(299, 1);
        instance.data[181].setDrop(299, 1);
        instance.data[182].setDrop(299, 1);

        return instance;
    }
} 