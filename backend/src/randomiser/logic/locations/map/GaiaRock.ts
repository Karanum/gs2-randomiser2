import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0x9BA, restrictions: Restriction.EVENT, access: [[Progression.BOSS_SERPENT]] },
        { flag: 0xE41, access: [
            [Progression.PSY_GROWTH, Progression.PSY_SAND],
            [Progression.SKIPS_MAZE, Progression.PSY_SAND]
        ] },
        { flag: 0xE74, access: [
            [Progression.PSY_GROWTH],
            [Progression.SKIPS_MAZE]
        ] },
        { flag: 0xF73 },
        { flag: 0xF74, restrictions: Restriction.EVENT, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_REVEAL]] },
        { flag: 0xF75, access: [[Progression.PSY_WHIRLWIND]] },
        { flag: 0xF76, access: [
            [Progression.PSY_GROWTH],
            [Progression.SKIPS_MAZE]
        ] },
    ],

    progression: [
        { key: Progression.BOSS_SERPENT, access: [
            [Progression.NUM_DJINN_16, Progression.PSY_GROWTH, Progression.ITEM_DANCING_IDOL, Progression.PSY_CYCLONE, Progression.PSY_WHIRLWIND],
            [Progression.NUM_DJINN_16, Progression.SKIPS_MAZE, Progression.ITEM_DANCING_IDOL, Progression.PSY_CYCLONE, Progression.PSY_WHIRLWIND],
            [Progression.NUM_DJINN_24, Progression.PSY_GROWTH, Progression.ITEM_DANCING_IDOL, Progression.PSY_CYCLONE],
            [Progression.NUM_DJINN_24, Progression.SKIPS_MAZE, Progression.ITEM_DANCING_IDOL, Progression.PSY_CYCLONE]
        ] }
    ]
};

export default location;