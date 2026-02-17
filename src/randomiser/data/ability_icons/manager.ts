import type { RomData } from "../../rom";
import { GenericManager } from "../base";

export class AbilityIconManager extends GenericManager<null> {
    //TODO: Implement

    clone(): AbilityIconManager {
        throw new Error("Method not implemented.");
    }

    writeToRom(rom: RomData): void {
        throw new Error("Method not implemented.");
    }
}