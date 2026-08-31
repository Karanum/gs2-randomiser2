import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP, Progression.PSY_MIND_READ, Progression.ITEM_LIL_TURTLE]],

    items: [
        { flag: 0x1A, access: [[Progression.BOSS_SENTINEL]] },
        { flag: 0xFA8 },
        { flag: 0xFA9 }
    ],

    djinn: [
        { flag: 0x3C },
        { flag: 0x55, access: [
            [Progression.PSY_TELEPORT, Progression.PSY_TREMOR],
            [Progression.SKIPS_RETREAT_OOB, Progression.PSY_SAND, Progression.PSY_TREMOR]
        ] }
    ],

    progression: [
        { key: Progression.BOSS_SENTINEL, access: [
            [Progression.NUM_DJINN_64, Progression.PSY_TELEPORT],
            [Progression.NUM_DJINN_64, Progression.SKIPS_RETREAT_OOB, Progression.PSY_SAND]
        ] }
    ]
};

export default location;