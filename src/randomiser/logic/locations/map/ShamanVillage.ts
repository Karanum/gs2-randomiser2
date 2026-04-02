import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND, Progression.PSY_WHIRLWIND],
        [Progression.SHIP_FLIGHT, Progression.PSY_WHIRLWIND],
        [Progression.SHIP, Progression.PSY_GRIND, Progression.PSY_LIFT, Progression.PSY_FROST],
        [Progression.SHIP_FLIGHT, Progression.PSY_LIFT, Progression.PSY_FROST]
    ],

    items: [
        { flag: 0x94D, restrictions: Restriction.EVENT, access: [[Progression.BOSS_MOAPA]] },
        { flag: 0xE5A, access: [[Progression.ACCESS_TRIAL_ROAD, Progression.PSY_HOVER, Progression.PSY_LIFT, Progression.PSY_REVEAL]] },
        { flag: 0xF5F, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xFC8, access: [
            [Progression.PSY_GROWTH],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xFC9, access: [
            [Progression.BOSS_MOAPA],
            [Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xFCA, access: [
            [Progression.ITEM_SHAMANS_ROD],
            [Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xFCB },
        { flag: 0xFCC, access: [[Progression.BOSS_MOAPA]] },

        { flag: 0xE50, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE51, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE52, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE53, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE54, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE55, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE56, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE57, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE58, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] },
        { flag: 0xE59, restrictions: Restriction.TRIAL_ROAD, access: [[Progression.ACCESS_TRIAL_ROAD]] }
    ],

    djinn: [
        { flag: 0x79, access: [
            [Progression.BOSS_MOAPA, Progression.PSY_LASH],
            [Progression.SKIPS_RETREAT]
        ] },
        { flag: 0x7B, access: [
            [Progression.ACCESS_TRIAL_ROAD, Progression.PSY_HOVER, Progression.PSY_LIFT, Progression.PSY_REVEAL]
        ] }
    ],

    progression: [
        { key: Progression.ACCESS_TRIAL_ROAD, access: [[Progression.ITEM_SHAMANS_ROD, Progression.PSY_WHIRLWIND]] },
        { key: Progression.BOSS_MOAPA, access: [[Progression.ACCESS_TRIAL_ROAD, Progression.NUM_DJINN_28]] }
    ]
};

export default location;