import type { RomData } from "../rom";
import { readFileSync } from "node:fs";
import asmExports from "../../assembly/out/exports.json";
import { END } from "../data/text/control_characters";

const patchCustomRetreatHandler = readFileSync('./src/assembly/out/retreat_teleport/custom_retreat_handler.bin');
const patchUpdateShipPosition = readFileSync('./src/assembly/out/retreat_teleport/update_ship_position.bin');
const patchManualRetreatGlitch = readFileSync('./src/assembly/out/retreat_teleport/manual_rg.bin');

/** Mapping from map IDs to overworld coordinates for the ship. */
const shipPositions : [number[], number, number][] = [
    [[0x0, 0x1, 0x47], 0x2783, 0x2080],
    [[0x6, 0x3C], 0x295F, 0x239F],
    [[0x9, 0xA, 0xB], 0x2FC2, 0x2AFA],
    [[0xD], 0x2B2B, 0x2465],
    [[0x10, 0x45], 0x2442, 0x23CA],
    [[0x13], 0x24AA, 0x1ED8],
    [[0x14], 0x254E, 0x20D9],
    [[0x15], 0x3208, 0x2DC7],
    [[0x16], 0x2DB5, 0x1FDA],
    [[0x17], 0x2D53, 0x1AB9],
    [[0x18], 0x3431, 0x1D2E],
    [[0x19, 0x48], 0x3250, 0x267F],
    [[0x1B], 0x3841, 0x209C],
    [[0x1C], 0x383F, 0x2233],
    [[0x1D, 0x1E], 0x3401, 0x1782],
    [[0x1F], 0x2A88, 0x18E7],
    [[0x20], 0x2BC5, 0x187B],
    [[0x23], 0x3312, 0x0498],
    [[0x25], 0x2F97, 0x2DB8],
    [[0x26], 0x187F, 0x2737],
    [[0x27, 0x2A], 0x2168, 0x2247],
    [[0x28], 0x188B, 0x18AB],
    [[0x29], 0x228E, 0x126F],
    [[0x2B, 0x2C, 0x3B], 0x1C67, 0x204D],
    [[0x2D], 0x1C5E, 0x162E],
    [[0x2F], 0x1CD8, 0x1692],
    [[0x30], 0x227E, 0x1745],
    [[0x31], 0x230F, 0x0607],
    [[0x33], 0x2FC2, 0x2AFA],
    [[0x34], 0x295F, 0x239F],
    [[0x37], 0x3157, 0x117A],
    [[0x38], 0x1F38, 0x2398],
    [[0x39], 0x23A8, 0x1554],
    [[0x3A], 0x29D5, 0x20D6],
    [[0x46], 0x2A40, 0x24A1]
];

/**
 * Changes Retreat to act like Teleport when used on the overworld.
 * @param rom The ROM instance to apply this patch to
 */
export function applyWorldMapRetreat(rom : RomData) 
{
    const functionHandleRetreat = asmExports["retreat_teleport\\custom_retreat_handler.bin"].inject_handleRetreat;
    const functionFixEntrances = asmExports["retreat_teleport\\custom_retreat_handler.bin"].inject_fixTeleportEntrances;

    // Apply the binary patch
    rom.writeBlock(0xF4000, patchCustomRetreatHandler);

    // Inject jumps
    rom.writeLongJump(0xFDE3A, functionHandleRetreat + 1, 3);
    rom.writeLongJump(0xCBCF0, functionFixEntrances + 1);
}

/**
 * Adds most minor overworld locations as valid Teleport destinations.
 * @param rom The ROM instance to apply this patch to
 */
export function applyTeleportEverywhere(rom : RomData) 
{
    const dataAddressPtr = asmExports["retreat_teleport\\custom_retreat_handler.bin"].data_sancWarpShipPositions;
    const importAddress = asmExports["retreat_teleport\\update_ship_position.bin"].import_sancWarpShipPositions;

    // Write snippet for updating the ship location when Teleporting to new locations
    rom.writeBlock(0xCA394, patchUpdateShipPosition);
    rom.writeWord(importAddress - 0x08000000, dataAddressPtr);

    // Update map display function
    rom.writeHalfword(0xED2D8, 0x2600);

    // Insert the updated ship Teleport location table
    let addr = dataAddressPtr;
    shipPositions.forEach(line => {
        line[0].forEach(map => {
            rom.writeHalfword(addr, map);
            rom.writeHalfword(addr + 2, line[1]);
            rom.writeHalfword(addr + 4, line[2]);
            addr += 6;
        });
    });
    rom.writeHalfword(addr, 0xFFFF);

    // Apply required map data changes
    rom.mapData.applyTeleportEverywhereChanges();
}

/**
 * Allows manually entering the Retreat glitch state by holding Select while saying "Yes" to using Retreat.
 * @param rom The ROM instance to apply this patch to
 */
export function applyManualRetreatGlitch(rom : RomData)
{
    rom.writeBlock(0xFFC000, patchManualRetreatGlitch);

    // Pre-emptively copy the door number when using Retreat as well as the map number
    rom.writeHalfword(0xCE7C0, 0x681A);     // ldr r2, [r3, #0x0]
    rom.writeHalfword(0xCE7C8, 0x601A);     // str r2, [r3, #0x0]

    // Jump to custom handler
    rom.writeLongJump(0xCE7CA, 0x08FFC001, 0);

    // Add text entry
    rom.text.set(0xD66, `Retreat glitch activated.${END}`);
}