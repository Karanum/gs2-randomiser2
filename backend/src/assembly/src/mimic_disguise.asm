.offset #0x09000080
.export data_disguiseList

    add r0, #0x40
    cmp r7, #0x83
    beq skip_isGroundItem
    cmp r7, #0x81
    bne thunk_end

    lsl r1, r1, #0x1
    ldr r4, ptrDisguiseList
    ldrh r1, [r4, r1]

skip_isGroundItem:
    bl thunk_applyItemSprite

.thunk thunk_end, #0x080CEE01
.thunk thunk_applyItemSprite, #0x080D3B29

ptrDisguiseList:
    .pointer data_disguiseList

data_disguiseList:
    .hword #0x0
    .hword #0x0
    .hword #0x0
    .hword #0x0
    .hword #0x0
    .hword #0x0
    .hword #0x0
    .hword #0x0
    .hword #0x0
