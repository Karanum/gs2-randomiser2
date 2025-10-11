/**
 * Assembler for all instructions under group THUMB.4 (ALU operations)
 */

import { getRegister, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import type { ParseLineResult } from "../parser";

const instructions : Record<string, number> = {
    'AND': 0, 'EOR': 1, 'LSL': 2, 'LSR': 3, 'ASR': 4, 'ADC': 5, 'SBC': 6, 'ROR': 7,
    'TST': 8, 'NEG': 9, 'CMP': 10, 'CMN': 11, 'ORR': 12, 'MUL': 13, 'BIC': 14, 'MVN': 15
};

export function assemble(parse : ParseLineResult, errors : AssemblyErrors, instr : string) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const op = instructions[instr] ?? 0;

    const guard = new GuardBuilder(parse.lineNumber, [instr, 'Rd', 'Rs'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs);
    if (!guard.getResult(errors)) return [];

    return [((op & 3) << 6) + (rs << 3) + rd, 0x40 + (op >> 2)];
}