/**
 * Assembler for all instructions under group THUMB.15 (Multiple load/store)
 */

import { getRange, getRegister } from "../assembler";
import { GuardBuilder } from "../guards";
import type { Register } from "../tokens";
import type { AssemblyErrors, ParseLineResult } from "../types";

const instructions : Record<string, number> = {
    'STMIA': 0, 'LDMIA': 1
};

export function assemble(parse : ParseLineResult, errors : AssemblyErrors, instr : string) : number[] {
    const rb = getRegister(parse.params[0]);
    const range = getRange(parse.params[1]);
    const op = instructions[instr] ?? 0;

    const guard = new GuardBuilder(parse, [instr, 'Rb!', '{Rlist}'])
        .requireRegisterLower(0, rb)
        .requireRangeSubset(1, range, [0, 1, 2, 3, 4, 5, 6, 7]);        
    if (!guard.getResult(errors)) return [];

    let rangeFlat = 0;
    range.forEach((r : Register) => rangeFlat += (1 << r));

    return [rangeFlat, 0xC0 + (op << 3) + rb];
}