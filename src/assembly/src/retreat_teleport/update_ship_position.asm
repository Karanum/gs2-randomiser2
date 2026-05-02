.offset #0x080CA394
.export import_sancWarpShipPositions

ldr r4, import_sancWarpShipPositions
ldr r0, ptrTeleportDestination
ldr r7, [r0, #0x0]

mov r3, #0x0
sub r3, #0x1
lsr r3, r3, #0x10

loop:
    ldrh r0, [r4, #0x0]
    cmp r0, r7
    beq break

    add r4, #0x6
    cmp r0, r3
    bne loop
    b end

break:
    ldrh r0, [r4, #0x2]
    lsl r0, r0, #0x10
    str r0, [r1, #0x0]
    ldrh r0, [r4, #0x4]
    lsl r0, r0, #0x10
    str r0, [r1, #0x4]

end:
    pop {r3}
    mov r8, r3
    pop {r5-r7, pc}

.align 4

import_sancWarpShipPositions:
    .pointer #0x0

ptrTeleportDestination:
    .pointer #0x0202A012