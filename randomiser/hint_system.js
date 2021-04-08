const textutil = require ('./textutil.js');

const itemHints = {

};

const multiHints = {
    "Alhafra": "in a port city struck\x03by disaster",
    "Cliffs": "on the cliffs that\x03divide the land",
    "Eastern Sea": "on an island in\x03the Eastern Sea",
    "Gabomba": "within the bowels\x03of a revered statue",
    "Settlement": "within a small\x03settlement of little note",
    "Western Sea": "on an island in\x03the Western Sea"
};

const mapHints = {
    "Air's Rock": "at a sacred place of\x03abundant Jupiter energy",
    "Anemos Inner Sanctum": "deep inside the\x03moonlit ruins",
    "Angara Cavern": "inside a cave in\x03northern Angara",
    "Ankohl Ruins": "inside the tower\x03of the forgemasters",
    "Apojii Islands": "in a paradise at\x03the edge of the world",
    "Aqua Rock": "at a sacred place of\x03abundant Mercury energy",
    "Atteka Cavern": "inside a cave on\x03the continent of Atteka",
    "Atteka Inlet": "at the shore where\x03you first take flight",
    "Champa": "at the site of\x03the ancient forge",
    "Contigo": "in the town where\x03the moon rose",
    "Daila": "in the town where the\x03sea god is worshipped",
    "Dehkan Plateau": "on the plateau near\x03where the journey begins",
    "Gaia Rock": "at a sacred place of\x03abundant Venus energy",
    "Garoh": "in the town where\x03not just the wind howls",
    "Indra Cavern": "inside a cave on\x03the continent of Indra",
    "Islet Cave": "",
    "Izumo": "",
    "Jupiter Lighthouse": "within the mighty\x03seal of Jupiter",
    "Kandorean Temple": "",
    "Kibombo": "",
    "Kibombo Mountains": "",
    "Lemuria": "",
    "Lemurian Ship": "",
    "Loho": "",
    "Madra": "",
    "Madra Catacombs": "",
    "Magma Rock": "at a sacred place of\x03abundant Mars energy",
    "Mars Lighthouse": "within the mighty\x03seal of Mars",
    "Mikasalla": "",
    "Naribwe": "",
    "Osenia Cavern": "",
    "Overworld": "somewhere beneath\x03the ocean waves",
    "Prox": "",
    "Shrine of the Sea God": "",
    "Shaman Village": "",
    "Taopo Swamp": "",
    "Treasure Isle": "",
    "Tundaria Tower": "",
    "Yallam": "",
    "Yampi Desert": "",
    "Yampi Desert Cave": "",

    "Alhafra": multiHints["Alhafra"], "Alhafran Cave": multiHints["Alhafra"], "Gondowan Cliffs": multiHints["Cliffs"], 
    "Osenia Cliffs": multiHints["Cliffs"], "E Tundaria Islet": multiHints["Eastern Sea"], "N Osenia Islet": multiHints["Eastern Sea"], 
    "SE Angara Islet": multiHints["Eastern Sea"], "Sea of Time Islet": multiHints["Eastern Sea"], "W Indra Islet": multiHints["Eastern Sea"],
    "Gabomba Catacombs": multiHints["Gabomba"], "Gabomba Statue": multiHints["Gabomba"], "Gondowan Settlement": multiHints["Settlement"], 
    "Hesperia Settlement": multiHints["Settlement"], "Kalt Island": multiHints["Western Sea"], "SW Atteka Islet": multiHints["Western Sea"],
};

function getKeyItemCount(itemLocs, mapName) {
    var count = 0;
    for (var flag in itemLocs) {
        if (!itemLocs.hasOwnProperty(flag)) continue;
        var item = itemLocs[flag][0];
        if (item['isKeyItem'] && item['mapName'] == mapName)
            ++count;
    }
    return count;
}

function getSphereDepth(spheres, itemLocs, itemName) {
    for (var i = 0; i < spheres.length; ++i) {
        for (var j = 0; j < spheres[i].length; ++j) {
            var flag = spheres[i][j];
            var item = itemLocs[flag][0];
            if (item['name'] == itemName) return i;
        }
    }
    return -1;
}

function pickRandomSlot(prng, spheres, depth) {
    var targetDepth = depth;
    for (var i = depth + 1; i < spheres.length; ++i) {
        targetDepth = i;
        if (prng.random() < 0.4) break;
    }
    var sphere = spheres[targetDepth];
    return sphere[Math.floor(prng.random() * sphere.length)];
}

function makeItemHint(item) {
    var itemHint = itemHints[item['name']] || item['name'] || "???";
    var mapHint = mapHints[item['mapName']] || ("in " + item['mapName']) || "???";
    return itemHint + "...\x01awaits " + mapHint + ".";
}

function getHintIndra(prng, type, spheres, itemLocs) {
    if (type == 0) {
        var depth = getSphereDepth(spheres, itemLocs, "Whirlwind");
        var item = itemLocs[pickRandomSlot(prng, spheres, depth)][0];
        return makeItemHint(item) + "\x02";
    } else if (type == 1) {
        var numKeyItems = getKeyItemCount(itemLocs, "Gaia Rock");
        return "There are " + numKeyItems + " important\x03items in Gaia Rock.\x02";
    } else {
        var item = itemLocs["0x8c7"][0];
        if (item['isKeyItem']) {
            return "The top of the Sea God's tower\x03holds a treasure of importance.\x02";
        } else {
            return "The top of the Sea God's tower\x03does not have anything of value.\x02";
        }
    }
}

