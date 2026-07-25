import { MapCodeEntry } from "../data/map_code/enums";
import type { RomData } from "../rom";

export function applyAssuredOverworldDjinnPatch(rom : RomData)
{
    const worldMap = rom.mapCode.get(MapCodeEntry.WORLD_MAP)!;
    worldMap.hasChanged = true;

    // Skip battle step counter check in the overworld Djinni functions
    worldMap.data.writeHalfword(0x50, 0xE00C);      // b #0x0200806C
    worldMap.data.writeHalfword(0xB4, 0xE00C);      // b #0x020080D0
    worldMap.data.writeHalfword(0x118, 0xE00C);     // b #0x02008134
    worldMap.data.writeHalfword(0x17C, 0xE00C);     // b #0x02008198
    worldMap.data.writeHalfword(0x1E0, 0xE00C);     // b #0x020081FC
    worldMap.data.writeHalfword(0x244, 0xE00C);     // b #0x02008260
}