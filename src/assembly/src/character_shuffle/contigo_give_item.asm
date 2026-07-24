.offset #0x02009D98

    push {r5-r7, lr}
    mov r6, r0
    sub r0, #0x8
    mov r7, r0

    bl #0x0200C06C              @ startCutscene
    mov r0, #0x0
    bl #0x0200C204              @ setPsynergyState

    mov r0, #0xA0
    lsl r0, r0, #0x4
    add r0, #0x21
    bl #0x0200BFC4              @ readFlag
    cmp r0, #0x0
    bne skip_flagSet

    mov r0, #0x2B
    lsl r0, r0, #0x8
    add r0, #0x5E
    bl #0x0200C12C              @ setTextIndex            

    mov r0, r6
    mov r1, #0x0
    bl #0x0200C144              @ showDialogue
    b end

skip_flagSet:
    ldr r0, ptr_mappedItem
    mov r1, r7
    lsl r1, r1, #0x1
    ldrh r0, [r0, r1]
    mov r5, r0
    bl thunk_checkMappedItem
    cmp r0, #0x1
    beq skip_isPseudoItem

    mov r0, #0x53
    bl thunk_playSound
    bl thunk_addItem
    cmp r0, #0x0
    blt skip_inventoryFull

skip_isPseudoItem:
    mov r0, r6
    mov r1, #0x0
    mov r2, #0x0
    bl thunk_setPosition              

    mov r0, #0xD0
    lsl r0, r0, #0x4
    add r0, r0, r7
    bl #0x0200BFCC              @ setFlag
    b end

skip_inventoryFull:
    mov r0, #0xE2
    lsl r0, r0, #0x4
    mov r1, #0x0
    bl #0x0200C034              @ showStatusText

end: @ 9E0C
    bl #0x0200C074              @ endCutscene
    pop {r5-r7, pc}


.thunk thunk_setPosition, #0x080C80F9
.thunk thunk_playSound, #0x081C0CB1
.thunk thunk_addItem, #0x09000207
.thunk thunk_checkMappedItem, #0x09006001

ptr_mappedItem:
    .pointer #0x08FA0180