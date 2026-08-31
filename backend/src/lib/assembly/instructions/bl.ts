/**
 * Assembler for BL instructions.
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

    const guard = new GuardBuilder(parse, ['BL', 'Imm31bit*2'])
        .requireAddress(parse.address)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [4194302, 4194300])
        .requireNumberAlignment(0, nn, 2);
    if (!guard.getResult(errors)) return [];

    const offset = (nn - addr - 4) >> 1;
    const upper = (offset >> 11) & 0x7FF;
    const lower = offset & 0x7FF;
    return [upper & 0xFF, 0xF0 + (upper >> 8), lower & 0xFF, 0xF8 + (lower >> 8)];
}

function assembleFromLabel(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    const label = getLabel(parse.params[0]);
    const nn = labels[label] ?? 0;
    const addr = parse.address ?? 0;

    const guard = new GuardBuilder(parse, ['BL', 'label'], labels)
        .requireAddress(parse.address).requireLabelExists(label)
        .requirePointerValid(nn).requirePointerRange(nn, addr + 4, [4194302, 4194300])
        .requireNumberAlignment(0, nn, 2);
    if (!guard.getResult(errors)) return [];

    const offset = (nn - addr - 4) >> 1;
    const upper = (offset >> 11) & 0x7FF;
    const lower = offset & 0x7FF;
    return [upper & 0xFF, 0xF0 + (upper >> 8), lower & 0xFF, 0xF8 + (lower >> 8)];
}