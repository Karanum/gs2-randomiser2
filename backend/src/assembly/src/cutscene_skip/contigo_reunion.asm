.offset #0x02009D6A

    mov r0, #0x0
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200C0D4      @ setPosition

    mov r0, #0x1
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200C0D4      @ setPosition

    mov r0, #0x2
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200C0D4      @ setPosition

    mov r0, #0x3
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200C0D4      @ setPosition

    mov r0, #0x8
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200C0D4      @ setPosition
    bl #0x0200C1E4      @ screenFadeIn
    bl #0x0200C1F4      @ waitForFade

    mov r0, #0x2B
    lsl r0, r0, #0x8
    add r0, #0x5D
    mov r1, #0x5
    bl #0x0200C034      @ showSystemTextbox
    bl #0x0200ADF4      @ (regular jump but out of b range)