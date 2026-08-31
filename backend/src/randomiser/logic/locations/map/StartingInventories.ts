import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x1, restrictions: Restriction.INVENTORY },
        { flag: 0x2, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_SHEBA]] },
        { flag: 0x3, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_SHEBA]] },
        { flag: 0x4, restrictions: Restriction.INVENTORY },
        { flag: 0x101, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_MIA]] },
        { flag: 0x102, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_IVAN]] },
        { flag: 0x103, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_GARET]] },
        { flag: 0x104, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_ISAAC]] },
        { flag: 0x105, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_PIERS]] },
        { flag: 0x106, restrictions: Restriction.INVENTORY, access: [[Progression.CHAR_PIERS]] }
    ],

    djinn: [
        { flag: 0x30, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_4]] },
        { flag: 0x31, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_5]] },
        { flag: 0x32, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_6]] },
        { flag: 0x33, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_7]] },
        { flag: 0x34, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_7]] },
        { flag: 0x35, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_8]] },
        { flag: 0x44, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_5]] },
        { flag: 0x45, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_6]] },
        { flag: 0x46, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_6]] },
        { flag: 0x47, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_7]] },
        { flag: 0x48, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_7]] },
        { flag: 0x49, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_8]] },
        { flag: 0x4D, access: [[Progression.PIERS, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_3]] },
        { flag: 0x4E, access: [[Progression.PIERS, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_3]] },
        { flag: 0x58, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_4]] },
        { flag: 0x59, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_5]] },
        { flag: 0x5A, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_6]] },
        { flag: 0x5B, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_7]] },
        { flag: 0x5C, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_8]] },
        { flag: 0x5D, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_8]] },
        { flag: 0x6C, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_4]] },
        { flag: 0x6D, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_5]] },
        { flag: 0x6E, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_6]] },
        { flag: 0x6F, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_7]] },
        { flag: 0x70, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_8]] },
        { flag: 0x71, access: [[Progression.REUNION, Progression.VANILLA_CHARACTERS], [Progression.NUM_PC_8]] }
    ]
};

export default location;