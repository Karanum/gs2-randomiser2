/**
 * Assembler for CMP instructions.
 */

import { getNumber, getRegister, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import { ParameterType, type ParseLineResult } from "../parser";

export function assemble(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    if (parse.params[1].type == ParameterType.REGISTER) {
        return assembleRR(parse, errors);
    } else {
        return assembleRN(parse, errors);
    }
}

function assembleRR(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);

    if (rd > 7 || rs > 7) {
        return [((rd >> 3) << 7) + (rs << 3) + (rd % 7), 0x45];
    }
    return [0x80 + (rs << 3) + rd, 0x42];
}

function assembleRN(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const nn = getNumber(parse.params[1]);

    const guard = new GuardBuilder(parse.lineNumber, ['CMP', 'Rd', 'Imm8bit'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(1, nn).requireNumberMax(1, nn, 255)
    if (!guard.getResult(errors)) return [];

    return [nn, 0x28 + rd];
}