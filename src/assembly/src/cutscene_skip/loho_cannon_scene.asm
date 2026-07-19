.offset #0x020084D8

    mov r0, #0x10
    mov r1, #0x0
    mov r2, #0x0
    bl #0x02009348          @ setPosition

    mov r0, #0x11
    mov r1, #0x0
    mov r2, #0x0
    bl #0x02009348          @ setPosition

    mov r0, #0x12
    mov r1, #0x0
    mov r2, #0x0
    bl #0x02009348          @ setPosition

    mov r0, #0x14
    mov r1, #0x0
    mov r2, #0x0
    bl #0x02009348          @ setPosition

    mov r0, #0x78
    bl #0x02009280          @ screenFadeInAlpha

    mov r0, #0x78
    bl #0x020092D8          @ wait

    mov r0, #0x90
    lsl r0, r0, #0x4
    add r0, #0xA
    bl #0x02009290          @ setFlag    

    b #0x02008BD0
