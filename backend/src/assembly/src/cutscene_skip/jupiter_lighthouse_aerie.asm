.offset #0x0200865C

    push {r5, lr}

    mov r0, #0xA0
    lsl r0, r0, #0x4
    add r0, #0x23
    bl #0x0200D72C          @ readFlag
    cmp r0, #0x0
    beq end

    mov r0, #0x0
    bl #0x0200D984          @ setPsynergyState
    
    mov r0, #0x4
    mov r1, #0x0
    mov r2, #0x0
    bl #0x0200D9A4          @ walkToRelativeAndWait

    mov r0, #0xAB
    lsl r0, r0, #0x6
    add r0, #0xD
    mov r1, #0x5
    bl #0x0200D7CC          @ showSystemTextbox

    mov r0, #0x4
    mov r1, #0x0
    bl #0x0200D824          @ showChoice
    cmp r0, #0x0
    beq skip_selectedYes

    mov r2, #0x80
    lsl r1, r2, #0x9
    lsl r2, r2, #0x8
    mov r0, #0x4
    bl #0x0200D834          @ setMovementSpeed (?)

    mov r1, #0x80
    lsl r1, r1, #0x2
    add r1, #0x2
    mov r2, #0x9A
    lsl r2, r2, #0x1
    add r2, r2, #0x1
    mov r0, #0x4
    bl #0x0200D86C          @ walkToAndWait
    b end

skip_selectedYes:
    mov r0, #0xA0
    lsl r5, r0, #0x4
    lsl r0, r5, #0x0
    add r0, #0x21
    bl #0x0200D734          @ setFlag

    mov r0, #0x8D
    lsl r0, r0, #0x4
    add r0, #0xF
    bl #0x0200D734          @ setFlag

    lsl r0, r5, #0x0
    add r0, #0x25
    bl #0x0200D73C          @ unsetFlag

    mov r0, #0x80
    lsl r5, r0, #0x1
    lsl r0, r5, #0x0
    add r0, #0x61
    bl #0x0200D73C          @ unsetFlag

    lsl r0, r5, #0x0
    add r0, #0x44
    bl #0x0200D73C          @ unsetFlag

    mov r5, #0xFB
    mov r0, #0x80
    lsl r0, r0, #0x9
    add r0, r0, r5
    mov r2, #0x80
    lsl r2, r2, #0x12
    mov r1, #0x94
    lsl r1, r1, #0x3
    add r1, r1, r2
    str r0, [r1, #0x0]

    mov r0, #0x2
    sub r1, #0x15
    strb r0, [r1, #0x0]

    lsl r0, r5, #0x0
    mov r1, #0x5
    bl #0x0200D944          @ setWarpOnBattleWin

    lsl r0, r5, #0x0
    mov r1, #0x5
    bl #0x0200D94C          @ setWarpOnBattleLoss
    
    mov r0, #0xD
    mov r1, #0x7
    bl #0x0200D93C          @ startBattle

end:
    pop {r5, pc}