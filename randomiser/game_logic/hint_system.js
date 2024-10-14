const textutil = require ('./textutil.js');

/**
 * Shared hint texts for items/locations.
 */
const multiHints = {
    "Alhafra": "in a port city\x03ruled through schemes",
    "Character": "A scattered companion",
    "Cliffs": "on cliffs that\x03divide the land",
    "Eastern Sea": "on an island in\x03the Eastern Sea",
    "Gabomba": "within the bowels\x03of a revered statue",
    "Key": "A key item",
    "Madra": "in the town of\x03repeated misfortune",
    "Prong": "Part of some\x03oversized fork",
    "Settlement": "within a small\x03settlement of little note",
    "Summon": "A powerful ally brought\x03forth by elemental energy",
    "Western Sea": "on an island in\x03the Western Sea"
};

/**
 * Hint texts for items.
 */
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
    "Zagan": multiHints["Summon"], "Isaac": multiHints["Character"], "Garet": multiHints["Character"], "Ivan": multiHints["Character"],
    "Mia": multiHints["Character"], "Jenna": multiHints["Character"], "Sheba": multiHints["Character"], "Piers": multiHints["Character"]
};

/**
 * Hint texts for locations.
 */
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

/** Helper array to convert numbers to their text representation. */
const numToStr = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
    "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];

/**
 * Returns the number of key items for the specified location.
 */
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

/**
 * Returns the sphere depth of the specified item.
 */
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

/**
 * Returns the highest sphere depth from a list of items.
 */
function getMaxSphereDepth(spheres, itemLocs, itemList) {
    var maxDepth = 0;
    itemList.forEach((item) => {
        maxDepth = Math.max(maxDepth, getSphereDepth(spheres, itemLocs, item));
    })
    return maxDepth;
}

/**
 * Returns a random item location ID based on the given sphere depth.
 */
function pickRandomSlot(prng, spheres, itemLocs, depth, attempt = 0) {
    var targetDepth = undefined;
    if (depth + 3 >= spheres.length) --depth;
    for (var i = depth + 2; i < spheres.length; ++i) {
        targetDepth = i;
        if (prng.random() < (0.4 + (3 - Math.min(3, spheres.length - i - 2)) * 0.2) / (1 + attempt * 0.2)) break;
    }
    if (!targetDepth) targetDepth = spheres.length - 1;
    var sphere = spheres[targetDepth];
    var weightedSphere = [];
    sphere.forEach((slot) => {
        var item = itemLocs[slot][0];
        weightedSphere.push(slot);
        if (item.contents < 0xF10 || item.contents > 0xF1C) {
            weightedSphere.push(slot);
            weightedSphere.push(slot);
        }
    })
    return weightedSphere[Math.floor(prng.random() * weightedSphere.length)];
}

/**
 * Returns the hint text string for the specified item.
 */
function makeItemHintText(item) {
    var itemHint = itemHints[item['name']] || item['name'] || "???";
    var mapHint = mapHints[item['mapName']] || ("in " + item['mapName']) || "???";
    return itemHint + "...\x01awaits " + mapHint + ".";
}

/**
 * Gets a random item for the item hint, attempting to avoid the items already listed in `seen`.
 */
function getItemHint(prng, spheres, itemLocs, depth, seen) {
    var slot = pickRandomSlot(prng, spheres, itemLocs, depth, 0);
    var attempts = 0;
    while (seen.includes(slot) && attempts < 10) {
        slot = pickRandomSlot(prng, spheres, itemLocs, depth, attempts + 1);
        ++attempts;
    }
    seen.push(slot);
    return itemLocs[slot][0];
}

/**
 * Returns a random hint for Master Poi.
 */
