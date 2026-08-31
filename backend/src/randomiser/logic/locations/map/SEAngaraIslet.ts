import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0xAA4, restrictions: Restriction.EVENT, access: [[Progression.PSY_MIND_READ, Progression.PSY_FROST, Progression.ITEM_PRETTY_STONE]] },
        { flag: 0xF5B }
    ]
};

export default location;