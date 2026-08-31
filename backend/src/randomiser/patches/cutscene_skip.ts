import type { MapCodeManager } from "../data/map_code/manager";
import { END, END_PERSIST, LINE, Name } from "../data/text/control_characters";
import type { RomData } from "../rom";
import { MapCodeEntry } from "../data/map_code/enums";
import { getAssemblyScript } from "../script_util";

const patchKandoreanLashScene = getAssemblyScript('cutscene_skip/kandorean_lash_scene');
const patchMadraMayorsGiftScene = getAssemblyScript('cutscene_skip/madra_mayors_gift_scene');
const patchAlhafraBreadBoySkip = getAssemblyScript('cutscene_skip/alhafra_bread_boy');
const patchAlhafraCaveGuardSkip = getAssemblyScript('cutscene_skip/alhafra_cave_guard');
const patchAlhafraMayorDocksScene = getAssemblyScript('cutscene_skip/alhafra_mayor_docks_scene');
const patchBriggsBossScene = getAssemblyScript('cutscene_skip/briggs');
const patchKibomboPiersScene = getAssemblyScript('cutscene_skip/kibombo_piers_scene');
const patchKibomboElderScene = getAssemblyScript('cutscene_skip/kibombo_elder_scene');
const patchGabombaPuzzleIntroScene = getAssemblyScript('cutscene_skip/gabomba_puzzle_intro_scene');
const patchGabombaPostPuzzleScene = getAssemblyScript('cutscene_skip/gabomba_post_puzzle_scene');
const patchIsletCaveFrom = getAssemblyScript('cutscene_skip/islet_cave_from');
const patchIsletCaveTo = getAssemblyScript('cutscene_skip/islet_cave_to');
const patchGaiaRockSerpentScene = getAssemblyScript('cutscene_skip/gaia_rock_serpent_scene');
const patchChampaProng1 = getAssemblyScript('cutscene_skip/champa_prong_1');
const patchChampaProng2 = getAssemblyScript('cutscene_skip/champa_prong_2');
const patchChampaProng3 = getAssemblyScript('cutscene_skip/champa_prong_3');
const patchChampaPreAvimanderScene = getAssemblyScript('cutscene_skip/champa_pre_avimander');
const patchChampaPostAvimanderScene = getAssemblyScript('cutscene_skip/champa_post_avimander');
const patchContigoReunion = getAssemblyScript('cutscene_skip/contigo_reunion');
const patchShamanVillageRodScene = getAssemblyScript('cutscene_skip/shaman_village_rod_scene');
const patchJupiterLighthouseAerie = getAssemblyScript('cutscene_skip/jupiter_lighthouse_aerie');
const patchLohoCannonScene = getAssemblyScript('cutscene_skip/loho_cannon_scene');
const patchMarsLighthouseAerie = getAssemblyScript('cutscene_skip/mars_lighthouse_aerie');


