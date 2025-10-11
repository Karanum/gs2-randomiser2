/**
 * Assembler for ADD instructions.
 */

import { getNumber, getRegister, type AssemblyErrors } from "../assembler";
import { GuardBuilder } from "../guards";
import { ParameterType, type ParseLineResult } from "../parser";
import { Register } from "../tokens";

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

    if (rd > 7 || rs > 7) {
        return [((rd >> 3) << 7) + (rs << 3) + (rd % 7), 0x44];
    }
    return [(rs << 3) + rd, 0x1C];
}

function assembleRN(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const nn = getNumber(parse.params[1]);

    if (rd == Register.R13) return assembleSN(parse, errors, nn);

    const guard = new GuardBuilder(parse.lineNumber, ['ADD', 'Rd', 'Imm8bit'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(1, nn).requireNumberMax(1, nn, 255)
    if (!guard.getResult(errors)) return [];

    return [nn, 0x30 + rd];
}

function assembleRRR(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const rn = getRegister(parse.params[2]);

    const guard = new GuardBuilder(parse.lineNumber, ['ADD', 'Rd', 'Rs', 'Rn'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs).requireRegisterLower(2, rn);
    if (!guard.getResult(errors)) return [];

    return [((rn & 3) << 6) + (rs << 3) + rd, 0x18 + (rn >> 2)];  
}

function assembleRRN(parse : ParseLineResult, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const rs = getRegister(parse.params[1]);
    const nn = getNumber(parse.params[2]);

    if (rs == Register.R13) return assembleRSN(parse, errors, rd, nn);
    if (rs == Register.R15) return assembleRPN(parse, errors, rd, nn);

    const guard = new GuardBuilder(parse.lineNumber, ['ADD', 'Rd', 'Rs', 'Imm3bit'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rs)
        .requireNumberUnsigned(2, nn).requireNumberMax(2, nn, 7);
    if (!guard.getResult(errors)) return [];

    return [((nn & 3) << 6) + (rs << 3) + rd, 0x1C + (nn >> 2)];  
}

function assembleSN(parse : ParseLineResult, errors : AssemblyErrors, nn : number) : number[] {
    const guard = new GuardBuilder(parse.lineNumber, ['ADD', 'SP', '±Imm7bit*4'])
        .requireNumberAlignment(1, nn, 4).requireNumberMax(1, nn, 508);
    if (!guard.getResult(errors)) return [];

    if (nn < 0) {
        return [0x80 + (Math.abs(nn) >> 2), 0xB0];
    }
    return [(nn >> 2), 0xB0];
}

function assembleRPN(parse : ParseLineResult, errors : AssemblyErrors, rd : Register, nn : number) : number[] {
    const guard = new GuardBuilder(parse.lineNumber, ['ADD', 'Rd', 'PC', 'Imm8bit*4'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(2, nn).requireNumberAlignment(2, nn, 4).requireNumberMax(2, nn, 1020);
    if (!guard.getResult(errors)) return [];

    return [(nn >> 2), 0xA0 + rd];
}

function assembleRSN(parse : ParseLineResult, errors : AssemblyErrors, rd : Register, nn : number) : number[] {
    const guard = new GuardBuilder(parse.lineNumber, ['ADD', 'Rd', 'SP', 'Imm8bit*4'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(2, nn).requireNumberAlignment(2, nn, 4).requireNumberMax(2, nn, 1020);
    if (!guard.getResult(errors)) return [];

    return [(nn >> 2), 0xA8 + rd];
}