.offset #0x02009188

    ldr r0, #0x02009550     @ (= #0x261E)
    mov r1, #0x5
    bl #0x0200B58C          @ showSystemTextbox

    mov r0, #0x4
    mov r1, #0x0
    bl #0x0200B46C          @ showChoice
    cmp r0, #0x0
    bne skip_selectedNo

    mov r6, #0x2
    mov r5, #0xBC
    b #0x0200972A

skip_selectedNo:
    mov r2, #0x0
    ldr r0, ptr_playerObjectY
    ldr r0, [r0, #0x0]
    lsr r0, r0, #0x12
    cmp r0, #0x46
    blt skip_aboveYThreshold

    mov r2, #0x10
    neg r2, r2

skip_aboveYThreshold:
    mov r0, #0x4
    mov r1, #0x10
    neg r1, r1
    bl #0x0200B5DC          @ moveToRelative

    mov r0, #0x5
    bl #0x0200B454          @ wait
    b #0x02009746


.align 4

ptr_playerObjectY:
    .pointer #0x020322FC
