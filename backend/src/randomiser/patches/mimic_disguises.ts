import type { PRNG } from "$lib/prng";
import { ItemID, PseudoItem } from "../data/items/enums";
import { BOX, END, LINE, Var } from "../data/text/control_characters";
import type { RomData } from "../rom";
import { getAssemblyExport, getAssemblyScript } from "../script_util";

const patchMimicDisguises = getAssemblyScript('mimic_disguise');
const exportMimicDisguises = getAssemblyExport('mimic_disguise', 'data_disguiseList') - 0x08000000;

/** List of all valid Mimic disguises, minus characters. */
const disguiseList : number[] = [
    ItemID.SOL_BLADE, ItemID.SHAMANS_ROD, ItemID.RED_KEY, ItemID.BLUE_KEY, ItemID.DANCING_IDOL, ItemID.PRETTY_STONE,
    ItemID.RED_CLOTH, ItemID.MILK, ItemID.LIL_TURTLE, ItemID.AQUARIUS_STONE, ItemID.RUIN_KEY, ItemID.MAGMA_BALL,

    PseudoItem.PSY_GROWTH, PseudoItem.PSY_FROST, PseudoItem.PSY_DOUSE, PseudoItem.PSY_WHIRLWIND, PseudoItem.PSY_LASH,
    PseudoItem.PSY_POUND, PseudoItem.PSY_SCOOP, PseudoItem.PSY_CYCLONE, PseudoItem.PSY_PARCH, PseudoItem.PSY_SAND,
    PseudoItem.PSY_MIND_READ, PseudoItem.PSY_REVEAL, PseudoItem.PSY_BURST, PseudoItem.PSY_GRIND, PseudoItem.PSY_HOVER,
    PseudoItem.PSY_BLAZE, PseudoItem.PSY_TELEPORT, PseudoItem.SUMMON_ECLIPSE, PseudoItem.SUMMON_IRIS
];

/** List of all valid Mimic disguises, characters included. */
const disguiseListCharacterShuffle = disguiseList.concat([
    PseudoItem.PC_ISAAC, PseudoItem.PC_GARET, PseudoItem.PC_IVAN, PseudoItem.PC_MIA, 
    PseudoItem.PC_JENNA, PseudoItem.PC_SHEBA, PseudoItem.PC_PIERS
]);

/**
 * Makes it so that Mimics will randomly disguise themselves as other important items.
 * @param rom The `RomData` instance of the currently generating seed
 * @param prng The `PRNG` instance of the currently generating seed
 * @param isCharacterShuffle Whether the current seed has character shuffle enabled
 * @param isMultiworld Whether the current seed is an Archipelago multiworld with more than 1 player
 */
export function applyMimicDisguisePatch(rom : RomData, prng : PRNG, isCharacterShuffle : boolean, isMultiworld : boolean)
{
    // Add new text lines for Mimic interactions
    rom.text.set(3525, `${Var.LEADER} checked on the ground...${BOX}`);
    rom.text.set(3610, `The item suddenly${LINE}lunges forward!${END}`);

    // Make a mutable-safe copy of the array of valid disguises
    const validDisguiseList = (isCharacterShuffle && !isMultiworld) 
        ? [...disguiseListCharacterShuffle]
        : [...disguiseList];

    // Determine a disguise for each Mimic item location
    const disguises : number[] = [];
    for (let i = 0; i < 9; ++i) {
        if (isMultiworld && prng.randomFraction() > 0.33) {
            disguises.push(PseudoItem.AP_KEY_ITEM);
        } else {
            disguises.push(prng.randomArrayElement(validDisguiseList, true));
        }
    }

    // Replace Mimic chest sprites with their disguises
    rom.writeHalfword(0xCECBA, 0x20EA);         // mov r0, #0xEA
    rom.writeHalfword(0xCEDF2, 0x4648);         // mov r0, r9
    rom.writeHalfword(0xCEDF4, 0x9900);         // ldr r1, [sp, #0x0]
    rom.writeLongJump(0xCEDF6, 0x09000081);
    rom.writeBlock(0x1000080, patchMimicDisguises);

    for (let i = 0; i < 9; ++i) {
        rom.writeHalfword(exportMimicDisguises + 2 * i, disguises[i]);
    }

    // Cancel part of the Mimic interaction where its sprite changes
    rom.writeHalfword(0xCEFAA, 0xBD20);         // pop {r5, pc}
}