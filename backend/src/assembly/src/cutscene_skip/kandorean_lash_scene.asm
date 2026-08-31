.offset #0x0200A3E8

    push {r5, lr}
    mov r0, #0x0
    bl #0x0200D370          @ setPsynergyState

    ldr r5, ptr_itemObjectRef
    ldr r0, [r5, #0x0]
    cmp r0, #0x0
    beq skip_noDisplayObject

    mov r1, #0x3
    bl #0x0200D330          @ doItemPickupAnimation (?)

skip_noDisplayObject:
    mov r0, #0xC6
    mov r1, #0x0
    bl #0x0200D1D0          @ addItemWithMessage

    ldr r0, [r5, #0x0]
    cmp r0, #0x0
    beq skip_stillNoDisplayObject

    bl #0x0200D148          @ deleteObject        

skip_stillNoDisplayObject:
    mov r0, #0xC
    mov r1, #0x4
    bl #0x0200D248          @ setAnimation

    mov r0, #0x80
    lsl r0, r0, #0x4
    add r0, #0x4A
    bl #0x0200D118          @ writeFlag

    pop {r5, pc}


.align 4

ptr_itemObjectRef:
    .pointer #0x0200E2AC