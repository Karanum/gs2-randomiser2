import { BOX, END, LINE, Var } from "../data/text/control_characters";
import asmExports from "../../assembly/out/exports.json";
import type { RomData } from "../rom";
import { readFileSync } from "node:fs";

const patchSendItem = readFileSync('./src/assembly/out/archipelago/send_multiworld_item.bin');
const patchReceiveItem = readFileSync('./src/assembly/out/archipelago/receive_multiworld_item.bin');

const exports = asmExports['archipelago\\receive_multiworld_item.bin'];

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
    rom.writeWord(0x2F268, exports.func_mainLoopScript_x19);
    rom.writeWord(0x2F280, exports.func_mainLoopScript_x1F);
}