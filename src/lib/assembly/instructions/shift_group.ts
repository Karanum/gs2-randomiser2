/**
 * Assembler for all instructions under group THUMB.1 (Move shifted register) 
 * including their variants in group THUMB.4 (ALU operations)
 */

import { getNumber, getRegister, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import type { ParseLineResult } from "../parser";

const instructions : Record<string, number> = {
    'LSL': 0, 'LSR': 1, 'ASR': 2
};

export function assemble(parse : ParseLineResult, errors : AssemblyErrors, instr : string) : number[] {
    if (parse.params.length == 2) {
        return assembleRR(parse, errors, instr);
    }
    return assembleRRN(parse, errors, instr);
}

function assembleRR(parse : ParseLineResult, errors : AssemblyErrors, instr : string) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const op = (instructions[instr] ?? 0) + 2;

    const guard = new GuardBuilder(parse.lineNumber, [instr, 'Rd', 'Rs'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs);
    if (!guard.getResult(errors)) return [];

    return [((op & 3) << 6) + (rs << 3) + rd, 0x40 + (op >> 2)];
}

function assembleRRN(parse : ParseLineResult, errors : AssemblyErrors, instr : string) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const nn = getNumber(parse.params[2]);
    const op = (instructions[instr] ?? 0) + 2;

    const guard = new GuardBuilder(parse.lineNumber, [instr, 'Rd', 'Rs', 'Imm5bit'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs)
        .requireNumberUnsigned(2, nn).requireNumberMax(2, nn, 31);
    if (!guard.getResult(errors)) return [];

    return [((nn & 3) << 6) + (rs << 3) + rd, (op << 3) + (nn >> 2)];
}