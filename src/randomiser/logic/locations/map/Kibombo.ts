import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP],
        [Progression.ACCESS_GONDOWAN, Progression.PSY_FROST],
        [Progression.ACCESS_GONDOWAN, Progression.PSY_LASH, Progression.PSY_WHIRLWIND]
    ],

    items: [
        { flag: 0xD07, restrictions: Restriction.EVENT, access: [[Progression.PIERS]] },
        { flag: 0xF4E },
        { flag: 0xF4F, access: [[Progression.GABOMBA_CLEARED]] },
        { flag: 0xF50, access: [[Progression.GABOMBA_CLEARED]] }
    ],

    progression: [
        { key: Progression.PIERS, access: [
            [Progression.PSY_LASH],
            [Progression.SKIPS_SANCWARP]
        ] }
    ]
};

export default location;