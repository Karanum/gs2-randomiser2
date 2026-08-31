import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0xFC2, access: [
            [Progression.PSY_GROWTH],
            [Progression.SKIPS_RETREAT_OOB]
        ] }
    ],

    djinn: [
        { flag: 0x66, access: [
            [Progression.PSY_GROWTH],
            [Progression.SKIPS_RETREAT_OOB]
        ] }
    ]
};

export default location;