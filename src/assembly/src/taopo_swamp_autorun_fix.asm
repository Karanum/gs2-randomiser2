.offset #0x0200B5F4


push {lr}
mov r2, #0x2
ldr r0, ptrAutorunFlag
ldrb r0, [r0, #0]
cmp r0, #0
beq noAutorun
eor r3, r2

noAutorun:
mov r0, #0xA0
and r3, r2
lsl r0, r0, #0x5
cmp r3, #0
beq end

lsl r3, r0, #0x1
add r3, r0
asr r0, r3, #0x1

end:
pop {pc}


.align 4

ptrAutorunFlag:
.pointer #0x09007900