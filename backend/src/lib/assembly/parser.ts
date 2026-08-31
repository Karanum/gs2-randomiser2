import { Instruction, Macro, Register } from "./tokens";
import { type Labels, ParameterType, type LabelParameter, type NumberParameter, type OffsetParameter, type ParseLineResult, type RangeParameter, type RegisterParameter, type TextParameter } from "./types";
import { printParsingErrors } from "./errors";

// List of reserved identifiers, to prevent labels masquerading as registers
const reservedIdentifiers = ['r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8',
    'r9', 'r10', 'r11', 'r12', 'r13', 'r14', 'r15', 'lr', 'sp', 'pc'];


/**
 * Parses a single line of source code.
 * @param parseResult The boilerplate parse result object for the line to parse.
 */
export function parseLine(parseResult : ParseLineResult) : void {
    const line = parseResult.line;

    // Check whether the line contains a label definition
    let labelSplit = line.split(':').map(chunk => chunk.trim());
    if (labelSplit.length > 1) {
        if (labelSplit[0].match(/^[0-9]/)) {
            parseResult.error.push('Label identifiers may not begin with a number');
        } else if (reservedIdentifiers.includes(labelSplit[0].toLowerCase())) {
            parseResult.error.push(`Label identifier "${labelSplit[0]}" is a reserved keyword`);
        }

        parseResult.label = labelSplit[0];
        if (labelSplit.length > 2 || labelSplit[1].length > 0) {
            parseResult.error.push('Labels must be defined on their own line for now');
        }
        return;
    }

    // Check whether the line is an instruction or a macro, and call the corresponding function
    line.startsWith('.') ? parseMacro(parseResult) : parseInstruction(parseResult);
}

/**
 * Parses a single line of source code as an instruction.
 * @param parseResult The boilerplate parse result object for the line to parse.
 */
