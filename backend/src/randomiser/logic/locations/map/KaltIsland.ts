import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    djinn: [
        { flag: 0x52, access: [
            [Progression.PSY_LASH],
            [Progression.SKIPS_WIGGLECLIP]
        ] }
    ]
};

export default location;