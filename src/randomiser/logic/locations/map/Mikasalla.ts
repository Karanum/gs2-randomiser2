import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0xF28 },
        { flag: 0xF29 },
        { flag: 0xF2A },
        { flag: 0xF2B },
        { flag: 0xF2C }
    ],

    djinn: [
        { flag: 0x60, access: [
            [Progression.PSY_SCOOP],
            [Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ]
};

export default location;