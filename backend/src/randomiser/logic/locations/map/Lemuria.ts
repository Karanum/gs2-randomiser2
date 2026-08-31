import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.BOSS_POSEIDON],
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP, Progression.SKIPS_DEATH_STORAGE]
    ],

    items: [
        { flag: 0x90B, access: [
            [Progression.ITEM_LUCKY_MEDAL],
            [Progression.NO_HIDDEN_SHUFFLE]
        ] },
        { flag: 0xF67 },
        { flag: 0xFB9, access: [[Progression.PSY_SCOOP]] },
        { flag: 0xFBA, access: [[Progression.PSY_SCOOP]] },
        { flag: 0xFBB, access: [[Progression.PSY_GROWTH, Progression.PSY_CYCLONE]] },
        { flag: 0xFBC, access: [[Progression.PSY_SCOOP]] },
        { flag: 0xFBD, access: [[Progression.PSY_SCOOP]] },
        { flag: 0xFBF },
    ],

    djinn: [
        { flag: 0x51, access: [[Progression.PSY_GRIND, Progression.PSY_CYCLONE, Progression.PSY_TREMOR]] }
    ]
};

export default location;