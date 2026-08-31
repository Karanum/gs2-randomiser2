import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { MapCode } from "./model";
import { decompress, decompressBranchLinks } from "$lib/compression";
import { MapCodeEntry } from "./enums";
import { MapDataDefinition } from "$lib/definitions";
import { applyGeneralMapCodePatches } from "../../patches/randomiser_general";


/** The safe limit for compressed map code data. Going past this will break things. */
const ADDRESS_LIMIT: number = 0xF9F000;

/** The MFT index of the first map code entry. */
const MFT_START : number = MapCodeEntry.TITLE_SCREEN;

/** The MFT index of the last map code entry. */
const MFT_END : number = MapCodeEntry.DEBUG_SHOPS;

/** Name of the directory to cache pre-compressed map code data in. */
const CACHE_DIR : string = 'map_code_cache';


/**
 * Data manager for map code scripts. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class MapCodeManager extends DataManager<MapCode>
{
    private static cache : Uint8Array[] = [];

    /**
     * Returns an object from this data manager.
     * @param id The id of the object to fetch
     * @returns The requested object, or `undefined` if this id does not exist
     */
    get(id : number) : MapCode|undefined
    {
        return this.data[id - MFT_START];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : MapCodeManager 
    {
        const cloned = new MapCodeManager();
        for (let i = 0; i < this.data.length; ++i) {
            cloned.data[i] = this.data[i].clone();
        }
        return cloned;
    }

    /**
     * Writes all map code in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData)
    {
        let address : number = MapDataDefinition.ADDRESS_MAP_CODE;

        for (let i = 0; i < this.data.length; ++i) {
            // Update the MFT pointer
            rom.writeMFT(MFT_START + i, address + 0x08000000);

            // Write the compressed map code, fetching it from the cache if unaltered
            const mapCode = this.data[i];
            const compressed = (mapCode.hasChanged ? mapCode.toBinary() : MapCodeManager.cache[i]);
            rom.writeByte(address, 0x1);
            rom.writeBlock(address + 1, compressed);

            address += compressed.length + 1;
            if (address % 4 != 0) {
                address += 4 - (address % 4);
            }

            // Guard against map data overflowing into other data
            if (address >= ADDRESS_LIMIT) {
                throw new Error("Map code data overflow.");
            }
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `MapCodeManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : MapCodeManager
    {
        if (!existsSync(`./${CACHE_DIR}/`)) {
            mkdirSync(`./${CACHE_DIR}/`);
        }

        const instance = new MapCodeManager();

        // Load and decompress all map code data
        for (let id = MFT_START; id <= MFT_END; ++id) {
            const pointer = rom.readMFT(id);
            const mapCode = decompress(rom, pointer);
            if (!mapCode) continue;

            decompressBranchLinks(mapCode);
            instance.data[id - MFT_START] = new MapCode(id, mapCode);
        }

        // Apply innate map code patches before caching
        applyGeneralMapCodePatches(instance);

        // Populate the pre-compressed cache
        if (MapCodeManager.cache.length == 0) {
            for (let i = 0; i < instance.data.length; ++i) {
                const filepath = `./${CACHE_DIR}/${i + MFT_START}.bin`;

                if (existsSync(filepath)) {
                    MapCodeManager.cache[i] = readFileSync(filepath);
                } else {
                    const compressed = instance.data[i].toBinary();
                    MapCodeManager.cache[i] = compressed;
                    writeFileSync(filepath, compressed);
                }
            }
        }

        return instance;
    }
}