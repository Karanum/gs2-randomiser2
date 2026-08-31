.offset #0x020084F4

    push {lr}

    mov r0, #0x0
    bl #0x0200B240

    mov r0, #0x4
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200B258

    mov r0, #0x1B
    lsl r0, r0, #0x8
    add r0, #0x67
    mov r1, #0x5
    bl #0x0200B2A0

    mov r0, #0x4
    mov r1, #0x0
    bl #0x0200B140
    cmp r0, #0x0
    beq skip_selectedNo

    mov r0, #0x4
    mov r1, #0x0
    mov r2, #0x10
    neg r2, r2
    bl #0x0200B258
    b done

skip_selectedNo:
    ldr r3, ptr_battleType
    mov r2, #0x2
    strb r2, [r3, #0x0]

    mov r0, #0x63
    mov r1, #0x63
    bl #0x0200B228

    mov r0, #0xA
    mov r1, #0x1
    bl #0x0200B220

done:
    pop {pc}


.align 4

ptr_battleType:
    .pointer #0x0200048B
