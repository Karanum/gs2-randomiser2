import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0xAA3, restrictions: Restriction.EVENT, access: [[Progression.PSY_MIND_READ, Progression.PSY_SAND, Progression.ITEM_RED_CLOTH]] },
        { flag: 0xF12 }
    ]
};

export default location;