import { readFileSync } from "node:fs";
import type { RomData } from "../rom";

const patchDisplayAvoidText = readFileSync('./src/assembly/out/avoid.bin');

/**
 * Changes Avoid to work as a toggle, as well as regardless of party level.
 * @param rom The `RomData` instance to apply this patch to
 */
export function applyToggleableAvoid(rom : RomData)
{
    // Alter level checking functions
    rom.writeHalfword(0xCA054, 0x2001); // mov r0, #0x1
    rom.writeHalfword(0xCB558, 0x1C13); // mov r3, r2

    // Change Avoid to a toggle
    rom.writeHalfword(0xE1266, 0x6813); // ldr r3, [r2, #0x0]
    rom.writeHalfword(0xE1268, 0x4053); // eor r3, r2

    // Insert custom text display function
    rom.writeBlock(0xF3F00, patchDisplayAvoidText);
    rom.writeLinkedJump(0xE1354, 0x080F3F00);
    rom.writeHalfword(0xE1358, 0xE000); // b #0x080E135C
}