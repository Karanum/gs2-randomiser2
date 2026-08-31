import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    djinn: [
        { flag: 0x53, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_FROST, Progression.PSY_LIFT]] }
    ]
};

export default location;