.export function_addMappedItemList
.export function_addMappedDjinniToCharacter
.export function_addReunionDjinn
.export function_getSpecialItemMapped
.export function_loadItemIconMapped


@ r0 = itemId
function_getSpecialItemMapped:
    push {r5, lr}
    mov r5, r0

    ldr r1, ptr_mapNumber
    ldrh r1, [r1, #0x0]
    bl function_isSpecialItemIgnored
    cmp r0, #0x1
    mov r0, r5
    beq local_getSpecialItemMapped_end

    mov r1, #0x0
    ldr r2, ptr_itemMapping_specialLocations

    local_getSpecialItemMapped_loop:
        ldrh r3, [r2, r1]
        cmp r3, #0x0
        beq local_getSpecialItemMapped_end
        cmp r3, r0
        beq local_getSpecialItemMapped_itemFound
        add r1, #0x2
        b local_getSpecialItemMapped_loop

    local_getSpecialItemMapped_itemFound:
        ldr r2, ptr_itemMapping_specialLocationMapping
        ldrh r0, [r2, r1]

    local_getSpecialItemMapped_end:
        pop {r5, pc}


@ r0 = itemId, r1 = mapId
function_isSpecialItemIgnored:
    push {lr}
    ldr r2, ptr_itemMapping_ignoreList
    lsl r1, r1, #0x10
    add r3, r0, r1
    mov r0, #0x0

    local_isSpecialItemIgnored_loop:
        ldr r1, [r2, #0x0]
        cmp r1, #0x0
        beq local_isSpecialItemIgnored_returnFalse
        cmp r1, r3
        beq local_isSpecialItemIgnored_returnTrue
        add r2, #0x4
        b local_isSpecialItemIgnored_loop

    local_isSpecialItemIgnored_returnTrue:
        mov r0, #0x1

    local_isSpecialItemIgnored_returnFalse:
        pop {pc}


@ r0 = characterId, r1 = itemId
function_addMappedItem:
    push {r5, lr}
    mov r5, r0
    mov r0, r1
    bl function_getSpecialItemMapped

    lsr r1, r0, #0x8
    cmp r1, #0xD
    blt local_addMappedItem_isNormalItem
    beq local_addMappedItem_isCharacter
    cmp r1, #0xE
    beq local_addMappedItem_isPsynergy
    cmp r1, #0xF
    beq local_addMappedItem_isSummon

    mov r1, #0x80
    lsl r1, r1, #0x8
    sub r0, r0, r1
    bl thunk_addCoins
    b local_addMappedItem_end

    local_addMappedItem_isCharacter:
        lsl r0, r0, #0x1C
        lsr r0, r0, #0x1C
        mov r1, #0x1
        bl thunk_addPartyMember
        b local_addMappedItem_end

    local_addMappedItem_isPsynergy:
        lsl r0, r0, #0x18
        lsr r0, r0, #0x18
        bl thunk_addPsynergy
        b local_addMappedItem_end

    local_addMappedItem_isSummon:
        mov r1, #0xFF
        and r0, r1
        bl thunk_unlockSummon
        b local_addMappedItem_end

    local_addMappedItem_isNormalItem:
        mov r1, r5
        bl thunk_addItemToCharacter

    local_addMappedItem_end:
        pop {r5, pc}


@ r0 = listPointer
function_addMappedItemList:
    push {r5, lr}
    mov r5, r0

    local_addMappedItemList_loop:
        ldrh r0, [r5, #0]
        ldrh r1, [r5, #2]
        cmp r1, #0x0
        beq local_addMappedItemList_end
        bl function_addMappedItem
        add r5, #0x4
        b local_addMappedItemList_loop

    local_addMappedItemList_end:
        pop {r5, pc}


@ r0 = character, r1 = djinniElement, r2 = djinniId
function_addMappedDjinniToCharacter:
    push {r5-r7, lr}
    mov r5, r0

    mov r0, #0x24
    mul r0, r1
    add r0, r0, r2
    add r0, r0, r2

    ldr r1, ptr_djinnMapping
    ldrb r6, [r1, r0]
    add r0, #0x1
    ldrb r7, [r1, r0]

    mov r0, #0x14
    mul r0, r6
    add r0, r0, r7
    add r0, #0x30
    bl thunk_setFlag

    mov r0, r5
    mov r1, r6
    mov r2, r7
    bl thunk_addDjinniToCharacter
    mov r0, r5
    mov r1, r6
    mov r2, r7
    bl thunk_setDjinniSet

    pop {r5-r7, pc}


@ r0 = character, r1 = djinniElement
function_addReunionDjinn:
    push {r5-r7, lr}
    mov r5, #0x1
    mov r6, r0
    mov r7, r1

    mov r2, #0x0
    bl function_addMappedDjinniToCharacter

    local_addReunionDjinn_loop:
        mov r0, r6
        mov r1, r7
        mov r2, r5
        bl function_addMappedDjinniToCharacter

        add r5, #0x1
        cmp r5, #0x6
        blt local_addReunionDjinn_loop

    pop {r5-r7, pc}


@ r0 = itemId
function_loadItemIconMapped:
    push {lr}
    ldr r1, ptr_mapNumber
    ldr r1, [r1, #0x0]
    ldr r2, data_itemMapping_ignoreIcon
    cmp r1, r2
    beq local_loadItemIconMapped_ignoreIcon
    bl function_getSpecialItemMapped

    local_loadItemIconMapped_ignoreIcon:
        bl function_loadItemIcon
        pop {pc}


@ r0 = itemId
function_loadItemIcon:
    push {r5, lr}
    lsl r0, r0, #0x10
    lsr r0, r0, #0x10

    lsr r5, r0, #0x8
    cmp r5, #0xA
    bge local_loadItemIcon_isPseudo

    bl thunk_loadItemIcon
    pop {r5, pc}

    local_loadItemIcon_isPseudo:
        ldr r1, ptr_iconMapping

        local_loadItemIcon_loop:
            ldrh r2, [r1, #0x0]
            cmp r0, r2
            beq local_loadItemIcon_break
            add r1, #0x4
            b local_loadItemIcon_loop

        local_loadItemIcon_break:
            ldrh r0, [r1, #0x2]
            mov r1, #0x1
            cmp r5, #0xA
            bne local_loadItemIcon_isNotArchipelago
            mov r1, #0x0

        local_loadItemIcon_isNotArchipelago:
            bl thunk_loadAbilityIcon

        pop {r5, pc}

@ =============================

.thunk thunk_setFlag, #0x08016CFD
.thunk thunk_loadItemIcon, #0x0803D92D
.thunk thunk_loadAbilityIcon, #0x0803D9BD
.thunk thunk_addItemToCharacter, #0x080AE6C9
.thunk thunk_addPsynergy, #0x080AF6F5
.thunk thunk_addCoins, #0x080AFEB1
.thunk thunk_addDjinniToCharacter, #0x080B0B79
.thunk thunk_setDjinniSet, #0x080B0C9D

ptr_djinnMapping:
    .pointer #0x08FA0000

ptr_itemMapping_specialLocationMapping:
    .pointer #0x08FA00A0

ptr_mapNumber:
    .pointer #0x02000420

ptr_itemMapping_specialLocations:
    .pointer data_itemMapping_specialLocations

ptr_itemMapping_ignoreList:
    .pointer data_itemMapping_ignoreList

ptr_iconMapping:
    .pointer data_iconMapping

data_itemMapping_ignoreIcon:
    .word #0x001700BC