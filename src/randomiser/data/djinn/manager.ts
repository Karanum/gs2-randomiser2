import { DjinniDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { Djinni } from "./model";

/**
 * Data manager for Djinn. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class DjinniManager 
{
    private data : Djinni[];
    private mapping : number[];

    constructor ()
    {
        this.data = [];
        this.mapping = [];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : DjinniManager 
    {
        const cloned = new DjinniManager();
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            cloned.data[i] = this.data[i].clone();
        }
        cloned.mapping = [...this.mapping];
        return cloned;
    }

    /**
     * Returns a djinni from this data manager. If element is not provided, it will be the raw ID: `20 * element + id`
     * @param id The id of the djinni to fetch
     * @param element The element of the djinni to fetch (optional)
     * @returns A `Djinni` object, or `undefined` if no djinni with this id exists
     */
    get (id : number, element? : number) : Djinni|undefined 
    {
        return this.data[element == undefined ? id : (element * 20 + id)];
    }

    /**
     * Writes all djinn in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        let mappingAddr = DjinniDefinition.ADDRESS_MAPPING;
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            const djinni = this.data[i];
            const mappedDjinni = this.get(this.mapping[i]) ?? djinni;

            // Write basic Djinni data
            rom.text.set(DjinniDefinition.TEXT_NAMES + i, djinni.name);
            rom.writeBlock(djinni.address, djinni.toBinary());

            // Write Djinni mapping
            rom.writeByte(mappingAddr, mappedDjinni.id);
            rom.writeByte(mappingAddr + 1, mappedDjinni.element);
            mappingAddr += 2;
        }
    }

    /**
     * Shuffles the locations of Djinn amongst themselves.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleDjinn (prng : PRNG) 
    {
        const pool = [...this.mapping];
        this.mapping = [];

        while (pool.length > 0) {
            this.mapping.push(prng.randomArrayElement(pool, true));
        }
    }

    /**
     * Shuffles the stat boosts of all Djinn.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleStats (prng : PRNG) 
    {
        const pool : number[][] = [[], [], [], [], [], []];

        for (let i = 0; i < this.data.length; ++i) {
            const djinni = this.data[i];
            if (djinni == undefined) continue;

            for (let j = 0; j < 6; ++j) {
                pool[j].push(djinni.stats[j]);
            }
        }

        for (let i = 0; i < this.data.length; ++i) {
            const djinni = this.data[i];
            if (djinni == undefined) continue;

            for (let j = 0; j < 6; ++j) {
                djinni.stats[j] = prng.randomArrayElement(pool[j], true);
            }
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `DjinniManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : DjinniManager
    {
        const instance = new DjinniManager();
        const blockSize = DjinniDefinition.BLOCK_SIZE;
        const address = DjinniDefinition.ADDRESS;

        for (let element = 0; element < 4; ++element) {
            for (let id = 0; id < 18; ++id) {
                const rawId = element * 20 + id; 
                const block = rom.readBlock(address + rawId * blockSize, blockSize);
                const djinni = Djinni.createFromBinary(rawId, block, rom.text);
                if (!djinni) continue;

                instance.data[rawId] = djinni;
                instance.mapping.push(rawId);
            }
        }

        return instance;
    }
}