import type { AssemblyErrors, Labels } from "./assembler";
import type { Register } from "./tokens";

/**
 * Utility class for applying guards to instruction parameters during the assembly step.
 */
export class GuardBuilder 
{
    line : number;
    instr : string[];
    labels : Labels | undefined;
    errors : AssemblyErrors;

    #instrStr : string;

    /**
     * @param line The line in the source file this guard will be applied to
     * @param instr An array of string parts that make up the instruction this guard will be applied to;
     *  index 0 must be the instruction name, and every parameter should be another entry, e.g. `['ADD', 'Rd', 'Rs']`
     * @param labels Optional; the labels identified by the parser (only required when using the relevant guards)
     */
    constructor(line : number, instr : string[], labels? : Labels) {
        this.line = line;
        this.instr = instr;
        this.labels = labels;
        this.errors = [];

        this.#instrStr = instr[0];
        if (instr.length > 1) {
            this.#instrStr += ' ' + instr.slice(1).join(',');
        }
    }

    /**
     * Returns the display name of the specified parameter.
     * @param num The number of the parameter
     */
    #param(num : number) : string {
        if (num < 0 || num >= this.instr.length) return '???';
        return this.instr[num + 1];
    }

    /**
     * Adds an error to the internal list
     * @param error The error text
     */
    #addError(error : string) : void {
        this.errors.push([this.line, error]);
    }

    /**
     * Checks whether all guards have passed, and appends any internal errors that were raised to the provided `AssemblyErrors` array.
     * @param errors The assembly error array
     * @returns `true` if all guards were passed (i.e. no errors were raised), otherwise `false`
     */
    getResult(errors : AssemblyErrors) : boolean {
        const isValid = (this.errors.length == 0);
        this.errors.forEach(e => errors.push(e));
        this.errors = [];
        return isValid;
    }

    /**
     * Guard that checks whether the parse result was assigned an `address`. NOTE: should only fail in case of an internal parser error.
     * @param address The address that was (or was not) assigned to the line
     */
    requireAddress(address : number|undefined) : this {
        if (address == undefined) {
            this.#addError('[BUG] Parser was unable to determine the address for this instruction');
        }
        return this;
    }

    /**
     * Guard that checks whether the provided label exists.
     * @param label The identifier of the label to validate
     */
    requireLabelExists(label : string) : this {
        if (!this.labels) {
            this.#addError('[BUG] Labels were not passed to the GuardBuilder object');
        } else if (this.labels[label] == undefined) {
            this.#addError(`Unknown identifier: ${label}`);
        }
        return this;
    }

    /**
     * Guard that checks whether the provided `Register` lies in the lower half, so `R7` or below.
     * @param param The index of the parameter this guard applies to (used for error text generation)
     * @param register The register to validate
     */
    requireRegisterLower(param : number, register : Register) : this {
        if (register > 7) {
            this.#addError(`Instruction "${this.#instrStr}" only accepts lower-half registers for parameter "${this.#param(param)}"`);
        }
        return this;
    }

    /**
     * Guard that checks whether the provided `RangeParameter` value is a subset of the given registers.
     * @param param The index of the parameter this guard applies to (used for error text generation)
     * @param range The `RangeParameter` value to validate
     * @param set The set of registers it should fall within
     */
    requireRangeSubset(param : number, range : Register[], set : Register[]) : this {
        range.forEach(reg => {
            if (!set.includes(reg)) {
                this.#addError(`Instruction "${this.#instrStr}" does not accept register r${reg} in parameter "${this.#param(param)}"`)
            }
        });
        return this;
    }

    /**
     * Guard that checks whether the provided number is non-negative.
     * @param param The index of the parameter this guard applies to (used for error text generation)
     * @param value The number to validate
     */
    requireNumberUnsigned(param : number, value : number) : this {
        if (value < 0) {
            this.#addError(`Instruction "${this.#instrStr}" does not support negative values for parameter "${this.#param(param)}"`);
        }
        return this;
    }

    /**
     * Guard that checks whether the absolute value of the provided number is equal to or less than the given maximum.
     * @param param The index of the parameter this guard applies to (used for error text generation)
     * @param value The number to validate 
     * @param max The maximum value for the number
     */
    requireNumberMax(param : number, value : number, max : number) : this {
        if (Math.abs(value) > max) {
            this.#addError(`Instruction "${this.#instrStr}" does not support values above ${max} for parameter "${this.#param(param)}"`);
        }
        return this;
    }

    /**
     * Guard that checks whether the provided number is aligned to the given number of bytes (i.e. `value % align == 0`)
     * @param param The index of the parameter this guard applies to (used for error text generation)
     * @param value The number to validate 
     * @param align The alignment to check for
     */
    requireNumberAlignment(param : number, value : number, align : number) : this {
        if ((value % align) != 0) {
            this.#addError(`Instruction "${this.#instrStr}" requires an alignment of ${align} for parameter "${this.#param(param)}"`);
        }
        return this;
    }

    /**
     * Guard that checks whether the provided address is valid, using the GBATEK memory map as reference.
     * NOTE: Does not check if the address should be used in the way the user intends to, only if it falls within a valid memory area.
     * @param addr The address to validate
     */
    requirePointerValid(addr : number) : this {
        const ptrError = `Invalid pointer "0x${addr.toString(16).toUpperCase()}":`;

        if (addr < 0) {
            this.#addError(`${ptrError} negative addresses are not allowed`);
            return this;
        }

        if (addr <= 0x00003FFF) return this;
        if (addr >= 0x02000000 && addr <= 0x0203FFFF) return this;
        if (addr >= 0x03000000 && addr <= 0x03007FFF) return this;
        if (addr >= 0x04000000 && addr <= 0x040003FE) return this;
        if (addr >= 0x05000000 && addr <= 0x050003FF) return this;
        if (addr >= 0x06000000 && addr <= 0x06017FFF) return this;
        if (addr >= 0x07000000 && addr <= 0x070003FF) return this;
        if (addr >= 0x08000000 && addr <= 0x0E00FFFF) return this;

        this.#addError(`${ptrError} unused memory address, consult GBATEK for supported addresses`);
        return this;
    }

    /**
     * Guard that checks whether the provided address falls within a certain range of the current address. Used for example to validate jumps.
     * @param targetAddr The address to validate
     * @param currentAddr The address of the line that is being checked
     * @param range A tuple of the allowed ranges in either direction (`[backwards, forwards]`)
     * @returns 
     */
    requirePointerRange(targetAddr : number, currentAddr : number, range : [number, number]) : this {
        const edges = [currentAddr - range[0], currentAddr + range[1]];
        if (targetAddr < edges[0] || targetAddr > edges[1]) {
            this.#addError(`Pointer parameter "0x${targetAddr.toString(16).toUpperCase()}" is out of range (expected between 0x${edges[0].toString(16).toUpperCase()} and 0x${edges[1].toString(16).toUpperCase()})`);
        }
        return this;
    }
}