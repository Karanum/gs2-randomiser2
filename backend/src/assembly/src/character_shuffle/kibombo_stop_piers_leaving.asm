.offset #0x02008C90

push {lr}
mov r0, #0x9
lsl r0, r0, #0x8
add r0, #0x2E
bl #0x0200DA14      @ writeFlag
pop {pc}