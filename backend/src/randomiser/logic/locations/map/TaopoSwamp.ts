import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP],
        [Progression.SKIPS_SANCWARP]
    ],

    items: [
        { flag: 0xF63, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_SCOOP]] },
        { flag: 0xF64, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_SCOOP]] },
        { flag: 0xF65, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_GROWTH, Progression.PSY_DOUSE, Progression.PSY_FROST]] },
        { flag: 0xF66, access: [
            [Progression.PSY_WHIRLWIND, Progression.PSY_GROWTH, Progression.PSY_DOUSE, Progression.PSY_FROST, Progression.PSY_TREMOR, Progression.PSY_SCOOP]
        ] },
        { flag: 0xF98 },
        { flag: 0xF99, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_CYCLONE]] }
    ],

    djinn: [
        { flag: 0x3B, access: [[Progression.PSY_WHIRLWIND]] }
    ]
};

export default location;