function parseInstruction(parseResult : ParseLineResult) : void {
    const line = parseResult.line;

    let opSplit = line.split(' ');
    let params : string[] = [];

    // Split the parameters, taking care to keep range and offset parameters whole
    let paramParts = opSplit.slice(1).join(' ').split(/\s*,\s*/);
    for (let i = 0; i < paramParts.length; ++i) {
        const part = paramParts[i];
        if ( (part.includes('{') && !part.includes('}')) || (part.includes('[') && !part.includes(']')) ) {
            params.push(part + ',' + paramParts[++i]);
            continue;
        }
        params.push(part);
    }

    // Identify the instruction and parse the parameters accordingly
    switch (opSplit[0].toLowerCase()) {
        case 'adc':
            parseResult.instruction = Instruction.ADC;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'add':
            parseResult.instruction = Instruction.ADD;
            parseParameterChain(params, parseResult, (params.length == 3)
                ? [ParameterType.REGISTER, ParameterType.REGISTER, ParameterType.NUMBER + ParameterType.REGISTER]
                : [ParameterType.REGISTER, ParameterType.NUMBER + ParameterType.REGISTER]);
            break;
        case 'and':
            parseResult.instruction = Instruction.AND;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'asr':
            parseResult.instruction = Instruction.ASR;
            parseParameterChain(params, parseResult, (params.length == 3)
                ? [ParameterType.REGISTER, ParameterType.REGISTER, ParameterType.NUMBER]
                : [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'b':
            parseResult.instruction = Instruction.B;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bcc':
        case 'blo':
            parseResult.instruction = Instruction.BCC;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bcs':
        case 'bhs':
            parseResult.instruction = Instruction.BCS;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'beq':
            parseResult.instruction = Instruction.BEQ;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bge':
            parseResult.instruction = Instruction.BGE;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bgt':
            parseResult.instruction = Instruction.BGT;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bhi':
            parseResult.instruction = Instruction.BHI;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bic':
            parseResult.instruction = Instruction.BIC;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'bkpt':
            parseResult.instruction = Instruction.BKPT;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'bl':
            parseResult.instruction = Instruction.BL;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'ble':
            parseResult.instruction = Instruction.BLE;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bls':
            parseResult.instruction = Instruction.BLS;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'blt':
            parseResult.instruction = Instruction.BLT;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'blx':
            parseResult.instruction = Instruction.BLX;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.REGISTER + ParameterType.LABEL]);
            break;
        case 'bmi':
            parseResult.instruction = Instruction.BMI;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bne':
            parseResult.instruction = Instruction.BNE;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bpl':
            parseResult.instruction = Instruction.BPL;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bvc':
            parseResult.instruction = Instruction.BVC;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bvs':
            parseResult.instruction = Instruction.BVS;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'bx':
            parseResult.instruction = Instruction.BX;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER]);
            break;
        case 'cmp':
            parseResult.instruction = Instruction.CMP;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.NUMBER + ParameterType.REGISTER]);
            break;
        case 'cpy':
            parseResult.instruction = Instruction.CPY;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'eor':
            parseResult.instruction = Instruction.EOR;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'ldmia':
            parseResult.instruction = Instruction.LDMIA;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.RANGE]);
            break;
        case 'ldr':
            parseResult.instruction = Instruction.LDR;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.LABEL + ParameterType.OFFSET + ParameterType.NUMBER]);
            break;
        case 'ldrb':
            parseResult.instruction = Instruction.LDRB;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'ldrh':
            parseResult.instruction = Instruction.LDRH;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'ldsb':
            parseResult.instruction = Instruction.LDSB;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'ldsh':
            parseResult.instruction = Instruction.LDSH;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'lsl':
            parseResult.instruction = Instruction.LSL;
            parseParameterChain(params, parseResult, (params.length == 3)
                ? [ParameterType.REGISTER, ParameterType.REGISTER, ParameterType.NUMBER]
                : [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'lsr':
            parseResult.instruction = Instruction.LSR;
            parseParameterChain(params, parseResult, (params.length == 3)
                ? [ParameterType.REGISTER, ParameterType.REGISTER, ParameterType.NUMBER]
                : [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'mov':
            parseResult.instruction = Instruction.MOV;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.NUMBER + ParameterType.REGISTER]);
            break;
        case 'mul':
            parseResult.instruction = Instruction.MUL;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'mvn':
            parseResult.instruction = Instruction.MVN;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'neg':
            parseResult.instruction = Instruction.NEG;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'nop':
            parseResult.instruction = Instruction.NOP;
            parseParameterChain(params, parseResult, []);
            break;
        case 'orr':
            parseResult.instruction = Instruction.ORR;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'pop':
            parseResult.instruction = Instruction.POP;
            parseParameterChain(params, parseResult, [ParameterType.RANGE]);
            break;
        case 'push':
            parseResult.instruction = Instruction.PUSH;
            parseParameterChain(params, parseResult, [ParameterType.RANGE]);
            break;
        case 'ror':
            parseResult.instruction = Instruction.ROR;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'sbc':
            parseResult.instruction = Instruction.SBC;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        case 'stmia':
            parseResult.instruction = Instruction.STMIA;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.RANGE]);
            break;
        case 'str':
            parseResult.instruction = Instruction.STR;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'strb':
            parseResult.instruction = Instruction.STRB;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'strh':
            parseResult.instruction = Instruction.STRH;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.OFFSET]);
            break;
        case 'sub':
            parseResult.instruction = Instruction.SUB;
            parseParameterChain(params, parseResult, (params.length == 3)
                ? [ParameterType.REGISTER, ParameterType.REGISTER, ParameterType.NUMBER + ParameterType.REGISTER]
                : [ParameterType.REGISTER, ParameterType.NUMBER + ParameterType.REGISTER]);
            break;
        case 'swi':
            parseResult.instruction = Instruction.SWI;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'tst':
            parseResult.instruction = Instruction.TST;
            parseParameterChain(params, parseResult, [ParameterType.REGISTER, ParameterType.REGISTER]);
            break;
        default:
            parseResult.error.push(`Unknown instruction: ${opSplit[0].toLowerCase()}`);
    }
}

/**
 * Parses a single line of source code as an assembler macro.
 * @param parseResult The boilerplate parse result object for the line to parse.
 */
