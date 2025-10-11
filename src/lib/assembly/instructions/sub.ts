/**
 * Assembler for SUB instructions.
 */

import { getNumber, getRegister, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import { ParameterType, type ParseLineResult } from "../parser";

export function assemble(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    if (parse.params.length == 3) {
        if (parse.params[2].type == ParameterType.REGISTER) {
            return assembleRRR(parse, errors);
        } else {
            return assembleRRN(parse, errors);
        }
    } else {
        if (parse.params[1].type == ParameterType.REGISTER) {
            return assembleRR(parse, errors);
        } else {
            return assembleRN(parse, errors);
        }
    }
}

function assembleRR(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);

    const guard = new GuardBuilder(parse.lineNumber, ['SUB', 'Rd', 'Rs'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs);
    if (!guard.getResult(errors)) return [];

    return [((rs & 3) << 6) + (rd << 3) + rd, 0x1A + (rs >> 2)];
}

function assembleRN(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const nn = getNumber(parse.params[1]);
    if (rd == 13) return assembleSN(parse, errors, nn);

    const guard = new GuardBuilder(parse.lineNumber, ['SUB', 'Rd', 'Imm8bit'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(1, nn).requireNumberMax(1, nn, 255);
    if (!guard.getResult(errors)) return [];

    return [nn, 0x38 + rd];
}

function assembleRRR(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const rn = getRegister(parse.params[2]);

    const guard = new GuardBuilder(parse.lineNumber, ['SUB', 'Rd', 'Rs', 'Rn'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs).requireRegisterLower(2, rn);
    if (!guard.getResult(errors)) return [];

    return [((rn & 3) << 6) + (rs << 3) + rd, 0x1A + (rn >> 2)];
}

function assembleRRN(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const nn = getNumber(parse.params[2]);

    const guard = new GuardBuilder(parse.lineNumber, ['SUB', 'Rd', 'Rs', 'Imm3bit'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs)
        .requireNumberUnsigned(2, nn).requireNumberMax(2, nn, 7);
    if (!guard.getResult(errors)) return [];

    return [((nn & 3) << 6) + (rs << 3) + rd, 0x1E + (nn >> 2)];
}

function assembleSN(parse : ParseLineResult, errors : AssemblyErrors, nn : number) : number[] {
    const guard = new GuardBuilder(parse.lineNumber, ['SUB', 'SP', '±Imm7bit*4'])
        .requireNumberAlignment(1, nn, 4).requireNumberMax(1, nn, 508);
    if (!guard.getResult(errors)) return [];

    if (nn < 0) {
        return [Math.abs(nn) >> 2, 0xB0];
    }
    return [0x80 + (nn >> 2), 0xB0];
}