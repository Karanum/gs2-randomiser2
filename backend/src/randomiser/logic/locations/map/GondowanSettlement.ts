import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0xFC0, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xFC1 }
    ]
};

export default location;