import { styleText } from "node:util";
import { ParameterType, type AssemblyErrors, type AssemblyResult, type LabelParameter, type Labels, type NumberParameter, type Parameter, type ParseLineResult, type RangeParameter, type RegisterParameter, type TextParameter } from "./types";
import { Macro, Instruction } from "./tokens";

import * as instrADD from './instructions/add';
import * as instrALUg from './instructions/alu_group';
import * as instrB from './instructions/b';
import * as instrBCond from './instructions/b_cond';
import * as instrBL from './instructions/bl';
import * as instrBLX from './instructions/blx';
import * as instrCMP from './instructions/cmp';
import * as instrCPY from './instructions/cpy';
import * as instrLSg from './instructions/ls_group';
import * as instrMIAg from './instructions/mia_group';
import * as instrMOV from './instructions/mov';
import * as instrPUSHPOP from './instructions/pushpop';
import * as instrSHIFTg from './instructions/shift_group';
import * as instrSUB from './instructions/sub';
import { parseFile } from "./parser";

/**
 * Converts a number to a (little Endian) byte array.
 * @param num The number to convert
 * @param bytes The amount of bytes in the resulting array
 */
function numberToByteArray(num : number, bytes : number) : number[] {
    let result = [];
    for (let i = 0; i < bytes; ++i) {
        result.push(num & 0xFF);
        num >>= 8;
    }
    return result;
}

/** Helper function to get the value of a `RegisterParameter` object. */
export function getRegister(param : Parameter) {
    return (param as RegisterParameter).value;
}

/** Helper function to get the value of a `NumberParameter` object. */
export function getNumber(param : Parameter) {
    return (param as NumberParameter).value;
}

/** Helper function to get the value of a `LabelParameter` object. */
export function getLabel(param : Parameter) {
    return (param as LabelParameter).value;
}

/** Helper function to get the value of a `TextParameter` object. */
export function getText(param : Parameter) {
    return (param as TextParameter).value;
}

/** Helper function to get the value of a `RangeParameter` object. */
export function getRange(param : Parameter) {
    return (param as RangeParameter).value;
}

/**
 * Assembles a single line of source code from its parse result to a byte array.
 * @param parse The parse result of the line
 * @param labels All labels in the current file
 * @param errors The `AssemblyErrors` object for the current file
 */
function assembleLine(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    if (parse.instruction) return assembleInstruction(parse, labels, errors);
    if (parse.macro) return assembleMacro(parse, labels, errors);
    return [];
}

/**
 * Assembles a single line of source code representing an assembler macro. To be called by `assembleLine`.
 */
function assembleMacro(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    switch (parse.macro) {
        case Macro.BYTE:
            return numberToByteArray(getNumber(parse.params[0]), 1);
        case Macro.HWORD:
            return numberToByteArray(getNumber(parse.params[0]), 2);
        case Macro.WORD:
            return numberToByteArray(getNumber(parse.params[0]), 4);
        case Macro.POINTER:
            if (parse.params[0].type == ParameterType.NUMBER) return numberToByteArray(parse.params[0].value, 4);
            const label = getLabel(parse.params[0]);
            if (labels[label] == undefined) {
                errors.push([parse.source, parse.lineNumber, `Unknown identifier "${label}"`]);
                return [0, 0, 0, 0];
            }
            return numberToByteArray(labels[label], 4);
        case Macro.TEXT:
            const text = getText(parse.params[0]);
            const textOutput = [];
            for (let i = 0; i < text.length; ++i) {
                textOutput.push(text.charCodeAt(i) & 0xFF);
            }
            return textOutput;
        case Macro.RESERVE:
            return (new Array(getNumber(parse.params[0]))).fill(0);
        case Macro.ALIGN:
            return (new Array(parse.extraData)).fill(0);
        case Macro.THUNK:
            let thunkAlign = new Array(parse.extraData).fill(0);
            return thunkAlign.concat([0x0, 0x4C, 0x20, 0x47])
                .concat(numberToByteArray(getNumber(parse.params[1]), 4));
    }
    return [];
}

/**
 * Assembles a single line of source code representing an instruction. To be called by `assembleLine`.
 */