export function applyCutsceneSkip(rom : RomData)
{
    const mapCode = rom.mapCode;
    const text = rom.text;

    applyKandorean(mapCode);
    applyLemurianShip(mapCode);
    applyMadra(mapCode);
    applyGaroh(mapCode);
    applyAlhafra(mapCode);
    applyKibombo(mapCode);
    applyGabomba(mapCode);
    applyEasternSeaIsles(mapCode);
    applyAquaRock(mapCode);
    applyIzumo(mapCode);
    applyGaiaRock(mapCode);
    applyChampa(mapCode);
    applyContigo(mapCode);
    applyShamanVillage(mapCode);
    applyJupiterLighthouse(mapCode);
    applyLoho(mapCode);
    applyNorthernReaches(mapCode);
    applyMarsLighthouse(mapCode);

    // Set text lines for the added battle prompts
    text.set(0x1B67, "Fight Briggs?" + END_PERSIST);
    text.set(0x2ACD, "Fight Agatio and Karst?" + END_PERSIST);
    text.set(0x261E, "Fight Avimander?" + END_PERSIST);
    text.set(0x2D8C, "Fight Doom Dragon?" + END_PERSIST);

    // Set miscellaneous text lines
    text.set(0x2186, `You can't carry any more,${LINE}so the Mayor's reward was${LINE}placed in the nearby pot.${END}`);
    text.set(0x266E, `You have given me${LINE}one prong piece so far.${END}`);
    text.set(0x2678, `You have given me${LINE}two prong pieces now.${END}`);
    text.set(0x2B5D, `${Name.ISAAC} and friends have${LINE}reunited with your party.${END}`);

    // Add extra flags to the New Game flag list
    rom.addNewGameFlags(0xF22, 0x890, 0x891, 0x892, 0x893, 0x894, 0x895, 0x896, 0x848, 0x86C, 0x86D, 0x86E, 0x86F,
        0x916, 0x844, 0x863, 0x864, 0x865, 0x867, 0x872, 0x873, 0x84B, 0x91B, 0x91C, 0x91D, 0x8B2, 0x8B3, 0x8B4,
        0x8A9, 0x8AC, 0x904, 0x971, 0x973, 0x974, 0x924, 0x928, 0x929, 0x92A, 0x880, 0x8F1, 0x8F3, 0x8F5, 0xA6C,
        0x8F6, 0x8FC, 0x8FE, 0x910, 0x911, 0x913, 0x980, 0x981, 0x961, 0x964, 0x965, 0x966, 0x968, 0x962, 0x969,
        0x96A, 0xA8C, 0x88F, 0x8F0, 0x9B1, 0xA78, 0x90C, 0xA2E, 0x9C0, 0x9C1, 0x9C2, 0x908, 0x94F, 0x8BD, 0x8DD);
}

function applyKandorean(mapCode : MapCodeManager) 
{
    const kandorean = mapCode.get(MapCodeEntry.KANDOREAN_TEMPLE)!;
    kandorean.hasChanged = true;

    // Shorten the cutscene of picking up the Lash Pebble
    kandorean.data.writeBlock(0x23E8, patchKandoreanLashScene);

    // Skip the Whirlwind tutorial cutscenes with Kraden
    kandorean.data.writeHalfword(0x2336, 0xB002);   // add sp, #0x8
    kandorean.data.writeHalfword(0x2338, 0xBD00);   // pop {pc}
    kandorean.data.writeByte(0x6007, 0x12);         // <-- Inverts the flag condition for the ground trigger
}

function applyLemurianShip(mapCode : MapCodeManager)
{
    const interior = mapCode.get(MapCodeEntry.LEMURIAN_SHIP)!;
    const exterior = mapCode.get(MapCodeEntry.INDRA_SHORE)!;
    interior.hasChanged = true;
    exterior.hasChanged = true;

    // Change the flag condition for Piers stopping the player
    exterior.data.writeByte(0x242E, 0x8E);

    // Skip the ship activation cutscene
    interior.data.writeHalfword(0x169C, 0x2080);    // mov r0, #0x80
    interior.data.writeHalfword(0x169E, 0x0100);    // lsl r0, r0, #0x4
    interior.data.writeHalfword(0x16A0, 0x30DE);    // add r0, #0xDE
    interior.writeLinkedJump(0x16A2, 0x0200ABE0);
    interior.data.writeHalfword(0x16A6, 0xE0D1);    // b #0x0200984C

    // Update exit table
    interior.data.writeByte(0x3379, 0x70);
}

function applyMadra(mapCode : MapCodeManager)
{
    const exterior = mapCode.get(MapCodeEntry.MADRA)!;
    const interior = mapCode.get(MapCodeEntry.MADRA_BUILDINGS)!;
    exterior.hasChanged = true;
    interior.hasChanged = true;

    // Shorten the Laughing/Healing Fungus scenes
    interior.data.writeHalfword(0x102E, 0xE00D);    // b #0x0200904C
    interior.data.writeHalfword(0x1090, 0xE0B0);    // b #0x020091F4
    interior.data.writeHalfword(0x1202, 0xE002);    // b #0x0200920A
    interior.data.writeHalfword(0x1218, 0xE017);    // b #0x0200924A
    interior.data.writeHalfword(0x1252, 0x2019);    // mov r0, #0x19
    interior.data.writeHalfword(0x1258, 0xE010);    // b #0x0200927C
    interior.data.writeHalfword(0x1286, 0xE031);    // b #0x020092EC

    // Skip the Mayor's gift cutscene(s)
    exterior.data.writeBlock(0x19E8, patchMadraMayorsGiftScene);
    exterior.data.writeHalfword(0x7DC, 0xD122);     // bne #0x02008824
    exterior.data.writeHalfword(0x1D2C, 0xE02C);    // b #0x02009D88
    exterior.data.writeLongJump(0x1D88, 0x0200A98D, 0);
    interior.data.writeByte(0x315F, 0x19)           // <-- Inverts the flag condition for the interior scene
}

