import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0xAA2, restrictions: Restriction.EVENT },
        { flag: 0xF92 }
    ]
};

export default location;