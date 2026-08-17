/**
 * Assembler for CPY instructions.
 */

import { getRegister } from "../assembler";
import { GuardBuilder } from "../guards";
import type { AssemblyErrors, ParseLineResult } from "../types";

export function assemble(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);

    const guard = new GuardBuilder(parse, ['CPY', 'Rd', 'Rm'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs);
    if (!guard.getResult(errors)) return [];

    return [((rd >> 3) << 7) + (rs << 3) + (rd & 7), 0x46];
}