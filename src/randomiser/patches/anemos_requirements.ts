import type { PRNG } from "$lib/prng";
import { readFileSync } from "node:fs";
import { EventType, MapCodeEntry } from "../data/map_code/enums";
import type { RomData } from "../rom";
import { END, LINE, Var } from "../data/text/control_characters";

const patchInteractSign = readFileSync('./src/assembly/out/anemos/entrance_sign.bin');
const patchMapInit = readFileSync('./src/assembly/out/anemos/entrance_map_init.bin');

/**
 * Changes the requirement for opening Anemos Inner Sanctum to a random 
 * number of Djinn between 16 and 28 inclusive.
 * @param rom The `RomData` instance for the currently generating seed
 * @param prng The `PRNG` instance for the currently generating seed
 */
export function applyRandomAnemosRequirement(rom : RomData, prng : PRNG) 
{
    const mapCode = rom.mapCode.get(MapCodeEntry.ANEMOS_SANCTUM)!;
    mapCode.hasChanged = true;

    // Randomise Djinn count
    const djinnCount = Math.floor(prng.randomBetween(16, 29));
    rom.writeByte(0x01007902, djinnCount);

    // Disable the original floor tile events for checking Djinn counts
    mapCode.data.writeByte(0x3DF7, 0x12);
    mapCode.data.writeByte(0x3E03, 0x12);
    mapCode.data.writeByte(0x3E0F, 0x12);
    mapCode.data.writeByte(0x3E1B, 0x12);

    // Create a new NPC table for map 303 and add a sign object
    mapCode.data.writeHalfword(0x864, 0xC454);
    mapCode.setSignlikeNpcEntry(0x4454, 0x1C2, -1, 0x200, 0x0, 0xE4);
    mapCode.setFinalNpcEntry(0x446C);
    mapCode.setEventEntry(0x3DE4, EventType.NPC, 0, 0, 8, 0xFFFF, 0x0200C485);
    mapCode.data.writeBlock(0x4484, patchInteractSign);

    // Override the init function for map 303
    mapCode.writeLinkedJump(0x1E94, 0x02008AC8);
    mapCode.data.writeBlock(0xAC8, patchMapInit);

    // Set text for the Djinn count sign
    rom.text.set(0x1578, `${Var.NUM} Djinn are required${LINE}to open the door.${END}`);
}