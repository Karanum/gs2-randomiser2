import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP],
        [Progression.SKIPS_SANCWARP]
    ],

    items: [
        { flag: 0xF60, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xF61 },
        { flag: 0xF62, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xF95, access: [
            [Progression.PSY_CYCLONE, Progression.PSY_FORCE],
            [Progression.SKIPS_RETREAT_SAVEQUIT]
        ] },
        { flag: 0xF96 },
        { flag: 0xF97 }
    ]
};

export default location;