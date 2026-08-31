import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.ACCESS_GONDOWAN],
        [Progression.SHIP]
    ],

    items: [
        { flag: 0xF44, access: [
            [Progression.PSY_LASH],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF45, access: [
            [Progression.PSY_WHIRLWIND, Progression.PSY_REVEAL],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF46 },
        { flag: 0xF47 },
        { flag: 0xF48 }
    ]
};

export default location;