.offset #0x09000800
.export function_initStartingParty
.export function_initPiers
.export function_initReunion
.export function_giveMappedDjinni


function_initStartingParty:
    push {r7}
    push {lr}
    bl thunk_unknownAE0FA
    mov r0, #0x5
    bl thunk_initPartyMember
    mov r0, #0x6
    bl thunk_initPartyMember
    mov r0, #0x41
    bl thunk_unknownAF298

    ldr r5, ptrInventoryMapping
    bl function_giveMappedList
    ldr r5, ptrExtraPsynergy
    bl function_giveMappedList
    pop {r7}


function_initPiers:
    push {r5-r7, lr}
    mov r7, #7
    mov r0, #1
    mov r1, #9
    bl function_giveMappedDjinni
    mov r0, #0
    mov r1, #10
    bl function_giveMappedDjinni

    ldr r5, ptrInventoryMappingPiers
    bl function_giveMappedList
    mov r0, #7
    bl thunk_calculateStats
    pop {r5-r7, pc}


function_initReunion:
    push {r5-r7, lr}
    mov r0, #0
    mov r7, #0
    bl function_giveReunionDjinn
    mov r0, #2
    mov r7, #1
    bl function_giveReunionDjinn
    mov r0, #3
    mov r7, #2
    bl function_giveReunionDjinn
    mov r0, #1
    mov r7, #3
    bl function_giveReunionDjinn

    ldr r5, ptrInventoryMappingReunion
    bl function_giveMappedList
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
    pop {r5-r7, pc}


function_giveMappedList:
    push {lr}

    local_giveMappedList_loopStart:
        ldrh r0, [r5, #0]
        ldrh r1, [r5, #2]
        cmp r1, #0
        beq local_giveMappedList_end
        bl function_giveMappedItem
        add r5, #4
        b local_giveMappedList_loopStart

    local_giveMappedList_end:
        pop {pc}


function_giveReunionDjinn:
    push {lr}
    mov r8, r0
    mov r1, #0
    bl function_giveMappedDjinni
    mov r0, r8
    mov r1, #1
    bl function_giveMappedDjinni
    mov r0, r8
    mov r1, #2
    bl function_giveMappedDjinni
    mov r0, r8
    mov r1, #3
    bl function_giveMappedDjinni
    mov r0, r8
    mov r1, #4
    bl function_giveMappedDjinni
    mov r0, r8
    mov r1, #5
    bl function_giveMappedDjinni
    pop {pc}


function_giveMappedDjinni:
    push {lr}
    ldr r5, ptrDjinniMapping
    mov r2, #0x24
    mul r0, r2
    add r2, r1, r1
    add r0, r2
    ldrb r6, [r5, r0]
    add r0, #1
    ldrb r5, [r5, r0]

    mov r0, #0x14
    mul r0, r5
    add r0, r6
    add r0, #0x30
    bl thunk_setFlag

    mov r0, r7
    mov r1, r5
    mov r2, r6
    bl thunk_unknownB0B78
    mov r0, r7
    mov r1, r5
    mov r2, r6
    bl thunk_unknownB0C9C
    pop {pc}


@ =============================


.align 4

ptrDjinniMapping:
    .pointer #0x08FA0000

ptrInventoryMapping:
    .pointer #0x08FA00E0

ptrInventoryMappingPiers:
    .pointer #0x08FA0100

ptrInventoryMappingReunion:
    .pointer #0x08FA010C

ptrExtraPsynergy:
    .pointer #0x08FA0130

.thunk thunk_setFlag, #0x08016CFD
.thunk thunk_calculateStats, #0x080AD3F9
.thunk thunk_unknownADF4A, #0x080ADF4B
.thunk thunk_unknownAE0FA, #0x080AE0FB
.thunk thunk_initPartyMember, #0x080AFDD9
.thunk thunk_unknownAF298, #0x080AF299
.thunk thunk_unknownB0B78, #0x080B0B79
.thunk thunk_unknownB0C9C, #0x080B0C9D

.thunk function_giveMappedItem, #0x09005039