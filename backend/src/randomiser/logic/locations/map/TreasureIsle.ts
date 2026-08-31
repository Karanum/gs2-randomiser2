import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0x19, access: [[Progression.BOSS_STAR_MAGICIAN]] },
        { flag: 0xE75, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFCD },
        { flag: 0xFCE },
        { flag: 0xFCF },
        { flag: 0xFD0 },
        { flag: 0xFD1 },
        { flag: 0xFD2 },
        { flag: 0xFD3 },
        { flag: 0xFD4 },
        { flag: 0xFD5 },
        { flag: 0xFD6 },
        { flag: 0xFD7 },
        { flag: 0xFD8 },
        { flag: 0xFD9, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFDA, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFDB, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFDC, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFDD, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFDE, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFDF, access: [[Progression.PSY_GRIND]] },
        { flag: 0xFE0, access: [[Progression.PSY_GRIND, Progression.PSY_LIFT]] },
        { flag: 0xFE1, access: [[Progression.PSY_GRIND, Progression.PSY_LIFT]] }
    ],

    djinn: [
        { flag: 0x36, access: [[Progression.PSY_GRIND, Progression.PSY_LIFT]] },
        { flag: 0x7D, access: [[Progression.PSY_GRIND, Progression.PSY_LIFT]] }
    ],

    progression: [
        { key: Progression.BOSS_STAR_MAGICIAN, access: [[Progression.PSY_GRIND, Progression.PSY_LIFT, Progression.NUM_DJINN_64]] }
    ]
};

export default location;