function applyGaroh(mapCode : MapCodeManager)
{
    const garoh = mapCode.get(MapCodeEntry.GAROH)!;
    garoh.hasChanged = true;

    // Shorten the Maha cutscene when receiving the Djinni
    garoh.data.writeHalfword(0x389C, 0x2248);       // mov r2, #0x48 
    garoh.data.writeHalfword(0x38A2, 0x0452);       // lsl r2, r2, #0x11
    garoh.data.writeHalfword(0x38B4, 0xE003);       // b #0x0200B8BE
    garoh.data.writeHalfword(0x38DC, 0xE026);       // b #0x0200B92C
    garoh.data.writeHalfword(0x3938, 0xE032);       // b #0x0200B9A0
    garoh.data.writeHalfword(0x39B0, 0x2020);       // mov r0, #0x20
    garoh.data.writeHalfword(0x39B2, 0x0300);       // lsl r0, r0, #0xC
    garoh.data.writeHalfword(0x39B4, 0x30CA);       // add r0, #0xCA
    garoh.data.writeHalfword(0x39B6, 0x0200);       // lsl r0, r0, #0x8
    garoh.data.writeHalfword(0x39B8, 0x30B3);       // add r0, #0xB3
    garoh.data.writeHalfword(0x39BA, 0x4700);       // bx r0
    garoh.data.writeHalfword(0x4B7A, 0xE118);       // b #0x0200CDAE
    garoh.data.writeHalfword(0x4DF6, 0xE180);       // b #0x0200D0FA
}

function applyAlhafra(mapCode : MapCodeManager)
{
    const exterior = mapCode.get(MapCodeEntry.ALHAFRA)!;
    const docks = mapCode.get(MapCodeEntry.EASTERN_ALHAFRA)!;
    const ship = mapCode.get(MapCodeEntry.ALHAFRAN_SHIP)!;
    exterior.hasChanged = true;
    docks.hasChanged = true;
    ship.hasChanged = true;

    // Shorten the cutscenes for the Large Bread sidequest
    exterior.data.writeHalfword(0x33A, 0xE009);     // b #0x02008350
    exterior.data.writeBlock(0x36C, patchAlhafraBreadBoySkip);
    exterior.data.writeBlock(0x690, patchAlhafraCaveGuardSkip);
    exterior.data.writeHalfword(0x74C, 0xBD60);     // pop {r5, r6, pc}

    // Skip the cutscene with the mayor after Bursting the rock
    docks.data.writeBlock(0x205C, patchAlhafraMayorDocksScene);
    docks.data.writeHalfword(0x2A0A, 0xBDE0);       // pop {r5-r7, pc}

    // Skip the Briggs pre- and post-battle cutscenes
    ship.data.writeBlock(0x4F4, patchBriggsBossScene);
    ship.data.writeHalfword(0x292, 0x00F5);         // lsl r5, r6, #0x3
    ship.data.writeHalfword(0x294, 0x46C0);         // nop
    ship.data.writeWord(0x32A4, 0x08038041);
}

function applyKibombo(mapCode : MapCodeManager)
{
    const kibombo = mapCode.get(MapCodeEntry.KIBOMBO)!;
    kibombo.hasChanged = true;

    // Shorten the cutscene where Piers joins the party
    kibombo.data.writeBlock(0x131A, patchKibomboPiersScene);

    // Skip the cutscene in the elder's house after clearing Gabomba Statue
    kibombo.data.writeBlock(0x4D04, patchKibomboElderScene);
}

