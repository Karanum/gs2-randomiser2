import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x13, access: [[Progression.PSY_REVEAL, Progression.ITEM_RUIN_KEY]] },
        { flag: 0xF13, access: [[Progression.PSY_REVEAL]] },
        { flag: 0xF14, access: [[Progression.PSY_REVEAL]] },
        { flag: 0xF15, access: [[Progression.PSY_REVEAL, Progression.PSY_LASH, Progression.PSY_FROST, Progression.PSY_TREMOR]] },
        { flag: 0xF16, access: [[Progression.PSY_REVEAL]] },
        { flag: 0xF42, access: [[Progression.PSY_REVEAL, Progression.PSY_LASH, Progression.PSY_FROST]] }
    ]
};

export default location;