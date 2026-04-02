import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.GABOMBA_CLEARED]],

    items: [
        { flag: 0xF53, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xF93, restrictions: Restriction.EVENT, access: [
            [Progression.PSY_CYCLONE, Progression.PSY_REVEAL, Progression.PSY_FROST]
        ] }
    ],

    djinn: [
        { flag: 0x3A, access: [[Progression.PSY_CYCLONE]] }
    ]
};

export default location;