function applyGabomba(mapCode : MapCodeManager)
{
    const statue = mapCode.get(MapCodeEntry.GABOMBA_STATUE)!;
    const statueCore = mapCode.get(MapCodeEntry.GABOMBA_ELEVATOR)!;
    const catacombs = mapCode.get(MapCodeEntry.GABOMBA_CATACOMBS)!;
    statue.hasChanged = true;
    statueCore.hasChanged = true;
    catacombs.hasChanged = true;

    // Shorten the puzzle cutscenes and consolidate exits
    statueCore.data.writeBlock(0x1766, patchGabombaPuzzleIntroScene);
    statue.data.writeHalfword(0xFEC, 0xE002);       // b #0x02008FF4
    statue.data.writeHalfword(0x5FA4, 0x3079);      // Exit table changes from here on out
    statue.data.writeHalfword(0x5FA8, 0x3079);
    statue.data.writeHalfword(0x5FAC, 0x3079);
    statue.data.writeHalfword(0x5FB0, 0x6078);

    // Skip the cutscene of the elevator door being revealed
    statueCore.data.writeBlock(0x194, patchGabombaPostPuzzleScene);
    statueCore.data.writeHalfword(0x882, 0xE0D7);   // b #0x02008A34

    // Remove Akafubu from the NPC table for the Black Crystal cutscene
    statueCore.data.writeHalfword(0x2222, 0x0);
    statueCore.data.writeByte(0x222A, 0x0);

    // Shorten the Tomegathericon cutscene
    catacombs.data.writeHalfword(0xA02, 0xE036);    // b #0x02008A72
    catacombs.data.writeHalfword(0xA96, 0xE001);    // b #0x02008A9C
    catacombs.data.writeHalfword(0xAF8, 0xE124);    // b #0x02008D44
    catacombs.data.writeHalfword(0xD4E, 0xE00B);    // b #0x02008D68
    catacombs.data.writeHalfword(0xD68, 0x2014);    // mov r0, #0x14
}

function applyEasternSeaIsles(mapCode : MapCodeManager)
{
    const isles = mapCode.get(MapCodeEntry.EASTERN_SEA_SETTLEMENTS)!;
    isles.hasChanged = true;

    // Shorten the penguin trading sidequest scene
    isles.data.writeHalfword(0x1E0C, 0xE05C);       // b #0x02009EC8
    isles.data.writeHalfword(0x1F02, 0xE000);       // b #0x02009F06
    isles.data.writeHalfword(0x1F10, 0xE000);       // b #0x02009F14
    isles.data.writeHalfword(0x1F28, 0xE000);       // b #0x02009F2C

    // Shorten the bird trading sidequest scene
    isles.data.writeHalfword(0x5E0, 0xE033);        // b #0x0200864A
    isles.data.writeHalfword(0x69C, 0xE000);        // b #0x020086A0

    // Shorten the cow trading sidequest scene
    isles.data.writeHalfword(0x728, 0xD000);        // beq #0x0200872C
    isles.data.writeHalfword(0x72C, 0xE014);        // b #0x02008758
    isles.data.writeHalfword(0x760, 0x6838);        // ldr r0, [r7, #0x0]
    isles.writeLinkedJump(0x762, 0x0200BE84);
    isles.data.writeHalfword(0x766, 0x4680);        // mov r8, r0
    isles.data.writeHalfword(0x768, 0xE0A4);        // b #0x020088B4
    isles.data.writeHalfword(0x8F0, 0xE015);        // b #0x0200891E

    // Shorten the dog trading sidequest scene
    isles.data.writeHalfword(0xE74, 0xE165);        // b #0x02009142
    isles.data.writeHalfword(0x1150, 0xE01B);       // b #0x0200918A
    isles.data.writeHalfword(0x1192, 0xE000);       // b #0x02009196

    // Shorten the turtle trading sidequest scene
    isles.data.writeHalfword(0x12AA, 0x20C8);       // mov r0, #0xC8
    isles.data.writeHalfword(0x12AC, 0x30FF);       // add r0, #0xFF
    isles.writeLinkedJump(0x12AE, 0x0200BE54);
    isles.data.writeHalfword(0x12B2, 0xE0E7);       // b #0x02009484
    isles.data.writeHalfword(0x14B6, 0x1C00);       // nop
    isles.data.writeHalfword(0x150A, 0x2014);       // mov r0, #0x14
    isles.writeLinkedJump(0x150C, 0x0200BE5C);
    isles.data.writeHalfword(0x1510, 0xE18D);       // b #0x0200982E 
    isles.data.writeHalfword(0x18BC, 0xE0A2);       // b #0x02009A04 
    isles.data.writeHalfword(0x1A0C, 0xE000);       // b #0x02009A10
    isles.data.writeHalfword(0x1AA2, 0xE07A);       // b #0x02009B9A 
    isles.data.writeHalfword(0x1BA2, 0xE000);       // b #0x02009BA6 

    // Skip the cutscene of traveling to/from Islet Cave
    isles.data.writeBlock(0x2848, patchIsletCaveFrom);
    isles.data.writeHalfword(0x28B4, 0xE06A);       // b #0x0200A98C
    isles.data.writeBlock(0x29D4, patchIsletCaveTo);
    isles.data.writeHalfword(0x2A4C, 0xE070);       // b #0x0200AB30
}

