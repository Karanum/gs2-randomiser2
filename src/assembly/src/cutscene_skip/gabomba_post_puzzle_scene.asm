.offset #0x02008194

    ldr r5, ptr_r5
    ldr r6, ptr_r6
    ldr r7, ptr_r7

    mov r0, #0x0
    mov r8, r0
    b #0x02008832


.align 4

ptr_r5:
    .pointer #0x0200A058

ptr_r6:
    .pointer #0x02000454

ptr_r7:
    .pointer #0x02000240