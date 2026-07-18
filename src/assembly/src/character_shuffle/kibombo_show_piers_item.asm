.offset #0x020087C8


push {lr}
bl #0x0200D38C

mov r0, #0xD0
lsl r0, r0, #0x4
add r0, #0x7
bl #0x0200DA0C      @ readFlag
cmp r0, #0x0
bne skip

mov r0, #0x1A
bl #0x0200DAC4      @ getObjectPointer
mov r1, #0xD0
lsl r1, r1, #0x4
add r1, #0x7
bl thunk_setItemDisplay

mov r0, #0x1A
bl #0x0200DAC4      @ getObjectPointer
mov r1, #0x0
bl #0x0200DA74      @ setObjectShadow

skip:
    mov r0, #0x7
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200DB0C  @ setPosition
    pop {pc}


.thunk thunk_setItemDisplay, #0x08020301
