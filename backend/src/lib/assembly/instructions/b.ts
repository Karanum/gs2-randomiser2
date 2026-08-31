/**
 * Assembler for B instructions.
 */

import { getLabel, getNumber } from "../assembler";
import { GuardBuilder } from "../guards";
import { type AssemblyErrors, type Labels, ParameterType, type ParseLineResult } from "../types";

export function assemble(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    if (parse.params[0].type == ParameterType.LABEL) {
        return assembleFromLabel(parse, labels, errors);
    }

    const nn = getNumber(parse.params[0]);
    const addr = parse.address ?? 0;

    const guard = new GuardBuilder(parse, ['B', 'Imm31bit*2'])
        .requireAddress(parse.address)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [2048, 2046])
        .requireNumberAlignment(0, nn, 2);
    if (!guard.getResult(errors)) return [];

    let offset = (nn - addr - 4) >> 1;
    let sign = (offset < 0) ? 1 : 0;
    if (sign == 1) offset = Math.abs(offset) - 1;

    return [offset & 0xFF, ((offset >> 8) & 3) + (sign << 2) + 0xE0];
}

function assembleFromLabel(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    const label = getLabel(parse.params[0]);
    const nn = labels[label] ?? 0;
    const addr = parse.address ?? 0;

    const guard = new GuardBuilder(parse, ['B', 'label'], labels)
        .requireAddress(parse.address).requireLabelExists(label)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [2048, 2046])
        .requireNumberAlignment(0, nn, 2);
    if (!guard.getResult(errors)) return [];

    let offset = (nn - addr - 4) >> 1;
    let sign = (offset < 0) ? 1 : 0;
    if (sign == 1) offset = Math.abs(offset) - 1;

    return [offset & 0xFF, ((offset >> 8) & 3) + (sign << 2) + 0xE0];
}