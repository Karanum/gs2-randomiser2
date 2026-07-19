.offset #0x02008682

    mov r0, #0x2D
    lsl r0, r0, #0x8
    add r0, #0x8C
    mov r1, #0x5
    bl #0x0200D5E4          @ showSystemTextbox

    mov r0, #0x4
    mov r1, #0x0
    bl #0x0200D62C          @ showChoice
    cmp r0, #0x0
    beq skip_selectedYes

    mov r0, #0x4
    mov r1, #0x0
    mov r2, #0x10
    bl #0x0200D7A4          @ walkToRelativeAndWait
    bl #0x0200D614          @ endCutscene

    ldr r0, ptr_thisFunction_end
    bx r0

skip_selectedYes:
    mov r0, #0x3
    mov r1, #0x0
    bl #0x0200D754          @ setWarpOnBattleWin

    ldr r0, ptr_thisFunction_battleStart
    add r2, r5, #0x0
    add r2, #0x37
    bx r0


.align 4

ptr_thisFunction_end:
    .pointer #0x02009E81

ptr_thisFunction_battleStart:
    .pointer #0x02009E6D