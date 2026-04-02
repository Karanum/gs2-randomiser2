import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation =
{
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0x15, access: [[Progression.PSY_CARRY]] }
    ]
};

export default location;