function getHintIndra(prng, type, spheres, itemLocs, seen) {
    var depth = getSphereDepth(spheres, itemLocs, "Whirlwind");
    var areaDepth = getMaxSphereDepth(spheres, itemLocs, ["Whirlwind", "Growth", "Reveal"]);
    var locDepth = getMaxSphereDepth(spheres, itemLocs, ["Lash Pebble", "Sea God's Tear", "Reveal", "Frost Jewel"]);

    if (type == 1 && depth < areaDepth) {
        var numKeyItems = getKeyItemCount(itemLocs, "Gaia Rock");
        if (numKeyItems == 1)
            return "There is one important\x03item in Gaia Rock.\x02";
        return "There are " + numToStr[numKeyItems] + " important\x03items in Gaia Rock.\x02";
    }
    else if (type == 2 && depth < locDepth) {
        var item = itemLocs["0x8c7"][0];
        return `The top of the Sea God's\x03tower ${item['isKeyItem']
            ? 'holds a treasure\x03of great importance'
            : 'does not have\x03anything of value'
        }.\x02`;
    }
    else {
        var item = getItemHint(prng, spheres, itemLocs, depth, seen);
        return makeItemHintText(item) + '\x02';
    }
}

/**
 * Returns a random hint for Master Maha.
 */
function getHintOsenia(prng, type, spheres, itemLocs, seen) {
    var depth = getSphereDepth(spheres, itemLocs, "Reveal");
    var areaDepth = getSphereDepth(spheres, itemLocs, "Whirlwind");

    if (type == 1 && depth < areaDepth) {
        var numKeyItems = getKeyItemCount(itemLocs, "Air's Rock");
        if (numKeyItems == 1)
            return "There is one important\x03item in Air's Rock.\x02";
        return "There are " + numToStr[numKeyItems] + " important\x03items in Air's Rock.\x02";
    }
    else if (type == 2 && depth < areaDepth) {
        var item = itemLocs["0x8d4"][0];
        return `The room that guards the\x03unseen ${item['isKeyItem']
            ? 'holds a treasure\x03of great importance'
            : 'does not have\x03anything of value'
        }.\x02`;
    }
    else {
        var item = getItemHint(prng, spheres, itemLocs, depth, seen);
        return makeItemHintText(item) + '\x02';
    }
}

/**
 * Returns a random hint for Akafubu.
 */
function getHintGondowan(prng, type, spheres, itemLocs, seen) {
    var depth = getMaxSphereDepth(spheres, itemLocs, ["Lash Pebble", "Scoop Gem", "Pound Cube"]);
    var areaDepth = getMaxSphereDepth(spheres, itemLocs, ["Grindstone", "Lifting Gem", "Burst Brooch", "Growth"]);
    var locDepth = getMaxSphereDepth(spheres, itemLocs, ["Cyclone Chip", "Frost Jewel", "Reveal"]);

    if (type == 1 && depth < areaDepth) {
        var numKeyItems = getKeyItemCount(itemLocs, "Magma Rock");
        if (numKeyItems == 1)
            return "There is one important\x03item in Magma Rock.\x02";
        return "There are " + numToStr[numKeyItems] + " important\x03items in Magma Rock.\x02";
    }
    else if (type == 2 && depth < locDepth) {
        var item = itemLocs["0xf93"][0];
        return `The depths of our great\x03statue ${item['isKeyItem']
            ? 'hold a treasure\x03of great importance'
            : 'do not have\x03anything of value'
        }.\x02`;
    }
    else {
        var item = getItemHint(prng, spheres, itemLocs, depth, seen);
        return makeItemHintText(item) + '\x02';
    }
}

/**
 * Returns a random hint for King Hydros.
 */
function getHintLemuria(prng, type, spheres, itemLocs, seen) {
    var depth = getSphereDepth(spheres, itemLocs, "Grindstone");
    var areaDepth = Math.min(
        getMaxSphereDepth(spheres, itemLocs, ["Douse Drop", "Frost Jewel"]),
        getMaxSphereDepth(spheres, itemLocs, ["Douse Drop", "Parch"])   
    );
    var locDepth = getMaxSphereDepth(spheres, itemLocs, ["Burst Brooch", "Left Prong", "Center Prong", "Right Prong", "Reveal"]);

    if (type == 1 && depth < areaDepth) {
        var numKeyItems = getKeyItemCount(itemLocs, "Aqua Rock");
        if (numKeyItems == 1)
            return "There is one important\x03item in Aqua Rock.\x02";
        return "There are " + numToStr[numKeyItems] + " important\x03items in Aqua Rock.\x02";
    }
    else if (type == 2 && depth < locDepth) {
        var item = itemLocs["0x978"][0];
        return `The mistress of the ancient\x03forge ${item['isKeyItem']
            ? 'holds a treasure\x03of great importance'
            : 'does not have\x03anything of value'
        }.\x02`;
    }
    else {
        var item = getItemHint(prng, spheres, itemLocs, depth, seen);
        return makeItemHintText(item) + '\x02';
    }
}

