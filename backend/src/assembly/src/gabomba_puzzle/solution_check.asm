.offset #0x0200D260

push {lr}
mov r0, #0xA0
lsl r0, r0, #0x1
bl #0x0200D754      @ setTextIndex
mov r0, #0x17
mov r1, #0x0
bl #0x0200D75C      @ showDialogue
mov r0, #0x4
mov r1, #0x1
bl #0x0200D6C4      @ showChoice
cmp r0, #0x0
bne onChoiceNo

@ If the player answers "Yes", run the solution checker
bl #0x02008FC0

onChoiceNo:
pop {pc}