import type { RomData } from "../rom";

const NEWLINE = 0x1A0C;
const randomiserVersion = process.env.npm_package_version ?? '?';

//TODO: Confirm with the PopTracker people whether they want to be credited under "Tracker Development" too
const creditsText : string[] = [
    "GS2 RANDOMISER",
    "Version " + randomiserVersion,
    "", "",
    "Development", "",
    "Karanum", "Neomatamune", "zadeta656",
    "", "",
    "Original Randomiser", "",
    "MarvinXLII",
    "", "",
    "Archipelago Support", "",
    "Dragion", "Platano Bailando", "YutskiLGC",
    "", "",
    "Tracker Development", "",
    "Cougars", "Karanum", "Neomatamune",
    "", "",
    "Special Thanks", "",
    "Aile / FlameUser64", "Atrius (GS2 Editor)", "pokemariosun", "Plexa", "Salanewt", "Teawater", "", 
    "And everyone over at the", "GS Speedrunning Discord", "(discord.gg/QWwxrmN)",
    "", "", "",
    "Visit us at:", "gs2randomiser.com", ""
]

function writeString(rom : RomData, addr : number, str : string) : [number, number] {
    for (let i = 0; i < str.length; ++i) {
        rom.writeByte(addr + i, str.charCodeAt(i));
    }
    rom.writeByte(addr + str.length, 0);
    return [addr, addr + str.length + 1];
}

export function writeToRom(rom : RomData) {
    rom.writeHalfword(0x1A0BC8, 0x3400);
    rom.writeHalfword(0x1A0DEC, 0x3400);
    rom.writeHalfword(0x1A0F60, 0x3400);

    const oldCredits = rom.readBlock(0x1A20BC, 828);
    rom.writeBlock(0x1A3400, oldCredits.getData());

    const textCache : Record<string, number> = {};
    let textPos = 0x1A3000;
    let pointerPos = 0x1A373C;

    creditsText.forEach(line => {
        let pointer = 0;
        if (line == '') {
            pointer = NEWLINE;
        } else {
            pointer = textCache[line];
            if (pointer == undefined || pointer == 0) {
                [pointer, textPos] = writeString(rom, textPos, line);
                textCache[line] = pointer;
            }
        }

        rom.writeWord(pointerPos, pointer + 0x08000000);
        pointerPos += 4;
    });
    
    rom.writeByte(pointerPos, 0xFF);
}