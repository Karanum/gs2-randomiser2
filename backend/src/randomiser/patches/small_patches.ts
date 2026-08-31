import type { DjinniManager } from "../data/djinn/manager";
import { MapCodeEntry } from "../data/map_code/enums";
import type { MapCodeManager } from "../data/map_code/manager";
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

/**
 * Fixes the display of Char's sprite in the Madra house upstairs.
 * @param mapCode The `MapCodeManager` instance to apply this patch to
 * @param djinn The `DjinniManager` for the currently generating seed
 */
export function applyCharFix(mapCode : MapCodeManager, djinn : DjinniManager)
{
    const mapCodeMadraInt = mapCode.get(MapCodeEntry.MADRA_BUILDINGS)!;
    mapCodeMadraInt.hasChanged = true;
    mapCodeMadraInt.data.writeByte(0x23D8, 0xF3 + djinn.get(46)!.element);
}

/**
 * Fixes the submerged chest sprite in the Aqua Hydra room.
 * Without this, any non-chest sprites on this location will become invisible.
 * @param mapCode The `MapCodeManager` instance to apply this patch to
 */
export function applyAquaHydraChestFix(mapCode : MapCodeManager)
{
    const mapCodeShip = mapCode.get(MapCodeEntry.LEMURIAN_SHIP)!;
    mapCodeShip.hasChanged = true;
    mapCodeShip.data.writeHalfword(0x130C, 0xE001); // b #0x02009312
    mapCodeShip.data.writeHalfword(0x288A, 0xE001); // b #0x0200A890
}

/**
 * Allows entering the Lemurian Ship at East Indra Shore without Piers or going
 * to the mayor's house in Madra. Should be applied when `Setting.SHIP_START == DOOR_OPEN`.
 * @param mapCode The `MapCodeManager` instance to apply this patch to
 */
export function applyShipWithoutPiers(mapCode : MapCodeManager)
{
    const mapCodeIndraShore = mapCode.get(MapCodeEntry.INDRA_SHORE)!;
    mapCodeIndraShore.hasChanged = true;
    mapCodeIndraShore.data.writeHalfword(0x1DA2, 0xBDE0); // pop {r5-r7, pc}
}