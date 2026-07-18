.offset #0x09006300
.export func_mainLoopScript_x19
.export func_mainLoopScript_x1F


func_mainLoopScript_x19:
    push {r0, lr}
    bl func_checkMultiworldBuffer
    cmp r0, #0x0
    bne common_abortScript
    pop {r0}
    bl thunk_mainLoopScript_x19
    pop {pc}

func_mainLoopScript_x1F:
    push {r0, lr}
    bl func_checkMultiworldBuffer
    cmp r0, #0x0
    bne common_abortScript
    pop {r0}
    bl thunk_mainLoopScript_x1F
    pop {pc}

common_abortScript:
    pop {r0, pc}

.thunk thunk_mainLoopScript_x19, #0x08027065
.thunk thunk_mainLoopScript_x1F, #0x08027E21


func_checkMultiworldBuffer:
    push {r5, lr}
    ldr r1, ptr_multiworldBuffer
    ldrh r0, [r1, #0x0]
    cmp r0, #0x0
    beq func_checkMultiworldBuffer_end

    mov r5, r0
    bl thunk_startCutscene
    bl thunk_getPartyLeader
    bl thunk_setNpcStateIdle

    mov r0, #0xE
    lsl r0, r0, #0x8
    add r0, #0x38
    mov r1, #0x0
    bl thunk_showStatusText

    mov r0, r5
    lsr r0, r0, #0x8
    cmp r0, #0xA
    beq func_checkMultiworldBuffer_handleMimic
    cmp r0, #0x80
    bge func_checkMultiworldBuffer_handleCoins
    b func_checkMultiworldBuffer_handleItem

    func_checkMultiworldBuffer_handleMimic:
        mov r0, r5
        mov r1, #0xFF
        and r0, r1
        mov r1, #0x28
        lsl r1, r1, #0x4
        add r1, #0xA
        add r0, r1
        ldr r1, ptr_encounterQueue
        strh r0, [r1, #0x0]
        bl func_clearMultiworldBuffer
        mov r0, #0x2
        ldr r1, ptr_encounterFlags
        strb r0, [r1, #0x0]
        bl thunk_endCutscene
        mov r0, #0x1
        b func_checkMultiworldBuffer_end

    func_checkMultiworldBuffer_handleCoins:
        mov r1, #0x80
        lsl r1, r1, #0x8
        sub r5, r5, r1
        mov r0, #0x53
        bl thunk_playSound
        mov r0, r5
        bl thunk_addCoins
        mov r0, r5
        mov r1, #0x5
        bl thunk_setTextVar
        mov r0, #0xE1
        lsl r0, r0, #0x4
        mov r1, #0x0
        bl thunk_showStatusText
        b func_checkMultiworldBuffer_cleanUp

    func_checkMultiworldBuffer_handleItem:
        mov r0, r5
        bl #0x09006000
        cmp r0, #0x1
        beq func_checkMultiworldBuffer_cleanUp

        mov r0, #0x53
        bl thunk_playSound
        bl #0x09000206
        cmp r0, #0x0
        bge func_checkMultiworldBuffer_cleanUp
        mov r0, r5
        bl thunk_addItemForced

    func_checkMultiworldBuffer_cleanUp:
        bl func_clearMultiworldBuffer
        bl thunk_endCutscene
        bl thunk_getPartyLeader
        bl thunk_setNpcStateControlled
        mov r0, #0x1

    func_checkMultiworldBuffer_end:
        pop {r5, pc}


func_clearMultiworldBuffer:
    push {lr}
    ldr r1, ptr_receivedItemCount
    ldrh r0, [r1, #0x0]
    add r0, #0x1
    strh r0, [r1, #0x0]
    mov r0, #0x0
    ldr r1, ptr_multiworldBuffer
    strh r0, [r1, #0x0]
    pop {pc}


.thunk thunk_startCutscene, #0x080D22A9
.thunk thunk_endCutscene, #0x080D2351
.thunk thunk_playSound, #0x081C0CB1
.thunk thunk_showStatusText, #0x08038041
.thunk thunk_addItemForced, #0x080D260D
.thunk thunk_getPartyLeader, #0x080CB8E9
.thunk thunk_setNpcStateIdle, #0x080235F9
.thunk thunk_setNpcStateControlled, #0x08023525
.thunk thunk_setTextVar, #0x0803CCD1
.thunk thunk_addCoins, #0x080AFEB1

ptr_multiworldBuffer:
    .pointer #0x02000A96

ptr_receivedItemCount:
    .pointer #0x02000A72

ptr_encounterQueue:
    .pointer #0x02030164

ptr_encounterFlags:
    .pointer #0x0200048B