.offset #0x080F3F00

push {r5-r6, lr}
ldr r5, ptr_avoidCounter
ldr r5, [r5, #0x0]
ldr r0, data_textIndex
cmp r5, #0x0
bgt jump_disableAvoid

lsl r6, r0, #0x0
mov r0, #0x96
mov r1, #0x4
bl #0x0803CCD0
add r0, r6, #0x1

jump_disableAvoid:
    mov r1, #0x1
    bl #0x0803A7AC
    pop {r5-r6, pc}

.align 4

ptr_avoidCounter:
    .pointer #0x020004A4

data_textIndex:
    .word #0xDBE