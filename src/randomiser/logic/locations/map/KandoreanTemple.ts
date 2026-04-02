import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x84A, restrictions: Restriction.EVENT, access: [[Progression.PSY_WHIRLWIND]] },
        { flag: 0xE70, access: [[Progression.PSY_WHIRLWIND]] },
        { flag: 0xF06, access: [[Progression.PSY_WHIRLWIND]] }
    ],

    djinn: [
        { flag: 0x4B, access: [[Progression.PSY_WHIRLWIND, Progression.PSY_LASH]] }
    ]
};

export default location;