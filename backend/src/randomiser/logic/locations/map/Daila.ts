import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0xA20, restrictions: Restriction.EVENT, access: [
            [Progression.PSY_FROST],
            [Progression.SKIPS_RETREAT_SAVEQUIT]
        ] },
        { flag: 0xF01 },
        { flag: 0xF02 },
        { flag: 0xF03 },
        { flag: 0xF04 },
        { flag: 0xF05 },
        { flag: 0xF5E, access: [[Progression.PSY_SCOOP]] }
    ]
};

export default location;