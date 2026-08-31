import type { Dirent } from "node:fs";
import type { Instruction, Macro, Register } from "./tokens";

/**
 * Represents all possible parameter types, laid out as bit flags to support binary operations.
 */
export enum ParameterType { NONE = 0, NUMBER = 1, REGISTER = 2, LABEL = 4, RANGE = 8, OFFSET = 16, TEXT = 32 };

export type NumberParameter = {
    type : ParameterType.NUMBER,
    value : number
};
export type RegisterParameter = {
    type : ParameterType.REGISTER,
    value : Register
};
export type LabelParameter = {
    type: ParameterType.LABEL,
    value : string
};
export type RangeParameter = {
    type : ParameterType.RANGE,
    value : Register[]
};
export type OffsetParameter = {
    type : ParameterType.OFFSET,
    value : [RegisterParameter, (NumberParameter | RegisterParameter)]
};
export type TextParameter = {
    type : ParameterType.TEXT,
    value : string
};

export type Parameter = { type: ParameterType.NONE } 
    | NumberParameter | RegisterParameter | LabelParameter | RangeParameter | OffsetParameter | TextParameter;

export type AssemblyErrors = [string, number, string][];
export type Labels = Record<string, number>;
export type AssemblyResult = { data: Uint8Array, exports: Labels };

export type ParseLineResult = {
    line : string,
    lineNumber : number,
    source : string,
    label? : string
    instruction? : Instruction,
    macro? : Macro,
    address? : number,
    params : Parameter[],
    error : string[],
    extraData : number
};

export type PreprocessorResult = {
    lines: ParseLineResult[],
    dependencies: [number, string][]
};

export type Script = {
    contents : string,
    relPath : string,
    dirent : Dirent<string>,
    hash : string,
    dependencies: string[]
};