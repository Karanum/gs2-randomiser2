/**
 * Represents all supported THUMB instructions.
 */
export enum Instruction {
    ADC,    ADD,    AND,    ASR,    B,      BCC,    BCS,    BEQ,
    BGE,    BGT,    BHI,    BIC,    BKPT,   BL,     BLE,    BLS,
    BLT,    BLX,    BMI,    BNE,    BPL,    BVC,    BVS,    BX,
    CMP,    CPY,    EOR,    LDMIA,  LDR,    LDRB,   LDRH,   LDSB,
    LDSH,   LSL,    LSR,    MOV,    MUL,    MVN,    NEG,    NOP,
    ORR,    POP,    PUSH,   ROR,    SBC,    STMIA,  STR,    STRB,
    STRH,   SUB,    SWI,    TST
}

/**
 * Represents all supported assembler macros.
 */
export enum Macro {
    BYTE,
    HWORD,
    WORD,
    POINTER,
    TEXT,
    ALIGN,
    OFFSET,
    THUNK,
    MAX_SIZE
}

/**
 * Represents all registers in numeric format. (R13 = SP, R14 = LR, R15 = PC)
 */
export enum Register {
    R0,     R1,     R2,     R3,
    R4,     R5,     R6,     R7,
    R8,     R9,     R10,    R11,
    R12,    R13,    R14,    R15
}