.offset #0x020080F0
.export inject_objectId


push {r5, lr}
bl #0x0200953C

mov r0, #0xD0
lsl r0, r0, #0x4
add r0, #0x6
bl #0x0200B150  @ readFlag
cmp r0, #0x0
bne skip

inject_objectId:
    mov r0, #0xFF

bl #0x0200B1D8  @ getObjectPointer
mov r5, r0
mov r1, #0xD0
lsl r1, r1, #0x4
add r1, #0x6
bl thunk_setItemDisplay

mov r0, r5
mov r1, #0x0
bl #0x0200B198  @ setObjectShadow

skip:
    pop {r5, pc}


.thunk thunk_setItemDisplay, #0x08020301