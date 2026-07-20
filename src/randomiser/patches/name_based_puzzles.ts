import type { PRNG } from "$lib/prng";
import { MapCodeEntry } from "../data/map_code/enums";
import type { MapCodeManager } from "../data/map_code/manager";

/**
 * Makes name-based puzzles random based on the seed instead.
 * @param mapCode The `MapCodeManager` instance of the currently generating seed
 * @param prng The `PRNG` instance of the currently generating seed
 */
export function applyRandomNamePuzzles(mapCode : MapCodeManager, prng : PRNG)
{
    const hash = prng.randomInt(0xFFFF);
    applyGabomba(mapCode, hash);
    applyGaiaRock(mapCode, hash);
    applyTrialRoad(mapCode, hash);
}

/**
 * Makes name-based puzzles fixed based on the name "Felix".
 * @param mapCode The `MapCodeManager` instance of the currently generating seed
 */
export function applyFixedNamePuzzles(mapCode : MapCodeManager)
{
    applyGabomba(mapCode, 8);
    applyGaiaRock(mapCode, 0x1F8);
    applyTrialRoad(mapCode, 0x1F8);
}

/**
 * Sets a fixed 4-bit name hash for Gabomba Statue.
 */
function applyGabomba(mapCode : MapCodeManager, hash : number)
{
    const gabomba = mapCode.get(MapCodeEntry.GABOMBA_STATUE)!;
    gabomba.hasChanged = true;
    gabomba.data.writeHalfword(0x3606, 0x2000 + (hash & 0xF));  // mov r0, <hash>
    gabomba.data.writeHalfword(0x3608, 0xBD00);                 // pop {pc}
}

/**
 * Sets a fixed 16-bit name hash for Gaia Rock.
 */
function applyGaiaRock(mapCode : MapCodeManager, hash : number)
{
    const gaiaRock = mapCode.get(MapCodeEntry.GAIA_ROCK_INTERIOR)!;
    gaiaRock.hasChanged = true;
    gaiaRock.data.writeHalfword(0x42AE, 0x4801);            // ldr r0, [pc, #0x6]
    gaiaRock.data.writeHalfword(0x42B0, 0xE00B);            // b #0x0200C2CA
    gaiaRock.data.writeWord(0x42B4, hash & 0xFFFF);
}

/**
 * Sets a fixed 16-bit name hash for Trial Road.
 */
function applyTrialRoad(mapCode : MapCodeManager, hash : number)
{
    const trialRoad = mapCode.get(MapCodeEntry.TRIAL_ROAD)!;
    trialRoad.hasChanged = true;
    trialRoad.data.writeHalfword(0x2492, 0x4801);           // ldr r0, [pc, #0x6]
    trialRoad.data.writeHalfword(0x2494, 0xE007);           // b #0x0200A4A6
    trialRoad.data.writeWord(0x2498, hash & 0xFFFF);
}