function assembleInstruction(parse : ParseLineResult, labels : Labels, errors : AssemblyErrors) : number[] {
    if (parse.address && parse.address % 2 != 0) {
        errors.push([parse.source, parse.lineNumber, 'Instruction maligned, use ".ALIGN 2" to reset proper THUMB alignment']);
    }

    switch (parse.instruction) {
        case Instruction.ADC: return instrALUg.assemble(parse, errors, 'ADC');
        case Instruction.ADD: return instrADD.assemble(parse, errors);
        case Instruction.AND: return instrALUg.assemble(parse, errors, 'AND');
        case Instruction.ASR: return instrSHIFTg.assemble(parse, errors, 'ASR');
        case Instruction.B: return instrB.assemble(parse, labels, errors);
        case Instruction.BCC: return instrBCond.assemble(parse, labels, errors, 'BCC');
        case Instruction.BCS: return instrBCond.assemble(parse, labels, errors, 'BCS');
        case Instruction.BEQ: return instrBCond.assemble(parse, labels, errors, 'BEQ');
        case Instruction.BGE: return instrBCond.assemble(parse, labels, errors, 'BGE');
        case Instruction.BGT: return instrBCond.assemble(parse, labels, errors, 'BGT');
        case Instruction.BHI: return instrBCond.assemble(parse, labels, errors, 'BHI');
        case Instruction.BIC: return instrALUg.assemble(parse, errors, 'BIC');
        case Instruction.BKPT: return [getNumber(parse.params[0]) & 0xFF, 0xBE];
        case Instruction.BL: return instrBL.assemble(parse, labels, errors);
        case Instruction.BLE: return instrBCond.assemble(parse, labels, errors, 'BLE');
        case Instruction.BLS: return instrBCond.assemble(parse, labels, errors, 'BLS');
        case Instruction.BLT: return instrBCond.assemble(parse, labels, errors, 'BLT');
        case Instruction.BLX: return instrBLX.assemble(parse, labels, errors);
        case Instruction.BMI: return instrBCond.assemble(parse, labels, errors, 'BMI');
        case Instruction.BNE: return instrBCond.assemble(parse, labels, errors, 'BNE');
        case Instruction.BPL: return instrBCond.assemble(parse, labels, errors, 'BPL');
        case Instruction.BVC: return instrBCond.assemble(parse, labels, errors, 'BVC');
        case Instruction.BVS: return instrBCond.assemble(parse, labels, errors, 'BVS');
        case Instruction.BX: return [getRegister(parse.params[0]) << 3, 0x47];
        case Instruction.CMP: return instrCMP.assemble(parse, errors);
        case Instruction.CPY: return instrCPY.assemble(parse, errors);
        case Instruction.EOR: return instrALUg.assemble(parse, errors, 'EOR');
        case Instruction.LDMIA: return instrMIAg.assemble(parse, errors, 'LDMIA');
        case Instruction.LDR: return instrLSg.assemble(parse, labels, errors, 'LDR');
        case Instruction.LDRB: return instrLSg.assemble(parse, labels, errors, 'LDRB');
        case Instruction.LDRH: return instrLSg.assemble(parse, labels, errors, 'LDRH');
        case Instruction.LDSB: return instrLSg.assemble(parse, labels, errors, 'LDSB');
        case Instruction.LDSH: return instrLSg.assemble(parse, labels, errors, 'LDSH');
        case Instruction.LSL: return instrSHIFTg.assemble(parse, errors, 'LSL');
        case Instruction.LSR: return instrSHIFTg.assemble(parse, errors, 'LSR');
        case Instruction.MOV: return instrMOV.assemble(parse, errors);
        case Instruction.MUL: return instrALUg.assemble(parse, errors, 'MUL');
        case Instruction.MVN: return instrALUg.assemble(parse, errors, 'MVN');
        case Instruction.NEG: return instrALUg.assemble(parse, errors, 'NEG');
        case Instruction.NOP: return [0xC0, 0x46];
        case Instruction.ORR: return instrALUg.assemble(parse, errors, 'ORR');
        case Instruction.POP: return instrPUSHPOP.assemble(parse, errors, true);
        case Instruction.PUSH: return instrPUSHPOP.assemble(parse, errors, false);
        case Instruction.ROR: return instrALUg.assemble(parse, errors, 'ROR');
        case Instruction.SBC: return instrALUg.assemble(parse, errors, 'SBC');
        case Instruction.STMIA: return instrMIAg.assemble(parse, errors, 'STMIA');
        case Instruction.STR: return instrLSg.assemble(parse, labels, errors, 'STR');
        case Instruction.STRB: return instrLSg.assemble(parse, labels, errors, 'STRB');
        case Instruction.STRH: return instrLSg.assemble(parse, labels, errors, 'STRH');
        case Instruction.SUB: return instrSUB.assemble(parse, errors);
        case Instruction.SWI: return [getNumber(parse.params[0]) & 0xFF, 0xDF];
        case Instruction.TST: return instrALUg.assemble(parse, errors, 'TST');
    }

    errors.push([parse.source, parse.lineNumber, '[BUG] Unimplemented instruction']);
    return [];
}

/**
 * Parse and assemble a single file.
 * @param file The full file in string format
 * @returns A `Uint8Array` containing the result, or `undefined` if any errors were raised
 */
export function build(file : ParseLineResult[]) : AssemblyResult|undefined {
    const result = parseFile(file);
    if (!result) return;
    
    const { parseResults, labels } = result;
    const errors : AssemblyErrors = [];
    const output : number[][] = [];
    const exports : Labels = {};
    for (let i = 0; i < parseResults.length; ++i) {
        if (parseResults[i].macro == Macro.EXPORT) {
            const label = getLabel(parseResults[i].params[0]);
            exports[label] = labels[label];
        }
        output.push(assembleLine(parseResults[i], labels, errors));
    }

    if (errors.length > 0) {
        console.log(styleText('red', 'Build failed due to assembly errors:'));
        errors.forEach(error => {
            console.log(styleText('red', `> Line ${error[1]} in file ${error[0]}:`));
            console.log(styleText('red', `    ${error[2]}`));
        });
        return;
    }

    return {
        data: new Uint8Array(output.flat()),
        exports: exports
    }
}