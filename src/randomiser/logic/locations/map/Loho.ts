import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0xFF5, access: [[Progression.SHIP_CANNON, Progression.PSY_SCOOP]] },
        { flag: 0xFF6, access: [
            [Progression.SHIP_CANNON, Progression.PSY_SCOOP],
            [Progression.SKIPS_RETREAT_SAVEQUIT, Progression.PSY_SCOOP]
        ] },
        { flag: 0xFF7, access: [
            [Progression.SHIP_CANNON, Progression.PSY_LIFT, Progression.PSY_SCOOP],
            [Progression.SKIPS_RETREAT_SAVEQUIT, Progression.PSY_LIFT, Progression.PSY_SCOOP]
        ] },
        { flag: 0xFF8 }
    ],

    djinn: [
        { flag: 0x7C, access: [
            [Progression.SHIP_CANNON],
            [Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ],

    progression: [
        { key: Progression.SHIP_CANNON, access: [[Progression.ITEM_MAGMA_BALL]] }
    ]
};

export default location;