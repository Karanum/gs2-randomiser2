.offset #0x0200AFD4

push {r5-r6,lr}
sub sp, #0x8
mov r0, #0xD0
lsl r0, r0, #0x4
add r0, #0x5
lsl r5, r0, #0x0
bl #0x0200B150      @ readFlag
cmp r0, #0x0
bne end

bl #0x0200B1B8      @ startCutscene
bl #0x0200B2F8      @ startScreenTransition
bl #0x0200B308      @ waitForScreenTransition

ldr r0, ptr_mappedCharacter
mov r1, #0x0
ldrb r0, [r0, r1]
bl thunk_addPartyMember
lsl r0, r5, #0x0
bl #0x0200B158      @ writeFlag
ldr r5, ptr_inventoryItems
mov r6, #0x0

loop:
    ldrh r0, [r5, #0x0]
    ldrh r1, [r5, #0x2]
    cmp r1, #0x0
    beq break

    add r5, #0x4
    cmp r0, #0x4
    bne loop

    bl thunk_addMappedItem
    b loop

break:
    cmp r6, #0x0
    bne pre_end

    mov r6, #0x1
    ldr r5, ptr_specialPsynergy
    b loop

pre_end:
    bl #0x0200B1C0  @ endCutscene

end:
    b #0x0200B10A 


.align 4

ptr_inventoryItems:
    .pointer #0x08FA00E0

ptr_specialPsynergy:
    .pointer #0x08FA0130

ptr_mappedCharacter:
    .pointer #0x08FA0188

.thunk thunk_addPartyMember, #0x090060BD
.thunk thunk_addMappedItem, #0x09005039