const textutil = require('../../game_logic/textutil.js');
const { setBasicNpc } = require('../../../util/npcWriter.js');

/**
 * Applies this patch to the map code
 * @param {MapCodeData} mapCode The map code data instance
 * @param {string[]} text The text data instance
 * @param {Object.<string, number>} settings The settings object
 */
function apply(mapCode, text, settings) {
    mapCode[1616][0] = true;

    //Add NPCs for general info and Retreat info
    setBasicNpc(mapCode[1616][1], 0x3844, 0x391C, 8, 0x9D, 0xFFFF, 1, 0x190, 0, 0x2A8, 4, 1, 0x1570);
    setBasicNpc(mapCode[1616][1], 0x385C, 0x3934, 9, 0xDC, 0xFFFF, 1, 0x160, 0, 0x278, 4, 1, 0x1572);

    //Add NPCs for Avoid info and the hint system if these are enabled in the settings
    //If both settings are enabled, an extra row needs to be added to the event table to make space
    var npcAddr = 0x3874, eventAddr = 0x394C, npcId = 10;
    if (settings['avoid-patch']) {
        setBasicNpc(mapCode[1616][1], npcAddr, eventAddr, npcId++, 0x83, 0xFFFF, 1, 0x120, 0, 0x280, 4, 1, 0x1574);
        npcAddr += 0x18;
        eventAddr += 0x18;
    }
    if (settings['qol-hints']) {
        if (settings['avoid-patch'])
            mapCode[1616][1].splice(0x3970, 0, ...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        setBasicNpc(mapCode[1616][1], npcAddr, eventAddr, npcId++, 0x79, 0xFFFF, 1, 0x100, 0, 0x280, 4, 1, 0x1576);
    }

    //Add lines for the new NPCs to the text data
    //These lines overwrite part of the Venus Lighthouse opening cutscene
    textutil.writeLine(text, 0x1570, "Thanks for playing this\x03randomiser! I'm Karanum,\x03the developer.\x01If you're new, make sure\x03to check the help pages\x03on the website.\x01Also, if you get stuck, holding\x03L and Start while selecting which\x03save file to load can help.\x02");
    textutil.writeLine(text, 0x1571, "Hey now,\x03no peeking!\x01You'll get to see what I'm working\x03on when it's ready!\x02");
    textutil.writeLine(text, 0x1572, "Did you know Retreat has\x03been changed big time in\x03this randomiser?\x01Using it on the overworld lets\x03you teleport to any location\x03you've visited.\x01You can even use Retreat\x03in towns now, so you\x03can get around faster!\x02");
    textutil.writeLine(text, 0x1573, "I feel a sudden urge\x03to yell and break pots.\x02");
    textutil.writeLine(text, 0x1574, "Avoid is now a toggle.\x01Use it once, no encounters.\x01Use it again, encounters.\x01Not based on level anymore.\x01Easy.\x02");
    textutil.writeLine(text, 0x1575, "Man, I'm so nervous.\x03I'm really bad at small talk.\x02");
    textutil.writeLine(text, 0x1576, "I see you've enabled the\x03hint system. Good choice.\x01There are six characters\x03who will give you hints\x03about this seed.\x01There's Master Poi, Master Maha,\x03Akafubu, King Hydros, and the\x03Proxian elder.\x01Oh, and that corn seller guy\x03in Contigo, as well.\x02");
    textutil.writeLine(text, 0x1577, "I shall reign supreme.\x02");
}

module.exports = {apply};

/**
 * @typedef {Object.<string, MapCodeEntry>} MapCodeData
 */