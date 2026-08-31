.offset #0x09006D00

mov r0, r8
push {r0, r7}
bl thunk_getPartySize
cmp r0, #0x8
beq skip

mov r5, #0x9
mul r5, r0
mov r8, r0
mov r6, #0x0
mov r7, #0x30

loop:
    add r0, r7, #0x0
    bl thunk_readFlag
    add r6, r6, r0
    add r7, #0x1
    cmp r7, #0x80
    blt loop
    cmp r6, r5
    blt skip

ldr r0, ptr_queue
ldrb r1, [r0, #0x0]
add r1, #0x1
strb r1, [r0, #0x0]
lsl r1, r1, #0x1
add r0, r0, r1
pop {r1, r7}
mov r8, r1
lsl r1, r7, #0x0
mov r2, r10
strb r1, [r0, #0x0]
strb r2, [r0, #0x1]
b thunk_continue

skip:
    pop {r0, r7}
    mov r8, r0
    add r1, r7, #0x0
    mov r2, r10
    mov r0, r9
    bl thunk_addDjinni


.thunk thunk_continue, #0x080B0B55
.thunk thunk_getPartySize, #0x080AFDBD
.thunk thunk_addDjinni, #0x080B0B79
.thunk thunk_readFlag, #0x08016CE5

.align 4

ptr_queue:
    .pointer #0x02002980