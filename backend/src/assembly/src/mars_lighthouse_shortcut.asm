.offset #0x0200BC20

    push {lr}

    mov r0, #0xA3
    lsl r0, r0, #0x4
    bl #0x0200B0F8              @ readFlag
    cmp r0, #0x0
    bne enableShortcut

    mov r0, #0xDE
    bl thunk_checkForItem
    cmp r0, #0x0
    bge enableShortcut

    mov r0, #0xF7
    bl thunk_checkForItem
    cmp r0, #0x0
    blt end

enableShortcut:
    mov r0, #0xAB
    lsl r0, r0, #0x4
    bl #0x0200B100              @ setFlag

end:
    bl #0x02008B64              @ (vanilla map load function)
    pop {pc}

.thunk thunk_checkForItem, #0x080AEEC9