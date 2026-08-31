.offset #0x08131920

push {r5, lr}
bl #0x08131900      @ getObtainedDjinnCount
lsr r1, r0, #0x2
cmp r1, #0xA
ble jump_underLimit
mov r1, #0xA

jump_underLimit:
    ldr r2, ptr_djinnEnemyMapping
    add r0, r6, #0x0

loop:
    cmp r0, #0x14
    blt break
    add r2, #0xB
    sub r0, #0x14
    b loop

break:
    ldrb r0, [r2, r1]
    pop {r5, pc}

.align 4

ptr_djinnEnemyMapping:
    .pointer data_djinnEnemyMapping

data_djinnEnemyMapping:
    .byte #0x01
    .byte #0x02
    .byte #0x03
    .byte #0x04
    .byte #0x05
    .byte #0x06
    .byte #0x07
    .byte #0x08
    .byte #0x09
    .byte #0x0A
    .byte #0x0B
    .byte #0x0D
    .byte #0x0E
    .byte #0x0F
    .byte #0x10
    .byte #0x11
    .byte #0x12
    .byte #0x13
    .byte #0x14
    .byte #0x15
    .byte #0x16
    .byte #0x17
    .byte #0x19
    .byte #0x1A
    .byte #0x1B
    .byte #0x1C
    .byte #0x1D
    .byte #0x1E
    .byte #0x1F
    .byte #0x20
    .byte #0x21
    .byte #0x22
    .byte #0x23
    .byte #0x25
    .byte #0x26
    .byte #0x27
    .byte #0x28
    .byte #0x29
    .byte #0x2A
    .byte #0x2B
    .byte #0x2C
    .byte #0x2D
    .byte #0x2E
    .byte #0x2F