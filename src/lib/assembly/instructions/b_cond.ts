/**
 * Assembler for all instructions under group THUMB.16 (Conditional branch)
 */

import { getLabel, getNumber, type AssemblyErrors, type Labels } from "../assembler";
import { GuardBuilder } from "../guards";
import { ParameterType, type ParseLineResult } from "../parser";

const instructions : Record<string, number> = {
    'BEQ': 0, 'BNE': 1, 'BCS': 2, 'BCC': 3, 'BMI': 4, 'BPL': 5, 'BVS': 6,
    'BVC': 7, 'BHI': 8, 'BLS': 9, 'BGE': 10, 'BLT': 11, 'BGT': 12, 'BLE': 13
};

export function assemble(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors, instr : string) : number[] {

    if (parse.params[0].type == ParameterType.LABEL) {
        return assembleFromLabel(parse, labels, errors, instr);
    }

    const nn = getNumber(parse.params[0]);
    const addr = parse.address ?? 0;
    const cond = instructions[instr] ?? 0;

    const guard = new GuardBuilder(parse.lineNumber, [instr, 'Imm31bit*2'])
        .requireAddress(parse.address)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [256, 254])
        .requireNumberAlignment(0, nn, 2);
    if (!guard.getResult(errors)) return [];

    let offset = (nn - addr - 4) >> 1;
    let sign = (offset < 0) ? 1 : 0;
    if (sign == 1) offset = Math.abs(offset) - 1;

    return [(sign << 7) + offset, 0xD0 + cond];
}

function assembleFromLabel(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors, instr : string) : number[] {
    const label = getLabel(parse.params[0]);
    const nn = labels[label] ?? 0;
    const addr = parse.address ?? 0;
    const cond = instructions[instr] ?? 0;

    const guard = new GuardBuilder(parse.lineNumber, [instr, 'label'], labels)
        .requireAddress(parse.address).requireLabelExists(label)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [256, 254])
        .requireNumberAlignment(0, nn, 2);
    if (!guard.getResult(errors)) return [];

    let offset = (nn - addr - 4) >> 1;
    let sign = (offset < 0) ? 1 : 0;
    if (sign == 1) offset = Math.abs(offset) - 1;

    return [(sign << 7) + offset, 0xD0 + cond];
}