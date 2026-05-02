.offset #0x080F4000
.export inject_handleRetreat
.export inject_fixTeleportEntrances
.export data_sancWarpShipPositions

@ Replaces part of the existing Retreat handler so that needs to be repeated

inject_handleRetreat:
    ldr r3, [r4, #0x18]
    sub r0, #0xA8
    lsl r3, r3, #0x1
    add r2, r3, r0
    ldrh r3, [r7, r2]
    cmp r3, #0x95
    bne inject_handleRetreat_return

    ldr r0, ptrMapDoor
    ldrh r0, [r0, #0x0]
    cmp r0, #0x2
    bne inject_handleRetreat_return

    mov r3, #0x9C
    strh r3, [r7, r2]

    inject_handleRetreat_return:
        ldr r0, ptrReturn_inject_handleRetreat
        bx r0

.align 4

ptrReturn_inject_handleRetreat:
    .pointer #0x080FDE45

ptrMapDoor:
    .pointer #0x02000420


inject_fixTeleportEntrances:
    push {r2, r3}
    mov r2, #0x0
    ldsh r0, [r3, r2]
    ldr r4, ptrTeleportData
    mov r3, #0x0

    inject_fixTeleportEntrances_loop:
        ldrb r2, [r4, r3]
        cmp r2, #0x0
        beq inject_fixTeleportEntrances_end
        cmp r2, r0
        beq inject_fixTeleportEntrances_break
        add r3, #0x2
        b inject_fixTeleportEntrances_loop
    
    inject_fixTeleportEntrances_break:
        add r4, r4, r3
        ldrb r1, [r4, #0x1]
        mov r0, #0x2
        pop {r2, r3}
        b inject_fixTeleportEntrances_return

    inject_fixTeleportEntrances_end:
        pop {r2, r3}
        mov r4, #0x0
        ldsh r0, [r2, r4]
        mov r2, #0x0
        ldsh r1, [r3, r2]

    inject_fixTeleportEntrances_return:
        ldr r3, ptrReturn_inject_fixTeleportEntrances
        bx r3

.align 4

ptrReturn_inject_fixTeleportEntrances:
    .pointer #0x080CBCF9

ptrTeleportData:
    .pointer teleportData

teleportData:
    .byte #0x5A
    .byte #0x05
    .byte #0x13
    .byte #0x11
    .byte #0x3E
    .byte #0x3F
    .hword #0x0

.align 4

data_sancWarpShipPositions: