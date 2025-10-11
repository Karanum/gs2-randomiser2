/**
 * Assembler for CPY instructions.
 */

import { getRegister, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import type { ParseLineResult } from "../parser";

export function assemble(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);

    const guard = new GuardBuilder(parse.lineNumber, ['CPY', 'Rd', 'Rm'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs);
    if (!guard.getResult(errors)) return [];

    return [((rd >> 3) << 7) + (rs << 3) + (rd & 7), 0x46];
}