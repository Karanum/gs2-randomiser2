.offset #0x02009D54

    push {r5-r6, lr}

    mov r0, #0xD0
    lsl r0, r0, #0x4
    mov r5, r0
    mov r6, #0x0

loop:
    mov r0, r5
    add r0, r0, r6
    bl #0x0200BFC4              @ readFlag
    cmp r0, #0x0
    bne skip_flagSet

    mov r0, #0x8
    add r0, r0, r6
    bl #0x0200C08C              @ getObjectPointer
    mov r1, r5
    add r1, r1, r6
    bl thunk_setItemDisplay

    mov r0, #0x8
    add r0, r0, r6
    bl #0x0200C08C              @ getObjectPointer
    mov r1, #0x0
    bl #0x0200C014              @ setObjectShadow

skip_flagSet:
    add r6, #0x1
    cmp r6, #0x4
    blt loop

    pop {r5-r6, pc}


.thunk thunk_setItemDisplay, #0x08020301