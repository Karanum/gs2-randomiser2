import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = 
{
    access: [[Progression.PSY_WHIRLWIND]],

    items: [
        { flag: 0x12 },
        { flag: 0x8D4, restrictions: Restriction.EVENT },
        { flag: 0xE71 },
        { flag: 0xF32 },
        { flag: 0xF33 },
        { flag: 0xF34 },
        { flag: 0xF35, access: [[Progression.PSY_FROST]] },
        { flag: 0xF36 },
        { flag: 0xF37 },
        { flag: 0xF38 },
        { flag: 0xF39 },
        { flag: 0xF3A },
        { flag: 0xF3B },
        { flag: 0xF3C, access: [[Progression.PSY_REVEAL]] },
        { flag: 0xF3D },
    ]
}

export default location;