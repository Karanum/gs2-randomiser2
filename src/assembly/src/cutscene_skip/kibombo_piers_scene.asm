.offset #0x0200931A

    bl #0x0200DA9C

    mov r0, #0x0
    bl #0x0200DC3C

    ldr r0, ptr_piersInventoryMapping
    ldrh r0, [r0, #0x0]
    lsl r5, r0, #0x0
    bl thunk_giveMappedItem
    cmp r0, #0x1
    beq itemReceived

    mov r0, #0x53
    bl thunk_playSound
    bl thunk_legacyRando_09000206
    cmp r0, #0x0
    blt inventoryFull

itemReceived:
    mov r0, #0x1A
    mov r1, #0x0
    mov r2, #0x0
    bl thunk_setPosition

    mov r0, #0xD0
    lsl r0, r0, #0x4
    add r0, #0x7
    bl #0x0200DA14
    b end

inventoryFull:
    mov r0, #0xE2
    lsl r0, r0, #0x4
    mov r1, #0x0
    bl thunk_displaySystemText

end:
    bl #0x0200DAA4
    pop {r5, pc}


.align 4

ptr_piersInventoryMapping:
    .pointer #0x08FA018C

.thunk thunk_legacyRando_09000206, #0x09000207
.thunk thunk_giveMappedItem, #0x09006001
.thunk thunk_playSound, #0x081C0CB1
.thunk thunk_setPosition, #0x080C80F9
.thunk thunk_displaySystemText, #0x08038041