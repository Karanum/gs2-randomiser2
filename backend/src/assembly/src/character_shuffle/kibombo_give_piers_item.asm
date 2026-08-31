.offset #0x02009318

    push {r5, lr}
    bl #0x0200DA9C          @ startCutscene
    mov r0, #0x0
    bl #0x0200DC3C          @ setPsynergyState

    ldr r0, ptr_mappedItem
    ldrh r0, [r0, #0x0]
    mov r5, r0
    bl thunk_checkMappedItem
    cmp r0, #0x1
    beq skip_noItem

    mov r0, #0x53
    bl thunk_playSound
    bl thunk_addItem

    cmp r0, #0x0
    blt skip_inventoryFull

skip_noItem:
    mov r0, #0x1A
    mov r1, #0x0
    mov r2, #0x0
    bl thunk_setPosition

    mov r0, #0xD0
    lsl r0, r0, #0x4
    add r0, #0x7
    bl #0x0200DA14          @ setFlag
    b end

skip_inventoryFull:
    mov r0, #0xE2
    lsl r0, r0, #0x4
    mov r1, #0x0
    bl thunk_showStatusText

end:
    bl #0x0200DAA4          @ endCutscene
    pop {r5, pc}


.thunk thunk_setPosition, #0x080C80F9
.thunk thunk_playSound, #0x081C0CB1
.thunk thunk_addItem, #0x09000207
.thunk thunk_checkMappedItem, #0x09006001
.thunk thunk_showStatusText, #0x08038041

ptr_mappedItem:
    .pointer #0x08FA018C