function parseMacro(parseResult : ParseLineResult) : void {
    const line = parseResult.line.substring(1);

    let opSplit = line.split(' ');
    let params = opSplit.slice(1).join(' ').split(/\s*,\s*/);
    
    // Identify the macro and parse the parameters accordingly
    switch (opSplit[0].toLowerCase()) {
        case 'byte':
            parseResult.macro = Macro.BYTE;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'hword':
            parseResult.macro = Macro.HWORD;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'word':
            parseResult.macro = Macro.WORD;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'pointer':
            parseResult.macro = Macro.POINTER;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER + ParameterType.LABEL]);
            break;
        case 'text':
            parseResult.macro = Macro.TEXT;
            parseResult.params = [{ type: ParameterType.TEXT, value: opSplit.slice(1).join(' ') }];
            break;
        case 'reserve':
            parseResult.macro = Macro.RESERVE;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'align':
            parseResult.macro = Macro.ALIGN;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'offset':
            parseResult.macro = Macro.OFFSET;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'thunk':
            parseResult.macro = Macro.THUNK;
            parseParameterChain(params, parseResult, [ParameterType.LABEL, ParameterType.NUMBER]);
            break;
        case 'max_size':
            parseResult.macro = Macro.MAX_SIZE;
            parseParameterChain(params, parseResult, [ParameterType.NUMBER]);
            break;
        case 'export':
            parseResult.macro = Macro.EXPORT;
            parseParameterChain(params, parseResult, [ParameterType.LABEL]);
            break;
        case 'set':
            parseResult.macro = Macro.SET;
            parseParameterChain(params, parseResult, [ParameterType.LABEL, ParameterType.NUMBER]);
            break;
        case 'include':
            parseResult.macro = Macro.INCLUDE;
            break;
        default:
            parseResult.error.push(`Unknown macro: ${opSplit[0].toLowerCase()}`);
    }
}

/**
 * Parses a list of parameters according to a provided schema, or "chain". This schema does not handle
 * variable numbers of parameters, so this function should be called with different schemas depending
 * on the length of the parameter list.
 * @param params The list of raw unparsed parameters
 * @param resultObj The `ParseLineResult` object for the current line
 * @param chain The schema of allowed parameters (bitwise OR to allow multiple types per parameter)
 */
function parseParameterChain(params : string[], resultObj : ParseLineResult, chain : ParameterType[]) : void {
    if (params.length != chain.length) {
        resultObj.error.push(`Wrong number of arguments: expected ${chain.length}, received ${params.length}`);
        return;
    }

    for (let i = 0; i < chain.length; ++i) {
        let param = params[i];
        let result = parseNumberParameter(param) ?? parseRegisterParameter(param)
            ?? parseRangeParameter(param) ?? parseOffsetParameter(param) ?? parseLabelParameter(param);

        if (!result) {
            resultObj.error.push(`Malformed parameter ${i+1}: expected "${paramFlagToString(chain[i])}"`);
            resultObj.params.push({ type: ParameterType.NONE });
        } else {
            resultObj.params.push(result);
            if ((chain[i] & result.type) == 0) {
                resultObj.error.push(`Unexpected type for parameter ${i+1}: expected "${paramFlagToString(chain[i])}", received "${paramTypeToString(result.type)}"`);
            }
        }
    }
}

/**
 * Parses a parameter as a number.
 * @param param The string representation of the parameter
 * @returns `NumberParameter` if it is a valid number, otherwise `undefined`
 */
