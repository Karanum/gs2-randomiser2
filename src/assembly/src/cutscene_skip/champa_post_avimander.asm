.offset #0x02009896

    mov r0, #0xA4
    mov r1, #0x1
    mov r2, #0xF8
    mov r3, #0x0
    neg r1, r1
    lsl r2, r2, #0x10
    lsl r0, r0, #0x12
    bl #0x0200B55C          @ moveCamera

    mov r0, #0xB
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200B4D4          @ setPosition

    mov r0, #0x8
    mov r1, #0xA2
    mov r2, #0xBC
    lsl r1, r1, #0x12
    lsl r2, r2, #0x10
    bl #0x0200B4D4          @ setPosition

    mov r0, #0x8
    mov r1, #0x50
    mov r2, #0x0
    lsl r1, r1, #0x8
    bl #0x0200B52C          @ setFacing
    bl #0x0200B594          @ screenFadeIn
    bl #0x0200B5A4          @ waitForFade

    mov r0, #0x90
    lsl r0, r0, #0x4
    add r0, #0x7E
    bl #0x0200B40C          @ setFlag
    bl #0x0200B464          @ endCutscene

    pop {r3, r5}
    mov r8, r3
    mov r10, r5
    pop {r5-r6, pc}