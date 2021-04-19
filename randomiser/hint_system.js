const textutil = require ('./textutil.js');

const multiHints = {
    "Alhafra": "in a port city struck\x03by disaster",
    "Cliffs": "on the cliffs that\x03divide the land",
    "Eastern Sea": "on an island in\x03the Eastern Sea",
    "Gabomba": "within the bowels\x03of a revered statue",
    "Key": "A key item",
    "Madra": "in the town of\x03repeated misfortune",
    "Prong": "Part of some\x03oversized fork",
    "Settlement": "within a small\x03settlement of little note",
    "Summon": "A powerful ally brought\x03forth by elemental energy",
    "Western Sea": "on an island in\x03the Western Sea"
};

const itemHints = {
    "Aquarius Stone": "The azure stone that\x03leads the chosen one",
    "Black Crystal": "The orb that controls the\x03vessels of the ancients",
    "Blaze": "The power to manipulate\x03the raging flames",
    "Burst Brooch": "The power to break that\x03which blocks the way",
    "Carry Stone": "The power that both\x03lifts and moves",
    "Catch Beads": "The power to obtain that\x03which is just out of reach",
    "Cyclone Chip": "The power to clear the\x03obscuring undergrowth",
    "Dancing Idol": "A doll that never\x03ceases to move",
    "Douse Drop": "The power to cloud the\x03sky and nourish the soil",
    "Frost Jewel": "The power to create\x03great spires of ice",
    "Grindstone": "The power to turn even\x03the hardest rock to dust",
    "Growth": "The power to promote\x03the growth of plants",
    "Healing Fungus": "A fungus with\x03medicinal properties",
    "Hover Jade": "The power to walk\x03upon nothing but air",
    "Lash Pebble": "The power to connect\x03with coiling rope",
    "Laughing Fungus": "Something \x09\x04extremely\x07 important",
    "Lifting Gem": "The power to raise\x03boulders aloft",
    "Li'l Turtle": "A friend for\x03a lonesome fellow",
    "Magma Ball": "A very spicy meatball",
    "Mars Star": "The only one of four gems\x03that was not stolen",
    "Milk": "A prime source of calcium",
    "Mind Read": "The power to unlock\x03the secrets of the mind",
    "Mysterious Card": "A card containing\x03a font of knowledge",
    "Orb of Force": "The power to strike\x03with the power of Ki",
    "Parch": "The power to drain\x03bodies of water",
    "Pound Cube": "The power to strike\x03the ground with force",
    "Pretty Stone": "A gleaming stone\x03admired by friend and fowl",
    "Red Cloth": "Some vibrant fabric\x03of maddening colour",
    "Reveal": "The power to pierce\x03the veil of the unseen",
    "Sand": "The power to become one\x03with the earth beneath",
    "Scoop Gem": "The power to uncover what\x03is hidden at your feet",
    "Sea God's Tear": "A beautiful jewel that\x03holds a divine sadness",
    "Shaman's Rod": "The staff sought by\x03a frail young man",
    "Teleport Lapis": "The power to cross\x03great distances at will",
    "Tomegathericon": "A book containing\x03a font of knowledge",
    "Trainer's Whip": "A tool containing\x03a font of knowledge",
    "Tremor Bit": "The power to\x03shake and quake",
    "Trident": "An oversized fork that\x03has been repaired",
    "Whirlwind": "The power to summon forth\x03powerful gusts of wind",

    "Blue Key": multiHints["Key"], "Red Key": multiHints["Key"], "Ruin Key": multiHints["Key"],
    "Center Prong": multiHints["Prong"], "Left Prong": multiHints["Prong"], "Right Prong": multiHints["Prong"],
    "Azul": multiHints["Summon"], "Catastrophe": multiHints["Summon"], "Charon": multiHints["Summon"], "Coatlicue": multiHints["Summon"],
    "Daedalus": multiHints["Summon"], "Eclipse": multiHints["Summon"], "Flora": multiHints["Summon"], "Haures": multiHints["Summon"],
    "Iris": multiHints["Summon"], "Megaera": multiHints["Summon"], "Moloch": multiHints["Summon"], "Ulysses": multiHints["Summon"],
    "Zagan": multiHints["Summon"]
};

