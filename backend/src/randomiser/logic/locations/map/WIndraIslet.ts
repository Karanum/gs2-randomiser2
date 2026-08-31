import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],
    
    items: [
        { flag: 0xAA1, restrictions: Restriction.EVENT, access: [[Progression.PSY_MIND_READ, Progression.ITEM_MILK]] },
        { flag: 0xF5A }
    ]
};

export default location;