function applyAquaRock(mapCode : MapCodeManager)
{
    const apojii = mapCode.get(MapCodeEntry.APOJII_ISLANDS)!;
    const aquaRock = mapCode.get(MapCodeEntry.AQUA_ROCK_EXTERIOR)!;
    apojii.hasChanged = true;
    aquaRock.hasChanged = true;

    // Shorten the Aqua Rock opening cutscene in Apojii
    apojii.data.writeHalfword(0x9AA, 0xE03E);       // b #0x02008A2A
    apojii.data.writeWord(0x2198, 0x04D0509E);      // <-- Update exit table entry
    aquaRock.data.writeHalfword(0x16AA, 0xE087);    // b #0x020097BC
}

function applyIzumo(mapCode : MapCodeManager)
{
    const interior = mapCode.get(MapCodeEntry.IZUMO_BUILDINGS)!;
    interior.hasChanged = true;

    // Shorten the scene of giving the Dancing Idol to Uzume
    interior.data.writeHalfword(0x1E0A, 0xE03A);    // b #0x02009E82
    interior.data.writeHalfword(0x1EF4, 0xE050);    // b #0x02009F98
    interior.data.writeHalfword(0x1FBA, 0xE014);    // b #0x02009FE6
}

function applyGaiaRock(mapCode : MapCodeManager)
{
    const exterior = mapCode.get(MapCodeEntry.GAIA_ROCK_EXTERIOR)!;
    const interior = mapCode.get(MapCodeEntry.GAIA_ROCK_INTERIOR)!;
    exterior.hasChanged = true;
    interior.hasChanged = true;

    // Skip the exterior Susa cutscene
    exterior.data.writeHalfword(0x38C, 0xE00F);     // b #0x020083AE
    exterior.data.writeHalfword(0x8FA, 0xE017);     // b #0x0200892C

    // Shorten the interior Susa/Serpent scenes
    interior.data.writeHalfword(0x31A2, 0xE006);    // b #0x0200B1B2
    interior.data.writeBlock(0x3770, patchGaiaRockSerpentScene);
    interior.data.writeHalfword(0x373C, 0x2104);    // mov r1, #0x4
    interior.data.writeHalfword(0x5F4F, 0x4919);    // ldr r1, #0x0200DFB4 (= #0x40008B85)
}

function applyChampa(mapCode : MapCodeManager)
{
    const cave = mapCode.get(MapCodeEntry.CHAMPA_CAVE)!;
    cave.hasChanged = true;

    // Shorten the scenes where the prongs are given to Obaba
    cave.data.writeBlock(0x828, patchChampaProng1);
    cave.data.writeBlock(0x992, patchChampaProng2);
    cave.data.writeHalfword(0xAC0, 0xE014);         // b #0x02008AEC
    cave.data.writeBlock(0xAFE, patchChampaProng3);
    cave.data.writeHalfword(0xE90, 0xE001);         // b #0x02008E96
    cave.data.writeHalfword(0xED6, 0xE023);         // b #0x02008F20

    // Shorten the Avimander pre- and post-battle cutscenes
    cave.data.writeBlock(0x1188, patchChampaPreAvimanderScene);
    cave.data.writeBlock(0x1896, patchChampaPostAvimanderScene);
    cave.data.writeWord(0x3590, 0x08038041);        // <-- Replacing function list entry
}

