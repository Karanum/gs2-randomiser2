.offset #0x0200C484

push {r5, lr}
ldr r0, ptr_anemosDjinnCount
ldrb r0, [r0, #0x0]
mov r1, #0x5
bl thunk_setTextVar
ldr r0, data_textIndex
bl thunk_setTextIndex
mov r0, #0xE
mov r1, #0x0
bl thunk_showTextbox
pop {r5, pc}

.align 4

ptr_anemosDjinnCount:
    .pointer #0x09007902

data_textIndex:
    .word #0x1578

.thunk thunk_setTextVar, #0x08038121
.thunk thunk_setTextIndex, #0x080C8181
.thunk thunk_showTextbox, #0x080C81A1