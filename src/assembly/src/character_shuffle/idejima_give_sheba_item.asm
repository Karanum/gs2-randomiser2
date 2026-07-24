.offset #0x020082B4
.export inject_objectId


    push {r5, lr}
    bl #0x0200B1B8  @ startCutscene
    mov r0, #0x0
    bl #0x0200B310  @ setPsynergyState

    ldr r0, ptr_mappedItem
    ldrh r0, [r0, #0x0]
    mov r5, r0
    bl thunk_checkMappedItem
    cmp r0, #0x1
    beq skip

    mov r0, #0x53
    bl thunk_playSound
    bl thunk_addItem

skip:
    inject_objectId:
        mov r0, #0xFF
    mov r1, #0x0
    mov r2, #0x0
    bl thunk_setPosition

    mov r0, #0xD0
    lsl r0, r0, #0x4
    add r0, #0x6
    bl #0x0200B158  @ setFlag
    bl #0x0200B1C0  @ endCutscene

pop {r5, pc}


.thunk thunk_setPosition, #0x080C80F9
.thunk thunk_playSound, #0x081C0CB1
.thunk thunk_addItem, #0x09000207
.thunk thunk_checkMappedItem, #0x09006001

ptr_mappedItem:
    .pointer #0x08FA018A