/**
 * Assembler for PUSH and POP instructions.
 */

import { getRange } from "../assembler";
import { GuardBuilder } from "../guards";
import type { Register } from "../tokens";
import type { AssemblyErrors, ParseLineResult } from "../types";

export function assemble(parse : ParseLineResult, errors : AssemblyErrors, isPop : boolean) : number[] {
    const range = getRange(parse.params[0]);

    const guard = new GuardBuilder(parse, [isPop ? 'POP' : 'PUSH', '{Rlist}'])
        .requireRangeSubset(0, range, [0, 1, 2, 3, 4, 5, 6, 7, isPop ? 15 : 14]);        
    if (!guard.getResult(errors)) return [];

    let rangeFlat = 0;
    range.forEach((r : Register) => rangeFlat += (1 << r));

    return [rangeFlat & 0xFF, 0xB4 + (isPop ? 0x8 : 0) + (rangeFlat > 255 ? 0x1 : 0)];
}