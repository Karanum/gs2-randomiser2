/**
 * Assembler for all instructions under groups THUMB.6 through THUMB.11
 */

import { getLabel, getNumber, getRegister, type AssemblyErrors, type Labels } from "../assembler";
import { GuardBuilder } from "../guards";
import { ParameterType, type OffsetParameter, type ParseLineResult } from "../parser";
import { Register } from "../tokens";

const instructionsOffsetImm : Record<string, number> = { 'STR': 0, 'STRH': 0, 'LDR': 1, 'LDRH': 1, 'STRB': 2, 'LDRB': 3 };
const instructionsOffsetReg : Record<string, number> = { 'STR': 0, 'STRH': 1, 'STRB': 2, 'LDSB': 3, 'LDR': 4, 'LDRH': 5, 'LDRB': 6, 'LDSH': 7 };

export function assemble(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors, instr : string) : number[] {
    if (parse.params[1].type == ParameterType.LABEL) {
        return assembleFromLabel(parse, labels, errors);
    }

    const rd = getRegister(parse.params[0]);
    const offset = (parse.params[1] as OffsetParameter).value;
    
    if (offset[1].type == ParameterType.REGISTER) {
        return assembleOffsetReg(parse.lineNumber, errors, rd, offset, instr);
    } else {
        if (instr == 'LDSB' || instr == 'LDSH') {
            errors.push([parse.lineNumber, `Instruction "${instr} Rd,[Rb,Ro]" does not accept numeric values for parameter "Ro"`]);
            return [];
        }

        if (offset[0].value == Register.R15 && instr == 'LDR') return assembleOffsetPC(parse.lineNumber, errors, rd, offset);
        if (offset[0].value == Register.R13 && (instr == 'STR' || instr == 'LDR')) return assembleOffsetSP(parse.lineNumber, errors, rd, offset, instr);
        return assembleOffsetImm(parse.lineNumber, errors, rd, offset, instr);
    }
}

function assembleOffsetImm(line : number, errors : AssemblyErrors, rd : Register, offset : OffsetParameter['value'], instr : string) : number[] {
    const rb = getRegister(offset[0]);
    const nn = getNumber(offset[1]);
    const op = instructionsOffsetImm[instr] ?? 0;
    const size = instr.endsWith('B') ? 1 : (instr.endsWith('H') ? 2 : 4);

    const guard = new GuardBuilder(line, [instr, 'Rd', '[Rb,#nn]'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rb)
        .requireNumberUnsigned(1, nn).requireNumberAlignment(1, nn, size).requireNumberMax(1, nn, 61 * size);
    if (!guard.getResult(errors)) return [];

    const nnNormal = nn >> Math.log2(size);

    if (instr.endsWith('H')) {
        return [((nnNormal & 3) << 6) + (rb << 3) + rd, 0x80 + (op << 3) + (nnNormal >> 2)];
    }
    return [((nnNormal & 3) << 6) + (rb << 3) + rd, 0x60 + (op << 3) + (nnNormal >> 2)];
}

function assembleOffsetReg(line : number, errors : AssemblyErrors, rd : Register, offset : OffsetParameter['value'], instr : string) : number[] {
    const rb = getRegister(offset[0]);
    const ro = getRegister(offset[1]);
    const op = instructionsOffsetReg[instr] ?? 0;

    const guard = new GuardBuilder(line, [instr, 'Rd', '[Rb,Ro]'])
        .requireRegisterLower(0, rd).requireRegisterLower(1, rb).requireRegisterLower(1, ro);
    if (!guard.getResult(errors)) return [];

    return [((ro & 3) << 6) + (rb << 3) + rd, 0x50 + (op << 1) + (ro >> 2)];
}

function assembleOffsetSP(line : number, errors : AssemblyErrors, rd : Register, offset : OffsetParameter['value'], instr : string) : number[] {
    const nn = getNumber(offset[1]);
    const op = instructionsOffsetImm[instr];

    const guard = new GuardBuilder(line, [instr, 'Rd', '[SP,#nn]'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(1, nn).requireNumberMax(1, nn, 1020).requireNumberAlignment(1, nn, 4);
    if (!guard.getResult(errors)) return [];

    return [nn >> 2, 0x90 + (op << 3) + rd];
}

function assembleOffsetPC(line : number, errors : AssemblyErrors, rd : Register, offset : OffsetParameter['value']) : number[] {
    const nn = getNumber(offset[1]);

    const guard = new GuardBuilder(line, ['LDR', 'Rd', '[PC,#nn]'])
        .requireRegisterLower(0, rd)
        .requireNumberUnsigned(1, nn).requireNumberMax(1, nn, 1020).requireNumberAlignment(1, nn, 4);
    if (!guard.getResult(errors)) return [];

    return [nn >> 2, 0x48 + rd];
}

function assembleFromLabel(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    const rd = getRegister(parse.params[0]);
    const label = getLabel(parse.params[1]);
    const nn = labels[label] ?? 0;
    const addr = parse.address ?? 0;

    const guard = new GuardBuilder(parse.lineNumber, ['LDR', 'Rd', 'label'], labels)
        .requireAddress(parse.address).requireLabelExists(label)
        .requireRegisterLower(0, rd).requireNumberAlignment(1, nn, 4)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [0, 1020]);
    if (!guard.getResult(errors)) return [];

    const offset = (nn - addr - 4) >> 2;

    return [offset, 0x48 + rd];
}