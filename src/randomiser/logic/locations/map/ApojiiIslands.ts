import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP],
        [Progression.SKIPS_SANCWARP]
    ],

    items: [
        { flag: 0xF9A, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xF9B, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xF9C },
        { flag: 0xF9D },
        { flag: 0xF9E, access: [[Progression.PSY_CYCLONE]] }
    ],

    djinn: [
        { flag: 0x77, access: [
            [Progression.PSY_SAND, Progression.PSY_WHIRLWIND],
            [Progression.PSY_WHIRLWIND, Progression.SKIPS_RETREAT],
            [Progression.PSY_LASH, Progression.SKIPS_RETREAT]
        ]}
    ]
};

export default location;