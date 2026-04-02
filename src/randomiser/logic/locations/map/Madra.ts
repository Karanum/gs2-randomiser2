import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x918, restrictions: Restriction.EVENT, access: [
            [Progression.GABOMBA_CLEARED],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF0C },
        { flag: 0xF0D },
        { flag: 0xF0E },
        { flag: 0xF0F },
        { flag: 0xF10 },
        { flag: 0xF11 }
    ],

    djinn: [
        { flag: 0x62, access: [[Progression.ITEM_HEALING_FUNGUS]] }
    ]
};

export default location;