const NEWLINE = 0x1A0C;

const nodePackage = require('../../package.json');

function writeString(target, pos, string) {
    let addr = pos.addr;
    for (var i = 0; i < string.length; ++i) {
        target[addr + i] = string.charCodeAt(i);
    }

    pos.addr += string.length + 1;
    return addr;
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

    let pos = { addr: 0x1A3000 };
    
    const randoTitle = writeString(target, pos, "GS2 RANDOMISER");
    const randoVersion = writeString(target, pos, "Version " + nodePackage.version);
    const headerDevelopment = writeString(target, pos, "Development");
    const headerOriginalDev = writeString(target, pos, "Original Randomiser");
    const headerSpecialThanks = writeString(target, pos, "Special Thanks");
    const headerArchipelago = writeString(target, pos, "Archipelago Support");
    const headerTracker = writeString(target, pos, "Tracker Development");

    const nameKaranum = writeString(target, pos, "Karanum");
    const nameMarvin = writeString(target, pos, "MarvinXLII");
    const nameTeawater = writeString(target, pos, "Teawater");
    const nameSalanewt = writeString(target, pos, "Salanewt");
    const nameAtrius = writeString(target, pos, "Atrius (GS2 Editor)");
    const nameAile = writeString(target, pos, "Aile / FlameUser64");
    const namePokemario = writeString(target, pos, "pokemariosun");
    const nameCougars = writeString(target, pos, "Cougars");
    const nameDragion = writeString(target, pos, "Dragion");
    const namePlatano = writeString(target, pos, "Platano Bailando");
    const nameNeo = writeString(target, pos, "Neomatamune");
    const namePlexa = writeString(target, pos, "Plexa");
    // TODO: Contact other AP contributors about whether they would like to be added

    const lineDiscord1 = writeString(target, pos, "And everyone over at the");
    const lineDiscord2 = writeString(target, pos, "GS Speedrunning Discord");
    const lineDiscord3 = writeString(target, pos, "(discord.gg/QWwxrmN)");
    const lineWebsite1 = writeString(target, pos, "Visit us at:");
    const lineWebsite2 = writeString(target, pos, "gs2randomiser.com");    

    copyCredits(target, 0x1A20BC, 0x1A3400, 828);
    writePointers(target, 0x1A373C, [
        NEWLINE, NEWLINE, NEWLINE, NEWLINE, NEWLINE,
        randoTitle, randoVersion, NEWLINE, NEWLINE,
        headerDevelopment, NEWLINE, nameKaranum, NEWLINE, NEWLINE,
        headerOriginalDev, NEWLINE, nameMarvin, NEWLINE, NEWLINE,
        headerArchipelago, NEWLINE, nameDragion, namePlatano, NEWLINE, NEWLINE,
        headerTracker, NEWLINE, nameCougars, nameKaranum, nameNeo, NEWLINE, NEWLINE,
        headerSpecialThanks, NEWLINE, nameAile, nameAtrius, namePokemario, namePlexa, nameSalanewt, nameTeawater, NEWLINE,
        lineDiscord1, lineDiscord2, lineDiscord3, NEWLINE, NEWLINE, NEWLINE,
        lineWebsite1, lineWebsite2, NEWLINE
    ]);
}

module.exports = {writeToRom};