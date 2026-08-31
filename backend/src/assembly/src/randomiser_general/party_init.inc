.export function_initStartingParty
.export function_initPiers
.export function_initReunionParty


function_initStartingParty:
    push {lr}
    bl thunk_initIdejimaParty

    mov r0, #0x5
    bl thunk_initPartyMember
    mov r0, #0x6
    bl thunk_initPartyMember
    mov r0, #0x41
    bl thunk_removeItem         @ Removes the Shaman's Rod from Felix's starting inventory

    ldr r0, ptr_startingInventoryMapping
    bl function_addMappedItemList
    ldr r0, ptr_startingPsynergy
    bl function_addMappedItemList

    pop {pc}


function_initPiers:
    push {lr}
    
    mov r0, #0x7
    mov r1, #0x1
    mov r2, #0x9
    bl function_addMappedDjinniToCharacter

    mov r0, #0x7
    mov r1, #0x1
    mov r2, #0xA
    bl function_addMappedDjinniToCharacter

    ldr r0, ptr_startingInventoryMapping
    add r0, #0x20
    bl function_addMappedItemList

    mov r0, #0x7
    bl thunk_calculateStats

    pop {pc}


function_initReunionParty:
    push {lr}
    mov r0, #0
    mov r1, #0
    bl function_addReunionDjinn
    mov r0, #2
    mov r1, #1
    bl function_addReunionDjinn
    mov r0, #3
    mov r1, #2
    bl function_addReunionDjinn
    mov r0, #1
    mov r1, #3
    bl function_addReunionDjinn

    ldr r0, ptr_startingInventoryMapping
    add r0, #0x2C
    bl function_addMappedItemList

    mov r0, #0
    bl thunk_calculateStats
    mov r0, #1
    bl thunk_calculateStats
    mov r0, #2
    bl thunk_calculateStats
    mov r0, #3
    bl thunk_calculateStats

    mov r0, #0
    bl thunk_initPartyMember
    mov r0, #1
    bl thunk_initPartyMember
    mov r0, #2
    bl thunk_initPartyMember
    mov r0, #3
    bl thunk_initPartyMember

    mov r0, #0x22
    bl thunk_setFlag
    pop {pc}


@ =============================

.thunk thunk_calculateStats, #0x080AD3F9
.thunk thunk_initIdejimaParty, #0x080AE0F1
.thunk thunk_initPartyMember, #0x080AFDD9
.thunk thunk_removeItem, #0x080AF299

ptr_startingInventoryMapping:
    .pointer #0x08FA00E0

ptr_startingPsynergy:
    .pointer #0x08FA0130