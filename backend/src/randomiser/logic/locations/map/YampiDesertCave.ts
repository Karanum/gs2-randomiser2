import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.ACCESS_YAMPI_BACKSIDE, Progression.PSY_SAND],
        [Progression.ACCESS_YAMPI_BACKSIDE, Progression.SKIPS_RETREAT]
    ],

    items: [
        { flag: 0x18, access: [[Progression.BOSS_VALUKAR]] },
        { flag: 0xF8A },
        { flag: 0xF8B, access: [[Progression.PSY_TELEPORT, Progression.PSY_SAND, Progression.PSY_BURST, Progression.PSY_SCOOP]] },
        { flag: 0xF8C, access: [[Progression.PSY_TELEPORT, Progression.PSY_SAND, Progression.PSY_BURST]] },
        { flag: 0xF8D, access: [[Progression.PSY_TELEPORT, Progression.PSY_SAND, Progression.PSY_BURST]] }
    ],

    djinn: [
        { flag: 0x41, access: [[Progression.PSY_TELEPORT, Progression.PSY_SAND, Progression.PSY_BURST, Progression.PSY_SCOOP]] },
    ],

    progression: [
        { key: Progression.BOSS_VALUKAR, access: [
            [Progression.PSY_TELEPORT, Progression.PSY_SAND, Progression.PSY_BURST, Progression.PSY_POUND, Progression.NUM_DJINN_64]
        ] }
    ]
};

export default location;