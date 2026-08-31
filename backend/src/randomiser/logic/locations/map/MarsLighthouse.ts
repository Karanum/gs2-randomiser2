import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SHIP_CANNON],
        [Progression.SHIP_FLIGHT, Progression.SHIP_CANNON],
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SKIPS_DEATH_STORAGE],
        [Progression.SHIP_FLIGHT, Progression.SKIPS_DEATH_STORAGE]
    ],

    items: [
        { flag: 0xA3A, restrictions: Restriction.EVENT, access: [[Progression.BOSS_FLAME_DRAGONS]] },
        { flag: 0xE00, access: [[Progression.MARS_LIGHTHOUSE_LOWER]] },
        { flag: 0xE01, access: [[Progression.MARS_LIGHTHOUSE_LOWER, Progression.PSY_REVEAL, Progression.PSY_TELEPORT]] },
        { flag: 0xE02, access: [[Progression.MARS_LIGHTHOUSE_LOWER, Progression.PSY_REVEAL, Progression.PSY_TELEPORT]] },
        { flag: 0xE03, access: [[Progression.MARS_LIGHTHOUSE_UPPER, Progression.PSY_CYCLONE, Progression.PSY_HOVER]] },
        { flag: 0xE78, access: [[Progression.PSY_POUND]] },
        { flag: 0xFFD },
        { flag: 0xFFE, access: [
            [Progression.MARS_LIGHTHOUSE_LOWER],
            [Progression.PSY_POUND, Progression.PSY_GRIND, Progression.PSY_BURST, Progression.PSY_TELEPORT]
        ] },
        { flag: 0xFFF, access: [[Progression.MARS_LIGHTHOUSE_UPPER]] }
    ],

    djinn: [
        { flag: 0x54, access: [[Progression.MARS_LIGHTHOUSE_LOWER]] },
        { flag: 0x69, access: [[Progression.MARS_LIGHTHOUSE_UPPER]] }
    ],

    progression: [
        { key: Progression.MARS_LIGHTHOUSE_LOWER, access: [
            [Progression.PSY_POUND, Progression.PSY_GRIND, Progression.PSY_BURST, Progression.PSY_BLAZE]
        ] },
        { key: Progression.MARS_LIGHTHOUSE_UPPER, access: [
            [Progression.BOSS_FLAME_DRAGONS, Progression.ITEM_MARS_STAR],
            [Progression.SHORTCUT_MARS_LIGHTHOUSE, Progression.ITEM_MARS_STAR]
        ] },

        { key: Progression.WING_VENUS, access: [
            [Progression.MARS_LIGHTHOUSE_UPPER, Progression.PSY_CARRY, Progression.PSY_SAND],
            [Progression.WING_MERCURY, Progression.SKIPS_RETREAT],
            [Progression.WING_MARS, Progression.SKIPS_RETREAT],
            [Progression.WING_JUPITER, Progression.SKIPS_RETREAT]
        ] },
        { key: Progression.WING_MERCURY, access: [
            [Progression.MARS_LIGHTHOUSE_UPPER, Progression.PSY_FROST, Progression.PSY_BLAZE]
        ] },
        { key: Progression.WING_MARS, access: [
            [Progression.MARS_LIGHTHOUSE_UPPER, Progression.PSY_BURST, Progression.PSY_BLAZE]
        ] },
        { key: Progression.WING_JUPITER, access: [
            [Progression.MARS_LIGHTHOUSE_UPPER, Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL, Progression.PSY_BLAZE],
            [Progression.MARS_LIGHTHOUSE_UPPER, Progression.PSY_CYCLONE, Progression.SKIPS_WIGGLECLIP, Progression.PSY_REVEAL, Progression.PSY_BLAZE]
        ] },

        { key: Progression.BOSS_FLAME_DRAGONS, access: [[
            Progression.MARS_LIGHTHOUSE_LOWER,
            Progression.PSY_REVEAL,
            Progression.PSY_TELEPORT,
            Progression.NUM_DJINN_48
        ]] },

        { key: Progression.BOSS_DOOM_DRAGON, access: [[
            Progression.WING_VENUS,
            Progression.WING_MERCURY,
            Progression.WING_MARS,
            Progression.WING_JUPITER,
            Progression.PSY_TELEPORT,
            Progression.NUM_DJINN_56
        ]] }
    ]
};

export default location;