import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP_FLIGHT],
        [Progression.SHIP, Progression.PSY_GRIND]
    ],

    items: [
        { flag: 0xD00, restrictions: Restriction.EVENT, access: [[Progression.REUNION]] },
        { flag: 0xD01, restrictions: Restriction.EVENT, access: [[Progression.REUNION]] },
        { flag: 0xD02, restrictions: Restriction.EVENT, access: [[Progression.REUNION]] },
        { flag: 0xD03, restrictions: Restriction.EVENT, access: [[Progression.REUNION]] },
        { flag: 0xE04, access: [[Progression.PSY_REVEAL]] },
        { flag: 0xFC5 },
        { flag: 0xFC6 },
        { flag: 0xFC7, access: [[Progression.PSY_CYCLONE]] }
    ],

    djinn: [
        { flag: 0x3E, access: [[Progression.PSY_SCOOP]] },
        { flag: 0x67, access: [[Progression.PSY_FORCE]] }
    ],

    progression: [
        { key: Progression.REUNION, access: [[Progression.JUPITER_LIT]] },
        { key: Progression.CHAR_ISAAC, access: [[Progression.VANILLA_CHARACTERS, Progression.REUNION]] },
        { key: Progression.CHAR_GARET, access: [[Progression.VANILLA_CHARACTERS, Progression.REUNION]] },
        { key: Progression.CHAR_IVAN, access: [[Progression.VANILLA_CHARACTERS, Progression.REUNION]] },
        { key: Progression.CHAR_MIA, access: [[Progression.VANILLA_CHARACTERS, Progression.REUNION]] }
    ]
};

export default location;