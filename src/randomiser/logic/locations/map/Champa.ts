import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0x978, restrictions: Restriction.EVENT, access: [[
            Progression.BOSS_AVIMANDER, 
            Progression.ITEM_LEFT_PRONG, 
            Progression.ITEM_CENTER_PRONG, 
            Progression.ITEM_RIGHT_PRONG, 
            Progression.PSY_REVEAL
        ]] },
        { flag: 0xFAA, access: [
            [Progression.PSY_REVEAL],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ]},
        { flag: 0xFAB },
        { flag: 0xFAC },
        { flag: 0xFAD },
        { flag: 0xFAE },
        { flag: 0xFAF }
    ],

    progression: [
        { key: Progression.BOSS_AVIMANDER, access: [[Progression.NUM_DJINN_20, Progression.BRIGGS_ESCAPED]] }
    ]
};

export default location;