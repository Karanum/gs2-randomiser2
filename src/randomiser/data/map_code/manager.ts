import { existsSync, mkdirSync } from "node:fs";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import type { MapCode } from "./model";

const MFT_START = 1609;
const MFT_END = 1723;

export class MapCodeManager extends DataManager<MapCode>
{
    clone () : MapCodeManager 
    {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }

    writeToRom (rom : RomData)
    {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }

    static loadFromRom (rom : RomData) : MapCodeManager
    {
        if (!existsSync('./src/map_code_cache/')) {
            mkdirSync('./src/map_code_cache/');
        }

        //TODO: Implement
        throw new Error("Method not implemented.");
    }
}