function parseNumberParameter(param : string) : NumberParameter | undefined {
    let match = param.match(/^#?(0x[0-9a-f]+|0b[01]+|\-?\d+)$/i);
    if (match == null) return;
    return { type: ParameterType.NUMBER, value: Number(match[1]) };
}

/**
 * Parses a parameter as a register.
 * @param param The string representation of the parameter
 * @returns `RegisterParameter` if it is a valid register, otherwise `undefined`
 */
function parseRegisterParameter(param : string) : RegisterParameter | undefined {
    if (param.endsWith('!')) param = param.substring(0, param.length - 1);
    switch (param.toLowerCase()) {
        case 'r0': return { type: ParameterType.REGISTER, value: Register.R0 };
        case 'r1': return { type: ParameterType.REGISTER, value: Register.R1 };
        case 'r2': return { type: ParameterType.REGISTER, value: Register.R2 };
        case 'r3': return { type: ParameterType.REGISTER, value: Register.R3 };
        case 'r4': return { type: ParameterType.REGISTER, value: Register.R4 };
        case 'r5': return { type: ParameterType.REGISTER, value: Register.R5 };
        case 'r6': return { type: ParameterType.REGISTER, value: Register.R6 };
        case 'r7': return { type: ParameterType.REGISTER, value: Register.R7 };
        case 'r8': return { type: ParameterType.REGISTER, value: Register.R8 };
        case 'r9': return { type: ParameterType.REGISTER, value: Register.R9 };
        case 'r10': return { type: ParameterType.REGISTER, value: Register.R10 };
        case 'r11': return { type: ParameterType.REGISTER, value: Register.R11 };
        case 'r12': return { type: ParameterType.REGISTER, value: Register.R12 };
        case 'r13': case 'sp': return { type: ParameterType.REGISTER, value: Register.R13 };
        case 'r14': case 'lr': return { type: ParameterType.REGISTER, value: Register.R14 };
        case 'r15': case 'pc': return { type: ParameterType.REGISTER, value: Register.R15 };
    }
}

/**
 * Parses a parameter as a label.
 * @param param The string representation of the parameter
 * @returns `LabelParameter` if it is a valid label identifier, otherwise `undefined`
 */
function parseLabelParameter(param : string) : LabelParameter | undefined {
    if (!param.match(/^[a-z_]/i)) return;
    return { type: ParameterType.LABEL, value: param };
}

/**
 * Parses a parameter as a set of registers, i.e. `{r0, r1, r2..r4}`. Ranges of registers can be declared with either `..` or `-`.
 * @param param The string representation of the parameter
 * @returns `RangeParameter` if it is a valid range definition, otherwise `undefined`
 */
function parseRangeParameter(param : string) : RangeParameter | undefined {
    let match = param.match(/{\s*(.+)\s*}/i);
    if (match == null || match.length < 2) return;

    const registers : Register[] = [];
    const parts = match[1].split(',');
    for (let i = 0; i < parts.length; ++i) {
        let partMatch = parts[i].match(/^\s*(r\d+|sp|lr|pc)(?:\s*[(?:\.\.)(?:\-)]\s*(r\d+|sp|lr|pc))?\s*$/i);
        if (partMatch == null) return;

        if (partMatch[2] == undefined) {
            let reg = parseRegisterParameter(partMatch[1]);
            if (!reg) return;
            
            registers.push(reg.value);
        } else {
            let reg1 = parseRegisterParameter(partMatch[1]);
            let reg2 = parseRegisterParameter(partMatch[2]);
            if (!reg1 || !reg2) return;

            if (reg2.value < reg1.value) [reg1, reg2] = [reg2, reg1];
            for (let j = reg1.value; j <= reg2.value; ++j) {
                registers.push(j);
            }
        }
    }
    return { type: ParameterType.RANGE, value: registers };
}

/**
 * Parses a parameter as an offset, i.e. `[Rb, Ro]` or `[Rb, #nn]`.
 * @param param The string representation of the parameter
 * @returns `OffsetParameter` if it is a valid offset definition, otherwise `undefined`
 */
function parseOffsetParameter(param : string) : OffsetParameter | undefined {
    let match = param.match(/^\[\s*([\w\d]+)\s*,\s*([#\-\w\d]+)\s*\]$/i);
    if (match == null) return;

    const param1 = parseRegisterParameter(match[1]);
    const param2 = parseNumberParameter(match[2]) ?? parseRegisterParameter(match[2]);
    if (param1 == undefined || param2 == undefined) return;

    return { type: ParameterType.OFFSET, value: [param1, param2] };
}

/**
 * Helper function to represent a (set of) ParameterType(s) as a string.
 * @param flag The `ParameterType`, either by itself or as a compound
 */
function paramFlagToString(flag : number) : string {
    let parts = [];
    for (let i = 0; i < 5; ++i) {
        if (flag & (1 << i)) parts.push(paramTypeToString(1 << i));
    }
    return parts.join('|');
}

/**
 * Helper function to represent a ParameterType as a string.
 * @param paramType The parameter type
 */
function paramTypeToString(paramType : ParameterType) : string {
    switch (paramType) {
        case ParameterType.NUMBER: return "number";
        case ParameterType.REGISTER: return "register";
        case ParameterType.LABEL: return "identifier";
        case ParameterType.RANGE: return "registerRange";
        case ParameterType.OFFSET: return "registerOffset";
        default: return "unknown";
    }
}

/**
 * Applies post-processing to the results of a parse. Marks each line with the address it will end up with
 * for relative jump calculation and checks for duplicate label definitions. Additionally writes an error
 * to the parse results if the `.MAX_SIZE` macro was set and consequently exceeded.
 * @param results The full parse result
 * @returns A list of labels and their addresses
 */
export function processParseResults(results : ParseLineResult[]) : Labels {
    const labels : Record<string, number> = {};
    let maxSize = 0;
    let address = 0;
    let offset = 0;

    for (let i = 0; i < results.length; ++i) {
        const result = results[i];
        result.address = address;
        
        if (result.label) {
            if (labels[result.label] != undefined) result.error.push(`Duplicate assignment of label "${result.label}"`);
            labels[result.label] = address;
        }

        if (result.macro != undefined) {
            switch (result.macro) {
                case Macro.BYTE:
                    address += 1;
                    break;
                case Macro.HWORD:
                    address += 2;
                    break;
                case Macro.WORD:
                case Macro.POINTER:
                    address += 4;
                    break;
                case Macro.TEXT:
                    const param = (result.params[0] as TextParameter).value;
                    address += param.length + 1;
                    break;
                case Macro.RESERVE:
                    address += (result.params[0] as NumberParameter).value;
                    break;
                case Macro.ALIGN:
                    const align = (result.params[0] as NumberParameter).value;
                    if (address % align != 0) result.extraData = align - (address % align);
                    address += result.extraData;
                    break;
                case Macro.OFFSET:
                    offset = (result.params[0] as NumberParameter).value;
                    address = offset;
                    break;
                case Macro.THUNK:
                    {
                        const label = (result.params[0] as LabelParameter).value;
                        if (labels[label] != undefined) result.error.push(`Duplicate assignment of label "${label}"`);
                        
                        if (address % 4 != 0) result.extraData = 4 - (address % 4);
                        address += result.extraData;
                        result.address = address;
                        labels[label] = address;
                        address += 8;
                    }
                    break;
                case Macro.MAX_SIZE:
                    maxSize = (result.params[0] as NumberParameter).value;
                    break;
                case Macro.SET:
                    {
                        const label = (result.params[0] as LabelParameter).value;
                        if (labels[label] != undefined) result.error.push(`Duplicate assignment of label "${label}"`);
                        labels[label] = (result.params[1] as NumberParameter).value;
                    }
                    break;
            }
        }
        else if (result.instruction != undefined) {
            if (result.instruction == Instruction.BL) address += 2;
            address += 2;
        }
    }

    if (maxSize > 0 && address > offset + maxSize) {
        results[results.length - 1].error.push(`Program will exceed the defined maximum size: ${address - offset}/${maxSize} bytes`);
    }
    return labels;
}

/**
 * Parses a file.
 * @param file The full file in string form
 * @returns An object containing the parse results for each line and a list of labels, or `undefined` if any errors were raised
 */
export function parseFile(file : ParseLineResult[]) : { parseResults: ParseLineResult[], labels: Labels }|undefined {
    file.forEach(line => parseLine(line));
    if (file.some(line => line.error.length > 0)) {
        printParsingErrors(file[0].source, file);
        return;
    }

    const labels = processParseResults(file);
    if (file.some(line => line.error.length > 0)) {
        printParsingErrors(file[0].source, file);
        return;
    }

    return { parseResults: file, labels };
}