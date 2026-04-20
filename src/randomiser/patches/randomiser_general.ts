import { MapCodeEntry } from "../../randomiser/data/map_code/enums";
import type { MapCodeManager } from "../../randomiser/data/map_code/manager";

export function applyGeneralPatch(mapCode : MapCodeManager) 
{
    // Disable password options in main menu
    mapCode.get(MapCodeEntry.MAIN_MENU)!.data.writeHalfword(0x4B6, 0xE05B); // b pc+0xBA

    // Change Kibombo event table to fix Piers-related game logic
    mapCode.get(MapCodeEntry.KIBOMBO)!.data.writeWord(0x7520, 0x0200B8ED);

    //TODO: Finish
}