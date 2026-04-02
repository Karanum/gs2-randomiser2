import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x878, restrictions: Restriction.EVENT },
        { flag: 0xF07 },
        { flag: 0xF08 },
        { flag: 0xF09 },
        { flag: 0xF0A },
        { flag: 0xF0B, access: [
            [Progression.PSY_LASH],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ],

    djinn: [
        { flag: 0x5F, access: [[Progression.PSY_POUND]] }
    ]
};

export default location;