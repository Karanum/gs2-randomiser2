import { MapCodeEntry } from "../data/map_code/enums";
import type { MapCodeManager } from "../data/map_code/manager";

/**
 * Makes certain shortcuts in endgame bonus dungeons persistent to better match
 * with the visual language used for shortcuts in literally every other dungeon.
 * @param mapCode The `MapCodeManager` instance to apply this patch to
 */
export function applyEndgamePersistencePatch(mapCode : MapCodeManager) 
{
    const mapCodeTI = mapCode.get(MapCodeEntry.TREASURE_ISLE)!;
    const mapCodeYDC = mapCode.get(MapCodeEntry.YAMPI_DESERT_CAVE)!;

    // Treasure Isle - Water room Move pillar (0x308 -> 0xC00)
    mapCodeTI.data.writeWord(0x7DC, 0x010020C0);    // mov r0, #0xC0 
    mapCodeTI.data.writeWord(0xDB2, 0x010020C0);    // lsl r0, r0, #0x4
    mapCodeTI.data.writeHalfword(0x1822, 0x0C00);

    // Treasure Isle - Basement Move pillar (0x30D -> 0xC01)
    mapCodeTI.data.writeWord(0x844, 0x30010100);    // lsl r0, r0, #0x4
    mapCodeTI.data.writeWord(0xECE, 0x30010100);    // add r0, #0x1 
    mapCodeTI.data.writeHalfword(0x19DE, 0x0C01);

    // Yampi Desert Cave - Entrance Burst pillar (0x300 -> 0xC10)
    mapCodeYDC.data.writeWord(0xE18, 0x010020C1);   // mov r0, #0xC1
    mapCodeYDC.data.writeWord(0xE32, 0x010020C1);   // lsl r0, r0, #0x4
    mapCodeYDC.data.writeWord(0x1476, 0x010020C1);
    mapCodeYDC.data.writeHalfword(0x1D9A, 0x0C10);

    // Yampi Desert Cave - Loopback shortcut Burst pillar (0x301 -> 0xC11)
    mapCodeYDC.data.writeWord(0xE40, 0x010020C1);   // mov r0, #0xC1
    mapCodeYDC.data.writeWord(0xE5C, 0x010020C1);   // lsl r0, r0, #0x4
    mapCodeYDC.data.writeWord(0x1684, 0x010020C1);
    mapCodeYDC.data.writeHalfword(0x1F3E, 0x0C11);

    // Yampi Desert Cave - Final Move pillar (0x304 -> 0xC20)
    mapCodeYDC.data.writeWord(0x1010, 0x010020C2);  // mov r0, #0xC2
    mapCodeYDC.data.writeWord(0x169C, 0x010020C2);  // lsl r0, r0, #0x4
    mapCodeYDC.data.writeHalfword(0x1F62, 0x0C20);
    mapCodeYDC.data.writeHalfword(0x1F6E, 0x0C20);

    // Yampi Desert Cave - Djinni room Move pillar (0x305 -> 0xC03)
    mapCodeYDC.data.writeWord(0xFCC, 0x30030100);   // lsl r0, r0, #0x4
    mapCodeYDC.data.writeWord(0x16EC, 0x30030100);  // add r0, #0x3 
    mapCodeYDC.data.writeHalfword(0x1F4A, 0x0C03);
    mapCodeYDC.data.writeHalfword(0x1F56, 0x0C03);
}