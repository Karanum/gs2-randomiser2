import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.PIERS, Progression.PSY_SCOOP]],

    items: [
        { flag: 0x8FF, restrictions: Restriction.EVENT, access: [[Progression.GABOMBA_CLEARED]] },
        { flag: 0xE72 },
        { flag: 0xF51 },
        { flag: 0xF52, access: [
            [Progression.PSY_LASH],
            [Progression.PIERS, Progression.PSY_SCOOP, Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ],

    djinn: [
        { flag: 0x39, access: [
            [Progression.PSY_LASH, Progression.PSY_POUND],
            [Progression.PIERS, Progression.PSY_SCOOP, Progression.PSY_POUND, Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ],

    progression: [
        { key: Progression.GABOMBA_CLEARED, access: [
            [Progression.PSY_LASH, Progression.PSY_POUND],
            [Progression.PIERS, Progression.PSY_SCOOP, Progression.PSY_POUND, Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ]
};

export default location;