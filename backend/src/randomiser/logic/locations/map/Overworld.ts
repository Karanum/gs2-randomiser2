import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0xE5B, access: [[Progression.SHIP]] },
        { flag: 0xE5C, access: [[Progression.SHIP]] },
        { flag: 0xE5D, access: [[Progression.SHIP, Progression.PSY_GRIND], [Progression.SHIP_FLIGHT]] },
        { flag: 0xE5E, access: [[Progression.SHIP, Progression.PSY_GRIND], [Progression.SHIP_FLIGHT]] },
        { flag: 0xE5F, access: [[Progression.SHIP_FLIGHT]] }
    ],

    djinn: [
        { flag: 0x37 }, 
        { flag: 0x38 },
        { flag: 0x3D, access: [[Progression.SHIP, Progression.PSY_GRIND], [Progression.SHIP_FLIGHT]] },
        { flag: 0x4C },
        { flag: 0x4F, access: [[Progression.SHIP], [Progression.ACCESS_GONDOWAN]] },
        { flag: 0x65, access: [[Progression.SHIP, Progression.PSY_GRIND], [Progression.SHIP_FLIGHT]] },
        { flag: 0x78, access: [[Progression.SHIP]] }
    ],

    progression: [
        { key: Progression.SHIP_DOCKED, access: [
            [Progression.SHIP, Progression.PSY_GRIND],
            [Progression.SHIP, Progression.BOSS_POSEIDON],
            [Progression.SHIP_FLIGHT]
        ] },
        { key: Progression.SHIP_WINGS, access: [[Progression.REUNION]] },
        { key: Progression.SHIP_FLIGHT, access: [[Progression.SHIP_WINGS, Progression.PSY_HOVER]] }
    ]
};

export default location;