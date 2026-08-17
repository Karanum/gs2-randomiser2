@ Common function for determining the highest number of Djinn on a character.
@ Used to determine whether the Djinn menu should be compacted because
@ the randomiser allows for larger Djinn imbalances than the vanilla game.

.offset #0x08131A00

    push {r5-r6, lr}

    mov r5, #0x0
    mov r6, #0x0

loop:
    mov r0, r5
    mov r1, #0x1
    neg r1, r1
    bl #0x080B0F5C          @ getCharacterDjinnCount

    cmp r0, r6
    ble skip_notHighest
    mov r6, r0

skip_notHighest:
    add r5, r5, #0x1
    cmp r5, #0x8
    blt loop

    mov r0, r6
    pop {r5-r6, pc}