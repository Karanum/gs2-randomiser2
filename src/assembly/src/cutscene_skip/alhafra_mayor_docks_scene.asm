.offset #0x0200A05C

    mov r5, #0x90
    lsl r5, r5, #0x4
    add r0, r5, #0x5
    bl #0x0200CA04

    add r5, #0xF
    mov r0, r5
    bl #0x0200CA04

    add r5, #0x70
    mov r0, r5
    bl #0x0200CA04

    pop {r5, pc}