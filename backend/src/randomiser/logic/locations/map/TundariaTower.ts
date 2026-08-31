import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0x945, restrictions: Restriction.EVENT, access: [[Progression.PSY_BURST]] },
        { flag: 0x949, access: [
            [Progression.PSY_PARCH, Progression.PSY_POUND, Progression.PSY_REVEAL],
            [Progression.PSY_PARCH, Progression.SKIPS_WIGGLECLIP, Progression.PSY_REVEAL]
        ] },
        { flag: 0xF81, access: [[Progression.PSY_PARCH, Progression.PSY_BURST]] },
        { flag: 0xF82, access: [[Progression.PSY_PARCH, Progression.PSY_BURST]] },
        { flag: 0xF83, access: [[Progression.PSY_PARCH, Progression.PSY_BURST]] },
        { flag: 0xF84, access: [[Progression.PSY_PARCH, Progression.PSY_BURST]] },
        { flag: 0xF85, access: [[Progression.PSY_PARCH]] },
        { flag: 0xF86, access: [[Progression.PSY_PARCH]] },
        { flag: 0xF87, access: [[Progression.PSY_PARCH, Progression.PSY_POUND]] },
        { flag: 0xF88, access: [[Progression.PSY_PARCH, Progression.PSY_POUND]] }
    ],

    djinn: [
        { flag: 0x64, access: [[Progression.PSY_PARCH]] }
    ]
};

export default location;