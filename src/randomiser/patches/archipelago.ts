import { BOX, END, LINE, Var } from "../data/text/control_characters";
import type { RomData } from "../rom";
import { getAssemblyExport, getAssemblyScript } from "../script_util";

const patchSendItem = getAssemblyScript('archipelago/send_multiworld_item');
const patchReceiveItem = getAssemblyScript('archipelago/receive_multiworld_item');

const exportMainLoop19 = getAssemblyExport('archipelago/receive_multiworld_item', 'func_mainLoopScript_x19');
const exportMainLoop1F = getAssemblyExport('archipelago/receive_multiworld_item', 'func_mainLoopScript_x1F');

/**
 * Applies edits to the game code for Archipelago support.
 * @param rom The `RomData` instance to apply this patch to
 */
export function applyArchipelagoPatches(rom : RomData)
{
    rom.abilityIcons.registerArchipelagoIcons();

    // Set custom text
    rom.text.set(0xE38, `An item appears${LINE}before you!${END}`);
    rom.text.set(0x16A0, `${Var.CHAR_NAME} found an${LINE}Archipelago token!${BOX}The token disappears...${END}`);

    // Add custom functions for picking up and receiving multiworld items
    rom.writeBlock(0x010061F0, patchSendItem);
    rom.writeBlock(0x01006300, patchReceiveItem);

    // Redirect relevant main loop scripts to the function for receiving items
    rom.writeWord(0x2F268, exportMainLoop19);
    rom.writeWord(0x2F280, exportMainLoop1F);
}