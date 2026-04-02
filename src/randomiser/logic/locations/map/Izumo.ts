import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    items: [
        { flag: 0x14, access: [
            [Progression.PSY_REVEAL, Progression.PSY_SAND, Progression.PSY_FROST, Progression.PSY_POUND, Progression.PSY_PARCH]
        ] },
        { flag: 0xF9F, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xFA0, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xFA1, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xFA2 },
        { flag: 0xFA3 },
        { flag: 0xFA4 },
        { flag: 0xFA5 },
        { flag: 0xFA6, access: [[Progression.PSY_REVEAL, Progression.PSY_SAND, Progression.PSY_FROST, Progression.PSY_POUND]] }
    ],

    djinn: [
        { flag: 0x63, access: [[Progression.BOSS_SERPENT, Progression.ITEM_DANCING_IDOL]] }
    ]
};

export default location;