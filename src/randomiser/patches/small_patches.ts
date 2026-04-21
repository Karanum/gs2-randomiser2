import type { RomData } from "../rom";

/**
 * Stops shops from offering Game Tickets when coin spending thresholds are met.
 * @param rom The ROM instance to apply this patch to
 */
export function applyRemoveGameTickets(rom : RomData) 
{
    rom.writeHalfword(0xAFED4, 0x4770); // bx lr
}

/**
 * Increases the movement speed of the Lemurian Ship by 50% on the world map.
 * @param rom The ROM instance to apply this patch to
 */
export function applyIncreaseShipSpeed(rom : RomData)
{
    rom.writeByte(0x285A4, 0xF0); // 0xA0 -> 0xF0
}

/**
 * Reduces the cost scaling for reviving at a sanctum from `20*level` to `2*level`.
 * @param rom The ROM instance to apply this patch to
 */
export function applyCheapReviveCost(rom : RomData)
{
    rom.writeHalfword(0x10A874, 0x0050); // lsl r0, r4, #0x1
    rom.writeHalfword(0x10A876, 0x46C0); // nop
    rom.writeHalfword(0x10A878, 0x46C0); // nop
}

/**
 * Fixes the cost for reviving at a sanctum to 100 coins regardless of level.
 * @param rom The ROM instance to apply this patch to
 */
export function applyFixedReviveCost(rom : RomData)
{
    rom.writeHalfword(0x10A874, 0x2064); // mov r0, #100
    rom.writeHalfword(0x10A876, 0x46C0); // nop
    rom.writeHalfword(0x10A878, 0x46C0); // nop
}

/**
 * Halves the enemy encounter rate throughout the entire game.
 * @param rom The ROM instance to apply this patch to
 */
export function applyHalveEncounterRate(rom : RomData)
{
    rom.writeByte(0xCA0B8, 0x78); // lsl r0, r7, #0x15 (from #0x14)
}