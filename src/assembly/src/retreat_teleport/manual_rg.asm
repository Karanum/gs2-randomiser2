.offset #0x08FFC000

@ The thunks in this snippet all use r0 instead of r4,
@ so can't make use of the custom macro (sad)

ldr r0, ptr_input
ldrh r0, [r0, #0x0]
mov r1, #0x4
and r0, r1
cmp r0, #0x0
beq exit

mov r0, #0xD0
lsl r0, r0, #0x4
add r0, #0x66
mov r1, #0x1
bl thunk_showStatusText
ldr r0, ptr_continue
bx r0

exit:
    ldr r0, ptr_exit
    bx r0

thunk_showStatusText:
    ldr r0, ptr_thunk_showStatusText
    bx r0

.align 4

ptr_continue:
    .pointer #0x080CEAEF

ptr_exit:
    .pointer #0x080CE7DB

ptr_thunk_showStatusText:
    .pointer #0x08038041

ptr_input:
    .pointer #0x03001150