function applyContigo(mapCode : MapCodeManager)
{
    const contigo = mapCode.get(MapCodeEntry.CONTIGO)!;
    contigo.hasChanged = true;

    // Skip the Reunion cutscene
    contigo.data.writeBlock(0x1D6A, patchContigoReunion);
}

function applyShamanVillage(mapCode : MapCodeManager)
{
    const village = mapCode.get(MapCodeEntry.SHAMAN_VILLAGE)!;
    const trialRoad = mapCode.get(MapCodeEntry.TRIAL_ROAD)!;
    village.hasChanged = true;
    trialRoad.hasChanged = true;

    // Shorten the Shaman Rod scene in the village
    village.data.writeHalfword(0x209C, 0xE01A);     // b #0x0200A0D4
    village.data.writeHalfword(0x20EC, 0xE272);     // b #0x0200A5D4
    village.data.writeBlock(0x261C, patchShamanVillageRodScene);

    // Skip the Whirlwind Stone scene before Trial Road
    village.writeLinkedJump(0x30E6, 0x0200BB24);
    village.writeLinkedJump(0x30EA, 0x0200C8CC);
    village.data.writeHalfword(0x30EE, 0xBDE0);     // pop {r5-r7, pc}
    village.data.writeHalfword(0x3B28, 0x2004);     // mov r0, #0x4
    village.data.writeHalfword(0x3B38, 0x2004);     // mov r0, #0x4
    village.data.writeHalfword(0x3B4A, 0x2004);     // mov r0, #0x4
    village.data.writeHalfword(0x3B62, 0x2004);     // mov r0, #0x4
    village.data.writeHalfword(0x4070, 0xD03D);     // beq #0x0200C0EE

    // Skip the various Trial Road cutscenes
    trialRoad.data.writeHalfword(0x17E2, 0xE021);   // b #0x02009828
    trialRoad.data.writeHalfword(0x184A, 0x1C00);   // nop
    trialRoad.data.writeHalfword(0x3576, 0xE098);   // b #0x0200B6AA
    trialRoad.data.writeHalfword(0x36B8, 0xE07D);   // b #0x0200B7B6
}

function applyJupiterLighthouse(mapCode : MapCodeManager)
{
    const aerie = mapCode.get(MapCodeEntry.JUPITER_LIGHTHOUSE_AERIE)!;
    aerie.hasChanged = true;

    // Skip Agatio & Karst pre- and post-battle cutscenes
    aerie.data.writeBlock(0x65C, patchJupiterLighthouseAerie);
}

function applyLoho(mapCode : MapCodeManager)
{
    const loho = mapCode.get(MapCodeEntry.LOHO)!;
    loho.hasChanged = true;

    // Skip the scene after firing the cannon
    loho.data.writeBlock(0x4D8, patchLohoCannonScene);
}

function applyNorthernReaches(mapCode : MapCodeManager)
{
    const reaches = mapCode.get(MapCodeEntry.NORTHERN_REACHES)!;
    reaches.hasChanged = true;

    // Shorten the scene of firing the cannon at the ice wall
    reaches.data.writeHalfword(0x23C, 0xE084);      // b #0x02008348
    reaches.data.writeHalfword(0x48A, 0xE091);      // b #0x020085B0
}

function applyMarsLighthouse(mapCode : MapCodeManager)
{
    const basement = mapCode.get(MapCodeEntry.MARS_LIGHTHOUSE_BASEMENT)!;
    const aerie = mapCode.get(MapCodeEntry.MARS_LIGHTHOUSE_AERIE)!;
    basement.hasChanged = true;
    aerie.hasChanged = true;

    // Shorten the Flame Dragons post-battle cutscene
    basement.data.writeHalfword(0x8BC, 0xE0C9);
    basement.data.writeHalfword(0xA58, 0xE00A);

    // Skip the Doom Dragon pre- and post-battle cutscenes
    aerie.data.writeBlock(0x682, patchMarsLighthouseAerie);
    aerie.data.writeWord(0x57A8, 0x080C85F9);       // <-- Replace function table entry
}