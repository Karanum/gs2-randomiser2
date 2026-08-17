.export injection_tabletInteraction
.export injection_chestInteraction
.export injection_displayScoopItem_preCall
.export injection_displayItemObject
.export injection_displayScoopItem


injection_tabletInteraction:
    mov r0, r7
    bl function_addPseudoItem
    ldr r0, ptr_tabletInteraction_return
    bx r0


injection_chestInteraction:
    mov r0, r7
    bl function_addPseudoItem

    cmp r0, #0x0
    beq local_chestInteraction_noPseudoItem
    mov r0, r9
    bl thunk_setFlag
    ldr r0, ptr_chestInteraction_returnPseudo
    bx r0

    local_chestInteraction_noPseudoItem:
        mov r0, r6
        bl thunk_showTreasureAnimation
        mov r0, #0x53
        bl thunk_playSound

        ldr r0, ptr_chestInteraction_returnNonPseudo
        bx r0


injection_displayScoopItem_preCall:
    push {r5-r6, lr}
    mov r5, r0
    mov r0, r1
    bl function_getSpecialItemMapped

    mov r1, r0
    mov r0, r5
    bl thunk_displayScoopItem

    pop {r5-r6, pc}


injection_displayItemObject:
    mov r0, r9
    bl function_loadItemIcon

    mov r2, #0x80
    ldr r1, ptr_displayItemObject_return
    bx r1


injection_displayScoopItem:
    mov r0, r6
    bl function_loadItemIcon
    
    mov r2, r5
    ldr r1, ptr_displayScoopItem_return
    bx r1

@ =============================

.thunk thunk_showTreasureAnimation, #0x080CF351
.thunk thunk_playSound, #0x081C0CB1
.thunk thunk_displayScoopItem, #0x080D3B29

ptr_tabletInteraction_return:
    .pointer #0x080CD0ED

ptr_chestInteraction_returnPseudo:
    .pointer #0x080CD365

ptr_chestInteraction_returnNonPseudo:
    .pointer #0x080CD327

ptr_displayItemObject_return:
    .pointer #0x080CF29D

ptr_displayScoopItem_return:
    .pointer #0x080D3B91
