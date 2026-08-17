.export function_override_addItem
.export function_addPseudoItem

.export local_addPseudoItem_isArchipelago


@ r0 = itemId
function_override_addItem:
    push {r5, lr}
    mov r5, r0

    lsl r0, r0, #0x10
    lsr r0, r0, #0x18
    cmp r0, #0x8
    bgt local_override_addItem_isPseudoItem
    mov r0, r5
    bl thunk_addItem

    local_override_addItem_end:
        pop {r5, pc}

    local_override_addItem_isPseudoItem:
        mov r0, r5
        cmp r0, r7
        beq local_override_addItem_end      @ Break early if this is the call from #0x080CD2CA

        bl function_addPseudoItem
        pop {r5, pc}


@ r0 = itemId, return = was r0 a pseudo-item? (0/1)
function_addPseudoItem:
    push {r1-r6, lr}
    lsr r2, r0, #0x8
    mov r1, #0xFF
    and r0, r1
    mov r1, #0xF
    and r2, r1

    cmp r2, #0xF
    beq local_addPseudoItem_isSummon
    cmp r2, #0xE
    beq local_addPseudoItem_isPsynergy
    cmp r2, #0xD
    beq local_addPseudoItem_isCharacter
    cmp r2, #0xA
    beq local_addPseudoItem_isArchipelago

    mov r0, #0x0
    pop {r1-r6, pc}

    local_addPseudoItem_isSummon:
        mov r5, r0
        bl thunk_showSummonText
        mov r0, r5
        bl thunk_unlockSummon
        b local_addPseudoItem_end

    local_addPseudoItem_isPsynergy:
        mov r5, r0
        bl function_findFreePsynergySlot
        mov r1, r5
        bl thunk_addInnatePsynergy
        b local_addPseudoItem_end

    local_addPseudoItem_isCharacter:
        bl function_addCharacterItem
        b local_addPseudoItem_end

    @ Leave enough room to insert a BL instruction here, dummied out by default
    local_addPseudoItem_isArchipelago:
        b local_addPseudoItem_end
        .hword #0x0

    local_addPseudoItem_end:
        mov r0, #0x1
        pop {r1-r6, pc}


@ return = characterId
function_findFreePsynergySlot:
    push {r5-r7, lr}
    bl thunk_getPartySize

    mov r5, r0
    ldr r6, ptr_partyOrder
    mov r7, #0x0

    local_findFreePsynergySlot_loopParty:
        ldrb r0, [r6, r7]
        mov r1, #0xA6
        lsl r1, r1, #0x1
        mul r1, r0
        ldr r0, ptr_characterData_psynergy
        add r0, r1
        mov r1, #0x0
        mov r2, #0x0

        local_findFreePsynergySlot_loopCharacterPsynergy:
            ldr r3, [r0, #0]
            cmp r3, #0x0
            beq local_findFreePsynergySlot_end

            lsr r3, r3, #0x8
            cmp r3, #0x80
            bge local_findFreePsynergySlot_isNotInnate
            add r1, #0x1

        local_findFreePsynergySlot_isNotInnate:
            cmp r1, #0xE
            beq local_findFreePsynergySlot_characterFull
            add r2, #0x1
            cmp r2, #0x1F
            beq local_findFreePsynergySlot_characterFull

            add r0, #0x4
            b local_findFreePsynergySlot_loopCharacterPsynergy

    local_findFreePsynergySlot_characterFull:
        add r7, #0x1
        cmp r5, r7
        beq local_findFreePsynergySlot_end
        b local_findFreePsynergySlot_loopParty

    local_findFreePsynergySlot_end:
        ldrb r0, [r6, r7]
        pop {r5-r7, pc}


@ r0 = characterId
function_addCharacterItem:
    push {r5-r7, lr}
    mov r7, r0
    ldr r5, ptr_itemHandling_startingInventoryMapping

    bl thunk_readFlag
    cmp r0, #0x0
    bne local_addCharacterItem_loopDjinnQueue

    mov r0, r7
    mov r6, #0x0
    cmp r0, #0x3
    bgt local_addCharacterItem_isTLA
    add r5, #0x2C
    b local_addCharacterItem_loopItemList

    local_addCharacterItem_isTLA:
        cmp r0, #0x7
        bne local_addCharacterItem_loopItemList
        add r5, #0x20

    local_addCharacterItem_loopItemList:
        ldrh r0, [r5, #0x0]
        ldrh r1, [r5, #0x2]
        cmp r1, #0x0
        beq local_addCharacterItem_endOfList
        cmp r0, r7
        bne local_addCharacterItem_wrongCharacter
        bl function_addMappedItem

        local_addCharacterItem_wrongCharacter:
            add r5, #0x4
            b local_addCharacterItem_loopItemList

        local_addCharacterItem_endOfList:
            cmp r6, #0x0
            bne local_addCharacterItem_break
            mov r6, #0x1
            ldr r5, ptr_itemHandling_startingPsynergy
            b local_addCharacterItem_loopItemList

    local_addCharacterItem_break:
        bl thunk_getPartySize
        lsl r0, r0, #0x2
        ldr r1, ptr_characterShuffle_djinniList
        ldr r5, [r1, r0]
        mov r6, #0x0

        local_addCharacterItem_loopDjinniList:
            ldrb r1, [r5, #0x0]
            cmp r1, #0xFF
            beq local_addCharacterItem_loopDjinnQueue

            mov r0, r7
            ldrb r2, [r5, #0x1]
            bl function_addMappedDjinniToCharacter
            add r5, #0x2
            add r6, #0x1
            b local_addCharacterItem_loopDjinniList

    local_addCharacterItem_loopDjinnQueue:
        cmp r6, #0x9
        beq local_addCharacterItem_end

        ldr r5, ptr_djinnQueue
        ldrb r3, [r5, #0x0]
        cmp r3, #0x0
        beq local_addCharacterItem_end
        
        lsl r2, r3, #0x1
        ldrb r1, [r5, r2]
        add r2, #0x1
        ldrb r2, [r5, r2]
        sub r3, #0x1
        strb r3, [r5, #0x0]

        mov r0, r7
        bl thunk_addDjinniToCharacter
        
        add r6, #0x1
        b local_addCharacterItem_loopDjinnQueue

    local_addCharacterItem_end:
        mov r0, r7
        bl thunk_calculateStats

        mov r0, r7
        mov r1, #0x1
        bl thunk_addPartyMember

        pop {r5-r7, pc}


@ =============================

.thunk thunk_readFlag, #0x08016CE5
.thunk thunk_showSummonText, #0x08038341
.thunk thunk_addItem, #0x080AEDF9
.thunk thunk_getPartySize, #0x080AFDBD
.thunk thunk_unlockSummon, #0x080AFF95
.thunk thunk_addPartyMember, #0x080D23D9
.thunk thunk_addInnatePsynergy, #0x080D2A0D

ptr_partyOrder:
    .pointer #0x02000458

ptr_characterData_psynergy:
    .pointer #0x02000578

ptr_djinnQueue:
    .pointer #0x02002980

ptr_itemHandling_startingInventoryMapping:
    .pointer #0x08FA00E0

ptr_itemHandling_startingPsynergy:
    .pointer #0x08FA0130

ptr_characterShuffle_djinniList:
    .pointer ptrList_characterShuffle_djinniList