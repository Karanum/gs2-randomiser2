import { EventType, MapCodeEntry } from "../data/map_code/enums";
import { MapCodeManager } from "../data/map_code/manager";
import type { TextManager } from "../data/text/manager";
import { END_PERSIST, LINE, Var } from "../data/text/control_characters";
import { getAssemblyScript } from "../script_util";
import { EventBuilder } from "../data/map_code/model";

const patchPositionKraden = getAssemblyScript('gabomba_puzzle/position_kraden');
const patchSolutionCheck = getAssemblyScript('gabomba_puzzle/solution_check');

const eventKraden = new EventBuilder().asNpc(0x17, 0x0200D261).setFlag(0x8FD).build();

/**
 * Changes the final puzzle in Gabomba Statue by removing the automatic timer
 * and instead adding Kraden as an NPC to manually check the solution.
 * @param mapCode The `MapCodeManager` instance to apply this patch to
 * @param text The `TextManager` instance to apply this patch to
 */
export function applyGabombaPuzzlePatch(mapCode : MapCodeManager, text : TextManager)
{
    const mapCodeGabomba = mapCode.get(MapCodeEntry.GABOMBA_STATUE)!;

    // Remove the default puzzle timer
    mapCodeGabomba.data.writeHalfword(0x3388, 0xBD00)   // pop {pc}
    mapCodeGabomba.data.writeHalfword(0x382A, 0xE00E)   // b #0x0200B84A
    mapCodeGabomba.data.writeHalfword(0x525E, 0xBD00)   // pop {pc}

    // Add code for the custom handler
    mapCodeGabomba.data.writeBlock(0x377E, patchPositionKraden);
    mapCodeGabomba.data.writeBlock(0x5260, patchSolutionCheck);

    // Update the event table and add a text entry
    mapCodeGabomba.data.writeBlock(0x6DF4, eventKraden);
    text.set(0x140, `Are you finished with${LINE}the puzzle, ${Var.LEADER}?${END_PERSIST}`);
}