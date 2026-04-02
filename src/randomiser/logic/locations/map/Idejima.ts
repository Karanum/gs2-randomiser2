import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0xD05, restrictions: Restriction.EVENT },
        { flag: 0xD06, restrictions: Restriction.EVENT },
    ],

    progression: [
        { key: Progression.CHAR_JENNA, access: [[Progression.VANILLA_CHARACTERS]] },
        { key: Progression.CHAR_SHEBA, access: [[Progression.VANILLA_CHARACTERS]] }
    ]
};

export default location;