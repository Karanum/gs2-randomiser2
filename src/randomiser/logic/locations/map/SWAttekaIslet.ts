import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0xFC3 }
    ],

    djinn: [
        { flag: 0x72, access: [[Progression.PSY_LIFT]] }
    ]
};

export default location;