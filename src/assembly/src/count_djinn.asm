.offset #0x08131900

push {r5-r6 lr}
mov r5, #0x30
mov r6, #0x0

loop:
    add r0, r5, #0x0
    bl #0x08016CE4
    add r6, r6, r0
    add r5, #0x1
    cmp r5, #0x80
    ble loop

add r0, r6, #0x0
pop {r5-r6, pc}