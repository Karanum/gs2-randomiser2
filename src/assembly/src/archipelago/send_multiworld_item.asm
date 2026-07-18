.offset #0x090061F0

push {lr}
mov r0, #0x4
mov r1, #0x1
bl thunk_setTextVar

mov r0, #0xB5
lsl r0, r0, #0x5
mov r1, #0x0
bl thunk_showStatusText
pop {pc}

.thunk thunk_setTextVar, #0x0803CCD1
.thunk thunk_showStatusText, #0x08038041