const mapHints = {
    "Air's Rock": "at a sacred place of\x03abundant Jupiter energy",
    "Anemos Inner Sanctum": "deep inside\x03the moonlit ruins",
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
    "Islet Cave": "inside the cave where\x03only turtles tread",
    "Izumo": "in the town where\x03sacrifices are made",
    "Jupiter Lighthouse": "within the mighty\x03seal of Jupiter",
    "Kandorean Temple": "at the temple where\x03enlightenment is sought",
    "Kibombo": "in the town where\x03a great statue is revered",
    "Kibombo Mountains": "atop the heavily\x03guarded ridge",
    "Lemuria": "in the land of\x03the regressed ancients",
    "Lemurian Ship": "within the seafaring\x03vessel of the ancients",
    "Loho": "in the town of\x03the diminutive miners",
    "Magma Rock": "at a sacred place of\x03abundant Mars energy",
    "Mars Lighthouse": "within the mighty\x03seal of Mars",
    "Mikasalla": "in the town where...\x03a chicken finds a ladder",
    "Naribwe": "in the town where\x03fortunes are foretold",
    "Osenia Cavern": "inside a cave on\x03the continent of Osenia",
    "Overworld": "somewhere beneath\x03the ocean waves",
    "Prox": "in the frigid town at\x03the edge of the world",
    "Shrine of the Sea God": "in the shrine\x03overlooking the ocean",
    "Shaman Village": "in the town where two\x03great champions fought",
    "Taopo Swamp": "deep within the\x03starlit marshes",
    "Treasure Isle": "on a distant\x03island of great riches",
    "Tundaria Tower": "inside an emotionally\x03distant tower",
    "Yallam": "in the town\x03where the sun shines",
    "Yampi Desert": "within a great\x03expanse of sand",
    "Yampi Desert Cave": "within a cave\x03beneath the desert sands",

    "Alhafra": multiHints["Alhafra"], "Alhafran Cave": multiHints["Alhafra"], "Gondowan Cliffs": multiHints["Cliffs"], 
    "Osenia Cliffs": multiHints["Cliffs"], "E Tundaria Islet": multiHints["Eastern Sea"], "N Osenia Islet": multiHints["Eastern Sea"], 
    "SE Angara Islet": multiHints["Eastern Sea"], "Sea of Time Islet": multiHints["Eastern Sea"], "W Indra Islet": multiHints["Eastern Sea"],
    "Gabomba Catacombs": multiHints["Gabomba"], "Gabomba Statue": multiHints["Gabomba"], "Gondowan Settlement": multiHints["Settlement"], 
    "Hesperia Settlement": multiHints["Settlement"], "Kalt Island": multiHints["Western Sea"], "SW Atteka Islet": multiHints["Western Sea"],
    "Madra": multiHints["Madra"], "Madra Catacombs": multiHints["Madra"]
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
            return "The top of the Sea God's\x03tower holds a treasure\x03of importance.\x02";
        } else {
            return "The top of the Sea God's\x03tower does not have\x03anything of value.\x02";
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
            return "The room that guards the\x03unseen holds a treasure\x03of great importance.\x02";
        } else {
            return "The room that guards the\x03unseen does not have\x03anything of value.\x02";
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
            return "The depths of our great\x03statue hold a treasure\x03of great importance.\x02";
        } else {
            return "The depths of our great\x03statue do not have\x03anything of value.\x02";
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
            return "The mistress of the great\x03forge holds a treasure\x03of great importance.\x02";
        } else {
            return "The mistress of the great\x03forge does not have\x03anything of value.\x02";
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
            return "The flooded southern cave\x03holds a treasure of\x03great importance.\x02";
        } else {
            return "The flooded southern cave\x03does not have anything\x03of value.\x02";
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
            return "The missing warriors of\x03Prox hold a treasure\x03of great importance.\x02";
        } else {
            return "The missing warriors of\x03Prox do not have\x03anything of value.\x02";
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