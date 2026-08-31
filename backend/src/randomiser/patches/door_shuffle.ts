import type { RomData } from "../rom";

export function applyDoorShufflePatches(rom : RomData)
{
    // Disable area name display when entering a map
    rom.writeHalfword(0x3F86C, 0x4770); // bx lr
}