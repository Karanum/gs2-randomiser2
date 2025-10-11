.offset #0x0200BA80

push {lr}
mov r0, #0xA3
lsl r0, r0, #0x4
bl 0x0200B0F8
cmp r0, #0x0
bne marsStarFound

mov r0, #0xDE
bl thunkHasItem
cmp r0, #0x0
bge marsStarFound
mov r0, #0xF7
bl thunkHasItem
cmp r0, #0x0
blt notFound

marsStarFound:
mov r0, #0xAB
lsl r0, r0, #0x4
bl 0x0200B100

notFound:
bl 0x02008B64
pop {pc}

.thunk thunkHasItem, #0x080AEEC9
