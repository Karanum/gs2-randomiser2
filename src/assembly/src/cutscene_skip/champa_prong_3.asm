.offset #0x02008AFE

    mov r0, #0x4
    mov r1, #0x20
    lsl r1, r1, #0x8
    mov r2, #0x0
    bl #0x0200B52C

    mov r0, #0x8
    mov r1, #0x40
    lsl r1, r1, #0x8
    bl #0x0200B534

    mov r0, #0xA6
    mov r1, #0x1
    mov r2, #0xE8
    mov r3, #0x1
    neg r1, r1
    lsl r2, r2, #0x10
    lsl r0, r0, #0x12
    bl #0x0200B55C
    bl #0x0200B564

    mov r0, r11
    bl #0x0200B164
    mov r0, #0x1E
    bl #0x0200B454

    mov r0, r11
    bl #0x0200B20C
    mov r0, #0x1E
    bl #0x0200B454

    b #0x02008E4C