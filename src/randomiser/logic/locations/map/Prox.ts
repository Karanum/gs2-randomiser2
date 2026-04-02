import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SHIP_CANNON],
        [Progression.SHIP_FLIGHT, Progression.SHIP_CANNON],
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SKIPS_DEATH_STORAGE],
        [Progression.SHIP_FLIGHT, Progression.SKIPS_DEATH_STORAGE]
    ],

    items: [
        { flag: 0xFF9, access: [[Progression.PSY_LIFT, Progression.PSY_SCOOP]] },
        { flag: 0xFFA },
        { flag: 0xFFB },
        { flag: 0xFFC }
    ],

    djinn: [
        { flag: 0x40, access: [[Progression.PSY_SCOOP]] },
        { flag: 0x4A }
    ]
};

export default location;