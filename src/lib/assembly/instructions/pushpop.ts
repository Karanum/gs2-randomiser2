/**
 * Assembler for PUSH and POP instructions.
 */

import { getRange, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import type { ParseLineResult } from "../parser";

export function assemble(parse : ParseLineResult, errors : AssemblyErrors, isPop : boolean) : number[] {
    const range = getRange(parse.params[0]);

    const guard = new GuardBuilder(parse.lineNumber, [isPop ? 'POP' : 'PUSH', '{Rlist}'])
        .requireRangeSubset(0, range, [0, 1, 2, 3, 4, 5, 6, 7, isPop ? 15 : 14]);        
    if (!guard.getResult(errors)) return [];

    let rangeFlat = 0;
    range.forEach(r => rangeFlat += (1 << r));

    return [rangeFlat & 0xFF, 0xB4 + (isPop ? 0x8 : 0) + (rangeFlat > 255 ? 0x1 : 0)];
}