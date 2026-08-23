import { MapCodeEntry } from "../data/map_code/enums";
import type { MapCodeManager } from "../data/map_code/manager";
import type { RomData } from "../rom";
import { applyEndgamePersistencePatch } from "./shortcuts";
import { applyWorldMapRetreat } from "./retreat_teleport";
import { getAssemblyExport, getAssemblyScript } from "../script_util";

const patchRandomiserLogic = getAssemblyScript('legacy_randomiser_logic');
const patchTaopoSwampAutorunFix = getAssemblyScript('taopo_swamp_autorun_fix');
const patchCountDjinnFunction = getAssemblyScript('count_djinn');
const patchHighestDjinnCountFunction = getAssemblyScript('get_highest_party_djinn_count');


const addrDjinnMapping = 0xFA0000;
const addrSpecialLocationMapping = 0xFA00A0;
const addrInventoryMapping = 0xFA00E0;
const addrRandomiserLogic = 0xFA2000;


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

    // Change the check for when the Djinn menu should go into compact mode
    rom.writeLinkedJump(0x101AF8, 0x08131A00);
    rom.writeHalfword(0x101AFC, 0xE009);    // b #0x08101B12

    // Prepare the Djinni mappings
    for (let elem = 0, addr = addrDjinnMapping; elem < 4; ++elem) {
        for (let id = 0; id < 18; ++id) {
            rom.writeByte(addr++, id);
            rom.writeByte(addr++, elem);
        }
    }

    // Prepare the special location mappings
    locationMapping.forEach((id, i) => rom.writeHalfword(addrSpecialLocationMapping + i * 2, id));
    startingInventoryMapping.forEach(([char, id], i) => {
        rom.writeHalfword(addrInventoryMapping + i * 4, char);
        rom.writeHalfword(addrInventoryMapping + i * 4 + 2, id);
    });

    // Insert big block of custom randomiser logic code
    insertRandomiserLogic(rom);

    // Apply external innate patches
    applyWorldMapRetreat(rom);

    // Insert common use functions
    rom.writeBlock(0x131900, patchCountDjinnFunction);
    rom.writeBlock(0x131A00, patchHighestDjinnCountFunction);
}


function insertRandomiserLogic(rom : RomData)
{
    rom.writeBlock(addrRandomiserLogic, patchRandomiserLogic);

    // Party initialisation injections
    rom.writeLongJump(0xADEF6, getAssemblyExport('legacy_randomiser_logic', 'function_initStartingParty'));
    rom.writeWord(0xAD22C, getAssemblyExport('legacy_randomiser_logic', 'function_initPiers'));
    rom.writeWord(0xAD244, getAssemblyExport('legacy_randomiser_logic', 'function_initReunionParty'));

    // Item handling injections
    rom.writeWord(0xAD02C, getAssemblyExport('legacy_randomiser_logic', 'function_override_addItem'));
    rom.writeWord(0xC8064, getAssemblyExport('legacy_randomiser_logic', 'injection_addItem_preCall'));
    rom.writeWord(0xC807C, getAssemblyExport('legacy_randomiser_logic', 'injection_addFoundItem_preCall'));

    // Item sprite display injections
    rom.writeWord(0xC8862, getAssemblyExport('legacy_randomiser_logic', 'injection_displayScoopItem_preCall'));
    rom.writeWord(0x3824C, getAssemblyExport('legacy_randomiser_logic', 'function_loadItemIconMapped'));

    // Injections requiring additional code
    rom.writeLongJump(0xCD0E0, getAssemblyExport('legacy_randomiser_logic', 'injection_tabletInteraction'));
    rom.writeLongJump(0xCD31A, getAssemblyExport('legacy_randomiser_logic', 'injection_chestInteraction'));
    rom.writeLongJump(0xCE76E, getAssemblyExport('legacy_randomiser_logic', 'injection_useFieldPsynergy_retreat'));
    rom.writeLongJump(0xCF294, getAssemblyExport('legacy_randomiser_logic', 'injection_displayItemObject'));
    rom.writeLongJump(0xD3B88, getAssemblyExport('legacy_randomiser_logic', 'injection_displayScoopItem'));

    //TODO: Partially rewrite the edits starting at 0x090004A0 (0x090006BC specifically) (alternatively, put this into map code)
    //TODO: Rewrite the edits starting at 0x09001828
            // Map code injections for Djinn display, this should go into map code directly instead
    //TODO: Rewrite the edits starting at 0x09006D00

    //TODO: Things to move out of the old 0x09000000 region:
	// - mimic disguises
	// - anemos requirement
	// - AP functions <-- multiple files!
	// - character shuffle <-- multiple files!
	// - taopo autorun flag
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