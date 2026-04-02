import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0xFC4 }
    ],

    djinn: [
        { flag: 0x3F, access: [
            [Progression.PSY_CYCLONE, Progression.PSY_LIFT],
            [Progression.SKIPS_RETREAT_SAVEQUIT]
        ]}
    ]
};

export default location;