function getHintOsenia(prng, type, spheres, itemLocs) {
    if (type == 0) {
        var depth = getSphereDepth(spheres, itemLocs, "Reveal");
        var item = itemLocs[pickRandomSlot(prng, spheres, depth)][0];
        return makeItemHint(item) + "\x02";
    } else if (type == 1) {
        var numKeyItems = getKeyItemCount(itemLocs, "Air's Rock");
        return "There are " + numKeyItems + " important\x03items in Air's Rock.\x02";
    } else {
        var item = itemLocs["0x8d4"][0];
        if (item['isKeyItem']) {
            return "The room that guards the unseen\x03holds a treasure of great importance.\x02";
        } else {
            return "The room that guards the unseen\x03does not have anything of value.\x02";
        };
    }
}

function getHintGondowan(prng, type, spheres, itemLocs) {
    if (type == 0) {
        var depth = Math.max(getSphereDepth(spheres, itemLocs, "Lash Pebble"),
            getSphereDepth(spheres, itemLocs, "Scoop Gem"), getSphereDepth(spheres, itemLocs, "Pound Cube"));
        var item = itemLocs[pickRandomSlot(prng, spheres, depth)][0];
        return makeItemHint(item) + "\x02";
    } else if (type == 1) {
        var numKeyItems = getKeyItemCount(itemLocs, "Magma Rock");
        return "There are " + numKeyItems + " important\x03items in Magma Rock.\x02";
    } else {
        var item = itemLocs["0xf93"][0];
        if (item['isKeyItem']) {
            return "The depths of our great statue\x03hold a treasure of great importance.\x02";
        } else {
            return "The depths of our great statue\x03do not have anything of value.\x02";
        };
    }
}

function getHintLemuria(prng, type, spheres, itemLocs) {
    if (type == 0) {
        var depth = Math.min(getSphereDepth(spheres, itemLocs, "Grindstone"), getSphereDepth(spheres, itemLocs, "Trident"));
        var item = itemLocs[pickRandomSlot(prng, spheres, depth)][0];
        return makeItemHint(item) + "\x02";
    } else if (type == 1) {
        var numKeyItems = getKeyItemCount(itemLocs, "Aqua Rock");
        return "There are " + numKeyItems + " important\x03items in Aqua Rock.\x02";
    } else {
        var item = itemLocs["0x978"][0];
        if (item['isKeyItem']) {
            return "The mistress of the great forge\x03holds a treasure of great importance.\x02";
        } else {
            return "The mistress of the great forge\x03does not have anything of value.\x02";
        };
    }
}

function getHintAtteka(prng, type, spheres, itemLocs) {
    if (type == 0) {
        var depth = getSphereDepth(spheres, itemLocs, "Grindstone");
        var item = itemLocs[pickRandomSlot(prng, spheres, depth)][0];
        return makeItemHint(item) + "\x02";
    } else if (type == 1) {
        var numKeyItems = getKeyItemCount(itemLocs, "Jupiter Lighthouse");
        return "There are " + numKeyItems + " important\x03items in Jupiter Lighthouse.\x02";
    } else {
        var item = itemLocs["0x17"][0];
        if (item['isKeyItem']) {
            return "The flooded southern cave\x03holds a treasure of great importance.\x02";
        } else {
            return "The flooded southern cave\x03does not have anything of value.\x02";
        };
    }
}

function getHintProx(prng, type, spheres, itemLocs) {
    if (type == 0) {
        var depth = Math.max(getSphereDepth(spheres, itemLocs, "Grindstone"), getSphereDepth(spheres, itemLocs, "Magma Ball"));
        var item = itemLocs[pickRandomSlot(prng, spheres, depth)][0];
        return makeItemHint(item) + "\x02";
    } else if (type == 1) {
        var numKeyItems = getKeyItemCount(itemLocs, "Mars Lighthouse");
        return "There are " + numKeyItems + " important\x03items in Mars Lighthouse.\x02";
    } else {
        var item = itemLocs["0xa3a"][0];
        if (item['isKeyItem']) {
            return "The missing warriors of Prox\x03hold a treasure of great importance.\x02";
        } else {
            return "The missing warriors of Prox\x03do not have anything of value.\x02";
        };
    }
}

function randomHintType(prng) {
    return Math.max(1, Math.floor(prng.random() * 4)) - 1;
}

function writeHints(prng, lines, spheres, itemLocs) {
    var hint = getHintIndra(prng, randomHintType(prng), spheres, itemLocs);
    textutil.writeLine(lines, 6055, hint);

    hint = getHintOsenia(prng, randomHintType(prng), spheres, itemLocs);
    textutil.writeLine(lines, 6797, hint);

    hint = getHintGondowan(prng, randomHintType(prng), spheres, itemLocs);
    textutil.writeLine(lines, 8191, hint);

    hint = getHintLemuria(prng, randomHintType(prng), spheres, itemLocs);
    textutil.writeLine(lines, 10362, hint);

    hint = getHintAtteka(prng, randomHintType(prng), spheres, itemLocs);
    textutil.writeLine(lines, 10455, hint);
    textutil.writeLine(lines, 11238, hint);

    hint = getHintProx(prng, randomHintType(prng), spheres, itemLocs);
    textutil.writeLine(lines, 11623, hint);
}

module.exports = {writeHints};