import { MusicDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { GenericManager } from "../base";

// Type definition for the (simplified) audio track model
type AudioEntry = {
    address: number,
    pointer: number,
    type: number,
    battleBGM: boolean
};

// Predefined list of music tracks to load for shuffling purposes
const fieldBGM : number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 
    30, 31, 34, 35, 36, 37, 38, 39, 41, 42, 43, 44, 60, 61, 62, 63, 65, 67, 74, 76, 700, 701, 702, 703, 704, 705, 706, 707, 
    708, 709, 710, 720, 721, 722, 723, 724, 725, 726, 727, 728, 729, 730, 741, 742, 743];
const battleBGM : number[] = [49, 50, 51, 52, 53, 54, 55, 56, 57, 750, 751, 752, 753, 754];

/**
 * Data manager for in-game audio tracks.
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class MusicManager extends GenericManager<AudioEntry> 
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : MusicManager
    {
        const cloned = new MusicManager();
        this.data.forEach(entry => { cloned.data.push({ ...entry }); });
        return cloned;
    }

    /**
     * Shuffles all audio tracks without regard for whether they are battle or field BGM.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleAll(prng : PRNG)
    {
        let pool : number[] = this.data.map(entry => entry.pointer);
        this.data.forEach(entry => {
            entry.pointer = prng.randomArrayElement(pool, true);
        });
    }

    /**
     * Shuffles all audio tracks, but keeps field BGM and battle BGM separated.
     * @param prng The PRNG instance for the currently generating seed
     */
    shufflePerType(prng : PRNG)
    {
        let fieldPool : number[] = [];
        let battlePool : number[] = [];
        this.data.forEach(entry => {
            (entry.battleBGM ? battlePool : fieldPool).push(entry.pointer);
        });

        this.data.forEach(entry => {
            entry.pointer = prng.randomArrayElement(entry.battleBGM ? battlePool : fieldPool, true);
        });
    }
    
    /**
     * Writes all music in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom: RomData)
    {
        this.data.forEach(entry => {
            rom.writeWord(entry.address, entry.pointer);
        });
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `MusicManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : MusicManager
    {
        const instance = new MusicManager();
        const blockSize = MusicDefinition.BLOCK_SIZE;
        const baseAddress = MusicDefinition.ADDRESS;

        fieldBGM.forEach(id => {
            const addr = baseAddress + (id * blockSize);
            instance.data.push({ address: addr, pointer: rom.readWord(addr), type: rom.readHalfword(addr + 4), battleBGM: false });
        });
        battleBGM.forEach(id => {
            const addr = baseAddress + (id * blockSize);
            instance.data.push({ address: addr, pointer: rom.readWord(addr), type: rom.readHalfword(addr + 4), battleBGM: true });
        });

        return instance;
    }
}