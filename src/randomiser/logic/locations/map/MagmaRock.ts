import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND, Progression.PSY_LIFT],
        [Progression.SHIP_FLIGHT, Progression.PSY_LIFT],
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SKIPS_SAND, Progression.PSY_SAND],
        [Progression.SHIP_FLIGHT, Progression.SKIPS_SAND, Progression.PSY_SAND],
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SKIPS_DEATH_STORAGE],
        [Progression.SHIP_FLIGHT, Progression.SKIPS_DEATH_STORAGE],
    ],

    items: [
        { flag: 0x9F9, restrictions: Restriction.EVENT, access: [
            [Progression.MAGMA_ROCK_INTERIOR, Progression.PSY_WHIRLWIND, Progression.PSY_BLAZE],
            [Progression.MAGMA_ROCK_INTERIOR, Progression.PSY_WHIRLWIND, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BLAZE],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0x9FA, restrictions: Restriction.EVENT, access: [
            [Progression.MAGMA_ROCK_INTERIOR, Progression.PSY_WHIRLWIND],
            [Progression.SHORTCUT_MAGMA_ROCK]
        ] },
        { flag: 0xE77 },
        { flag: 0xFED, access: [[Progression.PSY_BURST]] },
        { flag: 0xFEE, access: [[Progression.PSY_BURST, Progression.PSY_GROWTH]] },
        { flag: 0xFEF, access: [[Progression.PSY_BURST, Progression.PSY_GROWTH, Progression.PSY_LASH]] },
        { flag: 0xFF0, access: [
            [Progression.MAGMA_ROCK_INTERIOR],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BURST]
        ] },
        { flag: 0xFF1, access: [
            [Progression.MAGMA_ROCK_INTERIOR],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BURST]
        ] },
        { flag: 0xFF2, access: [
            [Progression.MAGMA_ROCK_INTERIOR, Progression.PSY_WHIRLWIND],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BURST]
        ] },
        { flag: 0xFF4, access: [
            [Progression.MAGMA_ROCK_INTERIOR, Progression.PSY_WHIRLWIND],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BURST, Progression.PSY_WHIRLWIND]
        ] }
    ],

    djinn: [
        { flag: 0x5E, access: [
            [Progression.MAGMA_ROCK_INTERIOR],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BURST]
        ] },
        { flag: 0x68, access: [
            [Progression.MAGMA_ROCK_INTERIOR],
            [Progression.SHORTCUT_MAGMA_ROCK, Progression.PSY_BURST]
        ] }
    ],

    progression: [
        { key: Progression.MAGMA_ROCK_INTERIOR, access: [[Progression.PSY_BURST, Progression.PSY_GROWTH, Progression.PSY_LASH]] }
    ]
};

export default location;