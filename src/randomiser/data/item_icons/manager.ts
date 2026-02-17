import type { RomData } from "../../rom";
import { GenericManager } from "../base";

export class ItemIconManager extends GenericManager<null> {
    //TODO: Implement

    clone(): ItemIconManager {
        throw new Error("Method not implemented.");
    }

    writeToRom(rom: RomData): void {
        throw new Error("Method not implemented.");
    }
}