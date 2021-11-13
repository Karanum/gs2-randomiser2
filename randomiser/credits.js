const NEWLINE = 0x1A0C;

function writeString(target, pos, string) {
    for (var i = 0; i < string.length; ++i) {
        target[pos + i] = string.charCodeAt(i);
    }
}

function writePointer(target, pos, pointer) {
    target[pos] = pointer & 0xFF;
    target[pos+1] = (pointer >> 8) & 0xFF;
    target[pos+2] = 0x1A;
    target[pos+3] = 0x08;
}

function writePointers(target, pos, pointers) {
    var currentPos = pos;
    pointers.forEach((p) => {
        writePointer(target, currentPos, p);
        currentPos += 4;
    });
    target[currentPos] = 0xFF;
}

function copyCredits(target, fromPos, toPos, length) {
    for (var i = 0; i < length; ++i) {
        target[toPos + i] = target[fromPos + i];
    }
}

function writeToRom(target) {
    target[0x1A0BC8] = 0x00;
    target[0x1A0BC9] = 0x34;
    target[0x1A0DEC] = 0x00;
    target[0x1A0DED] = 0x34;
    target[0x1A0F60] = 0x00;
    target[0x1A0F61] = 0x34;

    writeString(target, 0x1A3000, "GS2 RANDOMISER");
    writeString(target, 0x1A300F, "Version 1.1.1");
    writeString(target, 0x1A3020, "Development");
    writeString(target, 0x1A302C, "Original Randomiser");
    writeString(target, 0x1A3040, "Special Thanks");
    writeString(target, 0x1A304F, "Karanum");
    writeString(target, 0x1A3057, "MarvinXLII");
    writeString(target, 0x1A3062, "Teawater");
    writeString(target, 0x1A306B, "Salanewt");
    writeString(target, 0x1A3074, "Atrius (GS2 Editor)");
    writeString(target, 0x1A3088, "And everyone over at the");
    writeString(target, 0x1A30A1, "GS Speedrunning Discord");
    writeString(target, 0x1A30B9, "Visit us at:");
    writeString(target, 0x1A30C6, "gs2randomiser.com");
    writeString(target, 0x1A30D8, "(discord.gg/QWwxrmN)");
    writeString(target, 0x1A30ED, "Aile / FlameUser64");
    writeString(target, 0x1A3100, "pokemariosun");
    writeString(target, 0x1A310D, "Cougars");

    copyCredits(target, 0x1A20BC, 0x1A3400, 828);
    writePointers(target, 0x1A373C, [
        NEWLINE, NEWLINE, NEWLINE, NEWLINE, NEWLINE,
        0x3000, 0x300F, NEWLINE, NEWLINE,
        0x302C, NEWLINE, 0x3057, NEWLINE, NEWLINE,
        0x3020, NEWLINE, 0x304F, NEWLINE, NEWLINE,
        0x3040, NEWLINE, 0x3057, 0x3062, 0x306B, 0x3074, 0x30ED, 0x3100, 0x310D, NEWLINE,
        0x3088, 0x30A1, 0x30D8, NEWLINE, NEWLINE, NEWLINE,
        0x30B9, 0x30C6, NEWLINE
    ]);
}

module.exports = {writeToRom};