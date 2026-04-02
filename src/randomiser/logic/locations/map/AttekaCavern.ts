import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP_FLIGHT],
        [Progression.SHIP, Progression.PSY_GRIND, Progression.SKIPS_SHIPCLIP]
    ],

    items: [
        { flag: 0x17, access: [[Progression.PSY_PARCH]] }
    ]
};

export default location;