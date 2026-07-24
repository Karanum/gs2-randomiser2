import { EventType, MapCodeEntry } from "../data/map_code/enums";
import { BOX, END, LINE } from "../data/text/control_characters";
import type { RomData } from "../rom";
import { getAssemblyExport, getAssemblyScript } from "../script_util";
import { Setting } from "../settings/enums";
import type { SettingsObject } from "../settings/settings";

const patchDjinniQueue = getAssemblyScript('character_shuffle/djinn_queue');
const patchIdejimaNewGame = getAssemblyScript('character_shuffle/idejima_setup');
const patchIdejimaShowShebaItem = getAssemblyScript('character_shuffle/idejima_show_sheba_item');
const patchIdejimaGiveShebaItem = getAssemblyScript('character_shuffle/idejima_give_sheba_item');
const patchKibomboStopPiersLeaving = getAssemblyScript('character_shuffle/kibombo_stop_piers_leaving');
const patchKibomboShowPiersItem = getAssemblyScript('character_shuffle/kibombo_show_piers_item');
const patchKibomboGivePiersItem = getAssemblyScript('character_shuffle/kibombo_give_piers_item');
const patchContigoShowItem = getAssemblyScript('character_shuffle/contigo_show_item');
const patchContigoGiveItem = getAssemblyScript('character_shuffle/contigo_give_item');

const exportShowShebaItem = getAssemblyExport('character_shuffle/idejima_show_sheba_item', 'inject_objectId') - 0x02008000;
const exportGiveShebaItem = getAssemblyExport('character_shuffle/idejima_give_sheba_item', 'inject_objectId') - 0x02008000;


export function applyCharacterShufflePatch(rom : RomData, settings : SettingsObject)
{
    const worldMap = rom.mapCode.get(MapCodeEntry.WORLD_MAP)!;
    const idejima = rom.mapCode.get(MapCodeEntry.IDEJIMA)!;
    const kibombo = rom.mapCode.get(MapCodeEntry.KIBOMBO)!;
    const contigo = rom.mapCode.get(MapCodeEntry.CONTIGO)!;
    worldMap.hasChanged = true;
    idejima.hasChanged = true;
    kibombo.hasChanged = true;
    contigo.hasChanged = true;

    // Register new icons for the character items
    rom.abilityIcons.registerCharacterIcons();

    // Replace default Djinn overflow assignment with a queue-based system
    rom.writeBlock(0x01006D00, patchDjinniQueue);

    // Update party member initialisation to pull from the Djinni queue
    rom.writeHalfword(0x01000806, 0xE004);
    rom.writeHalfword(0x01000818, 0xE004);

    // Update Idejima map code with different New Game handling
    idejima.data.writeBlock(0x2FD4, patchIdejimaNewGame);
    idejima.data.writeHalfword(0x2F50, 0x2302);         // mov r3, #0x2
    idejima.data.writeHalfword(0x2F80, 0x0009);         // nop

    // Prevent Piers from leaving the party in Kibombo
    kibombo.data.writeHalfword(0x7AE, 0xE007);          // b #0x020087C0
    kibombo.data.writeBlock(0xC90, patchKibomboStopPiersLeaving);
    kibombo.data.writeHalfword(0x5256, 0xE008);         // b #0x0200D26A

    // Update Idejima map code to replace Jenna and Sheba with items
    const eventId = 10 + settings[Setting.ENABLE_AVOID_TOGGLE] + settings[Setting.ENABLE_HINTS];
    const npcAddr = 0x3874 + 0x18 * (eventId - 10);
    const eventAddr = 0x394C + 0x18 * (eventId - 10);
    idejima.data.expandAt(eventAddr, 0xC);
    idejima.setItemDisplayNpcEntry(npcAddr, 0xD06, 0x38, 0, 0x2C0);
    idejima.setEventEntry(eventAddr, EventType.NPC, 0, 0, eventId, 0xD06, 0x020082B5);

    idejima.writeLinkedJump(0x2ECA, 0x020080F0);
    idejima.data.writeBlock(0xF0, patchIdejimaShowShebaItem);
    idejima.data.writeBlock(0x2B4, patchIdejimaGiveShebaItem);
    idejima.data.writeByte(exportShowShebaItem, eventId);
    idejima.data.writeByte(exportGiveShebaItem, eventId);

    // Update Kibombo map code to replace Piers with an item
    kibombo.setItemDisplayNpcEntry(0x6C48, 0xD07, 0x80, 0, 0x170);
    kibombo.setEventEntry(0x7590, EventType.NPC, 0, 0, 0x1A, 0xD07, 0x02009319);

    kibombo.data.writeBlock(0x7C8, patchKibomboShowPiersItem);
    kibombo.data.writeBlock(0x1318, patchKibomboGivePiersItem);
    kibombo.data.writeHalfword(0x2050, 0x4770);         // bx lr
    kibombo.data.writeHalfword(0x3DEE, 0xE15C);         // b #0x0200C0AA
    kibombo.writeLinkedJump(0x55DE, 0x020087C8);

    // Update Contigo map code to replace Isaac's party with items
    contigo.setItemDisplayNpcEntry(0x5228, 0xD00, 0x78, 0, 0x160);
    contigo.setItemDisplayNpcEntry(0x5240, 0xD01, 0x90, 0, 0x160);
    contigo.setItemDisplayNpcEntry(0x5258, 0xD02, 0xA8, 0, 0x160);
    contigo.setItemDisplayNpcEntry(0x5270, 0xD03, 0xC0, 0, 0x160);
    contigo.setFinalNpcEntry(0x5288);
    contigo.setEventEntry(0x5E7C, EventType.NPC, 0, 0, 8, 0xD00, 0x02009D98);
    contigo.setEventEntry(0x5E88, EventType.NPC, 0, 0, 9, 0xD01, 0x02009D98);
    contigo.setEventEntry(0x5E94, EventType.NPC, 0, 0, 10, 0xD02, 0x02009D98);
    contigo.setEventEntry(0x5EA0, EventType.NPC, 0, 0, 11, 0xD03, 0x02009D98);

    contigo.data.writeHalfword(0x802, 0xE014);          // b #0x0200882E
    contigo.data.writeHalfword(0x1D50, 0x4770);         // bx lr
    contigo.data.writeBlock(0x1D54, patchContigoShowItem);
    contigo.data.writeBlock(0x1D98, patchContigoGiveItem);
    contigo.data.writeHalfword(0x374C, 0xE01A);         // b #0x0200B784
    contigo.writeLinkedJump(0x39F4, 0x02009D54);
    contigo.data.writeHalfword(0x39F8, 0xE042);         // b #0x0200BA80

    rom.text.set(0x2B5E, `The item is held in place${LINE}by a strange force.${BOX}`
                       + `Maybe igniting Jupiter Lighthouse${LINE}will make something happen?${END}`);

    // Update overworld map code to allow entering Atteka Inlet without watching the reunion cutscene
    worldMap.data.writeHalfword(0x996, 0xE109);         // b #0x02008BAC
}