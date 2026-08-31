.offset #0x02008AC8

push {r5-r7, lr}
bl #0x02008038
mov r5, #0x30
mov r6, #0x80
mov r7, #0x0

loop:
    lsl r0, r5, #0x0
    bl #0x0200B2B8      @ thunk_readFlag
    add r7, r7, r0
    add r5, #0x1
    cmp r5, r6
    bne loop

ldr r0, ptr_anemosDjinnCount
ldrb r0, [r0, #0x0]
cmp r0, r7
bgt notEnoughDjinn

mov r0, #0xA0
lsl r0, r0, #0x4
add r0, #0x87
lsl r5, r0, #0x0
bl #0x0200B2C0          @ thunk_setFlag
add r0, r5, #0x1
bl #0x0200B2C0
add r0, r5, #0x2
bl #0x0200B2C0
add r0, r5, #0x3
bl #0x0200B2C0
add r0, r5, #0x4
bl #0x0200B2C0

notEnoughDjinn:
    pop {r5-r7, pc}

.align 4

ptr_anemosDjinnCount:
    .pointer #0x09007902