import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0xF2D, access: [[Progression.PSY_REVEAL]] },
        { flag: 0xF2E },
        { flag: 0xF2F },
        { flag: 0xF30 },
        { flag: 0xF31 }
    ],

    djinn: [
        { flag: 0x75, access: [[Progression.PSY_REVEAL]] }
    ]
};

export default location;