/**
 * Returns a random hint for the Contigo corn seller.
 */
function getHintAtteka(prng, type, spheres, itemLocs, seen) {
    var depth = getSphereDepth(spheres, itemLocs, "Grindstone");
    var areaDepth = getMaxSphereDepth(spheres, itemLocs, ["Cyclone Chip", "Hover Jade", "Reveal", "Red Key", "Blue Key"]);

    if (type == 1 && depth < areaDepth) {
        var numKeyItems = getKeyItemCount(itemLocs, "Jupiter Lighthouse");
        if (numKeyItems == 1)
            return "There is one important\x03item in Jupiter Lighthouse.\x02";
        return "There are " + numToStr[numKeyItems] + " important\x03items in Jupiter Lighthouse.\x02";
    }
    else if (type == 2 && depth < areaDepth) {
        var isKeyItem = ["0x101", "0x102", "0x103", "0x104"].some((id) => itemLocs[id][0]['isKeyItem']);
        return `The other warriors of\x03Vale ${isKeyItem
            ? 'hold a treasure\x03of great importance'
            : 'do not have\x03anything of value'
        }.\x02`;
    }
    else {
        var item = getItemHint(prng, spheres, itemLocs, depth, seen);
        return makeItemHintText(item) + '\x02';
    }
}

/**
 * Returns a random hint for the Proxian elder.
 */
function getHintProx(prng, type, spheres, itemLocs, seen) {
    var depth = getMaxSphereDepth(spheres, itemLocs, ["Grindstone", "Magma Ball"]);
    var areaDepth = getMaxSphereDepth(spheres, itemLocs, ["Grindstone", "Magma Ball", "Pound Cube", "Burst Brooch", "Teleport Lapis", "Blaze", "Reveal"]);

    if (type == 1 && depth < areaDepth) {
        var numKeyItems = getKeyItemCount(itemLocs, "Mars Lighthouse");
        if (numKeyItems == 1)
            return "There is one important\x03item in Mars Lighthouse.\x02";
        return "There are " + numToStr[numKeyItems] + " important\x03items in Mars Lighthouse.\x02";
    }
    else if (type == 2 && depth < areaDepth) {
        var item = itemLocs["0xa3a"][0];
        return `The missing warriors of\x03Prox ${item['isKeyItem']
            ? 'hold a treasure\x03of great importance'
            : 'do not have\x03anything of value'
        }.\x02`;
    }
    else {
        var item = getItemHint(prng, spheres, itemLocs, depth, seen);
        return makeItemHintText(item) + '\x02';
    }
}

/**
 * Pick a random hint type, where `0` = item hint (60%), `1` = area hint (20%), `2` = single location hint (20%).
 */
function randomHintType(prng) {
    return Math.max(2, Math.floor(prng.random() * 5)) - 2;
}

/**
 * Write randomly chosen hints into the text of the game.
 */
function writeHints(prng, lines, spheres, itemLocs) {
    var seen = [];

    var hint = getHintIndra(prng, randomHintType(prng), spheres, itemLocs, seen);
    textutil.writeLine(lines, 6055, hint);

    hint = getHintOsenia(prng, randomHintType(prng), spheres, itemLocs, seen);
    textutil.writeLine(lines, 6797, hint);

    hint = getHintGondowan(prng, randomHintType(prng), spheres, itemLocs, seen);
    textutil.writeLine(lines, 8191, hint);

    hint = getHintLemuria(prng, randomHintType(prng), spheres, itemLocs, seen);
    textutil.writeLine(lines, 10362, hint);

    hint = getHintAtteka(prng, randomHintType(prng), spheres, itemLocs, seen);
    textutil.writeLine(lines, 10455, hint);
    textutil.writeLine(lines, 11238, hint);

    hint = getHintProx(prng, randomHintType(prng), spheres, itemLocs, seen);
    textutil.writeLine(lines, 11623, hint);
}

module.exports = {writeHints};