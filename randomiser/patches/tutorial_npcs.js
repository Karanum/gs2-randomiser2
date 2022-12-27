const textutil = require('./../game_logic/textutil.js');

function apply(mapCode, text, settings) {
    mapCode[1616][0] = true;

    setNpc(mapCode[1616][1], 0x3844, 0x391C, 8, 0x9D, 0xFFFF, 1, 0x190, 0, 0x2A8, 4, 1, 0x1570);
    setNpc(mapCode[1616][1], 0x385C, 0x3934, 9, 0xDC, 0xFFFF, 1, 0x160, 0, 0x278, 4, 1, 0x1572);

    var npcAddr = 0x3874, eventAddr = 0x394C, npcId = 10;
    if (settings['avoid-patch']) {
        setNpc(mapCode[1616][1], npcAddr, eventAddr, npcId++, 0x83, 0xFFFF, 1, 0x120, 0, 0x280, 4, 1, 0x1574);
        npcAddr += 0x18;
        eventAddr += 0x18;
    }
    if (settings['qol-hints']) {
        if (settings['avoid-patch'])
            mapCode[1616][1].splice(0x3970, 0, ...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        setNpc(mapCode[1616][1], npcAddr, eventAddr, npcId++, 0x79, 0xFFFF, 1, 0x100, 0, 0x280, 4, 1, 0x1576);
    }

    textutil.writeLine(text, 0x1570, "Thanks for playing this\x03randomiser! I'm Karanum,\x03the developer.\x01If you're new, make sure\x03to check the help pages\x03on the website.\x01Also, if you get stuck, holding\x03L and Start while selecting which\x03save file to load can help.\x02");
    textutil.writeLine(text, 0x1571, "Hey now,\x03no peeking!\x01You'll get to see what I'm working\x03on when it's ready!\x02");
    textutil.writeLine(text, 0x1572, "Did you know Retreat has\x03been changed big time in\x03this randomiser?\x01Using it on the world map lets\x03you teleport to any location\x03you've visited.\x01You can even use it in towns\x03now so you can get around faster!\x02");
    textutil.writeLine(text, 0x1573, "Haaah! Hiyaaaaah!\x02");
    textutil.writeLine(text, 0x1574, "Avoid is now a toggle.\x01Use it once, no encounters.\x01Use it again, encounters.\x01Easy.\x02");
    textutil.writeLine(text, 0x1575, "Man, I'm so nervous.\x03These guys are my heroes.\x03I don't know what to say.\x02");
    textutil.writeLine(text, 0x1576, "I see you've enabled the\x03hint system. Good choice.\x01There are six characters\x03who will give you hints\x03about this seed.\x01There's Master Poi, Master Maha,\x03Akafubu, King Hydros, and the\x03Proxian elder.\x01Oh, and that corn seller guy\x03in Contigo, as well.\x02");
    textutil.writeLine(text, 0x1577, "I shall reign supreme.\x02");
}

function setNpc(mapCode, npcOffset, eventOffset, eventId, sprite, flag, idleScript, x, z, y, direction, flags, dialogue) {
    offset = npcOffset;
    mapCode[offset++] = sprite & 0xFF;
    mapCode[offset++] = sprite >> 8;
    mapCode[offset++] = flag & 0xFF;
    mapCode[offset++] = flag >> 8;
    mapCode[offset++] = idleScript & 0xFF;
    mapCode[offset++] = (idleScript >> 8) & 0xFF;
    mapCode[offset++] = (idleScript >> 16) & 0xFF;
    mapCode[offset++] = idleScript >> 24;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = x & 0xFF;
    mapCode[offset++] = x >> 8;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = z & 0xFF;
    mapCode[offset++] = z >> 8;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = y & 0xFF;
    mapCode[offset++] = y >> 8;
    mapCode[offset++] = 0;
    mapCode[offset++] = (direction & 0xF) << 4;
    mapCode[offset++] = flags & 0xFF;
    mapCode[offset++] = flags >> 8;

    offset = eventOffset;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = eventId & 0xFF;
    mapCode[offset++] = 0;
    mapCode[offset++] = flag & 0xFF;
    mapCode[offset++] = flag >> 8;
    mapCode[offset++] = dialogue & 0xFF;
    mapCode[offset++] = dialogue >> 8;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;

    mapCode[offset++] = 0x15;
    mapCode[offset++] = 0x8D;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
    mapCode[offset++] = eventId & 0xFF;
    mapCode[offset++] = 0;
    mapCode[offset++] = flag & 0xFF;
    mapCode[offset++] = flag >> 8;
    mapCode[offset++] = (dialogue + 1) & 0xFF;
    mapCode[offset++] = (dialogue + 1) >> 8;
    mapCode[offset++] = 0;
    mapCode[offset++] = 0;
}

module.exports = {apply};