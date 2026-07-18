import { readFileSync } from "node:fs";
import { MapCodeEntry } from "../data/map_code/enums";
import type { MapCodeManager } from "../data/map_code/manager";
import type { RomData } from "../rom";
import { applyEndgamePersistencePatch } from "./shortcuts";
import { applyWorldMapRetreat } from "./retreat_teleport";

const patchTaopoSwampAutorunFix = readFileSync('./src/assembly/out/taopo_swamp_autorun_fix.bin');
const patchCountDjinnFunction = readFileSync('./src/assembly/out/count_djinn.bin');

const locationMapping = [0xC6, 0xC7, 0xD1, 0xD2, 0xD7, 0xDE, 0xF2, 0x146, 0x1C4, 0x1C5, 0x1C6, 0x1C7, 0x1C9, 0x1CA, 
    0x1CC, 0xE90, 0xE8A, 0xE8B, 0xE9A, 0xF16, 0x1B9, 0x41, 0xE8D, 0xE4E, 0xE0C, 0xCE, 0xCB, 0xC8, 0xCF, 0xC9, 0xCA];

const startingInventoryMapping = [[4, 0xE8C], [4, 0xE95], [4, 0xE96], [4, 0x41], [4, 0xE0C], [6, 0xE4E], [6, 0xE8D],
    [0, 0], [7, 0xC9], [7, 0xCA], [0, 0], [0, 0xE8C], [0, 0xE95], [1, 0xE8C], [0, 0xCF], [1, 0xC8], [2, 0xCB], [3, 0xCE]];


export function applyGeneralRomPatches(rom : RomData)
{
    // Increase the vanilla ROM size
    rom.expand(0x7910);

    // Skip Djinni allocation to Isaac's party when starting a new game
    rom.writeHalfword(0xAE868, 0x4770);     // bx lr

    // Disable Trial Road inventory snapshotting
    rom.writeHalfword(0xB10A4, 0xE08C);     // b #0x080B11C0
    rom.writeHalfword(0xB11D0, 0xE009);     // b #0x080B11E6
    rom.writeHalfword(0xB125A, 0x0000);     // nop
    rom.writeHalfword(0xB1264, 0x0000);     // nop

    // ??? (This is in the function for sorting Djinn)
    //TODO: Determine effect of legacy edit
    rom.writeHalfword(0x101B12, 0x2800);    // cmp r0, #0
    rom.writeHalfword(0x101B14, 0xDA0D);    // bge #0x08101B32

    // Prepare the Djinni mappings
    for (let elem = 0, addr = 0xFA0000; elem < 4; ++elem) {
        for (let id = 0; id < 18; ++id) {
            rom.writeByte(addr++, id);
            rom.writeByte(addr++, elem);
        }
    }

    // Prepare the special location mappings
    locationMapping.forEach((id, i) => rom.writeHalfword(0xFA00A0 + i * 2, id));
    startingInventoryMapping.forEach(([char, id], i) => {
        rom.writeHalfword(0xFA00E0 + i * 4, char);
        rom.writeHalfword(0xFA00E2 + i * 4, id);
    });

    // ??? (Enumerates party members, but why?)
    //TODO: Determine effect of legacy edit
    rom.writeBlock(0xFA3000, Uint8Array.of(0, 1, 2, 3, 4, 5, 6, 7));

    // Custom function for party member initialisation
    rom.writeLongJump(0xADEF6, 0x09000801, 0);
    // TODO: Inject script(s) at 0x1000800

    //TODO: Check whether the edits starting at 0x09000154 should be included or dropped
    //TODO: Check whether the edits starting at 0x09000300 should be included or dropped
    //TODO: Check whether the edits starting at 0x090004A0 should be included or dropped

    // Apply external innate patches
    applyWorldMapRetreat(rom);

    // Insert common use functions
    rom.writeBlock(0x131900, patchCountDjinnFunction);

    //TODO: Finish
}

export function applyGeneralMapCodePatches(mapCode : MapCodeManager) 
{
    const mapCodeMainMenu = mapCode.get(MapCodeEntry.MAIN_MENU)!;
    const mapCodeWorldMap = mapCode.get(MapCodeEntry.WORLD_MAP)!;
    const mapCodeDailaInt = mapCode.get(MapCodeEntry.DAILA_BUILDINGS)!;
    const mapCodeKibombo = mapCode.get(MapCodeEntry.KIBOMBO)!;
    const mapCodeTaopo = mapCode.get(MapCodeEntry.TAOPO_SWAMP)!;
    const mapCodeTrialRoad = mapCode.get(MapCodeEntry.TRIAL_ROAD)!;

    // Disable password options in main menu
    mapCodeMainMenu.data.writeHalfword(0x4B6, 0xE05B);      // b pc+0xBA

    // Skip Echo's tutorial
    mapCodeWorldMap.data.writeHalfword(0x117E, 0x210B);     // mov r1, #0xB
    mapCodeWorldMap.data.writeHalfword(0x1EB6, 0xE344);     // b #0x0200A542

    // Remove sprite scaling on the Daila sanctum item
    mapCodeDailaInt.data.writeHalfword(0xB5E, 0xE007);      // b #0x02008B70

    // Change Kibombo event table to fix Piers-related game logic
    mapCodeKibombo.data.writeWord(0x7520, 0x0200B8ED);

    // Fix Taopo Swamp sink speed with auto-run
    mapCodeTaopo.writeLinkedJump(0x218C, 0x0200B5F4);
    mapCodeTaopo.data.writeHalfword(0x2190, 0xE005);        // b #0x0200A19E
    mapCodeTaopo.data.expand(patchTaopoSwampAutorunFix.length);
    mapCodeTaopo.data.writeBlock(0x35F4, patchTaopoSwampAutorunFix);

    // Stop Trial Road summit doors from closing and always allow forfeiting
    mapCodeTrialRoad.data.writeHalfword(0x34E, 0xE002);     // b #0x02008356
    mapCodeTrialRoad.data.writeHalfword(0x1760, 0xE034);    // b #0x020097CC

    // Apply external innate patches
    applyEndgamePersistencePatch(mapCode);

    //TODO: Finish
}