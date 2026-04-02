import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP, Progression.PSY_WHIRLWIND]],

    items: [
        { flag: 0xF3F, access: [[Progression.PSY_SAND]] },
        { flag: 0xF77 },
        { flag: 0xF78, access: [[Progression.PSY_SAND]] },
        { flag: 0xF79 },
        { flag: 0xF7A, access: [[Progression.PSY_SAND]] },
        { flag: 0xF7B, access: [[Progression.PSY_SAND]] },
        { flag: 0xF7C, access: [[Progression.PSY_SAND]] },
        { flag: 0xF7D, access: [[Progression.PSY_SAND]] },
        { flag: 0xF7E, access: [[Progression.PSY_SAND]] },
        { flag: 0xF7F, access: [[Progression.PSY_SAND]] },
        { flag: 0xF80, access: [
            [Progression.PSY_SAND, Progression.PSY_REVEAL],
            [Progression.PSY_SAND, Progression.SKIPS_RETREAT_OOB]
        ] },
        { flag: 0xFB0 },
        { flag: 0xFB1 },
        { flag: 0xFB2 },
        { flag: 0xFB3 },
        { flag: 0xFB4 },
        { flag: 0xFB5 },
    ]
};

export default location;