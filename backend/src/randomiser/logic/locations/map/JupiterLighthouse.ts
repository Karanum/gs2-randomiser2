import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0xE76, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.ITEM_RED_KEY]] },
        { flag: 0xFE2, access: [[Progression.PSY_CYCLONE]] },
        { flag: 0xFE3, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER]] },
        { flag: 0xFE4, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL]] },
        { flag: 0xFE5, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL]] },
        { flag: 0xFE6, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL]] },
        { flag: 0xFE7, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL]] },
        { flag: 0xFE8, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.ITEM_RED_KEY]] },
        { flag: 0xFE9, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.ITEM_RED_KEY]] },
        { flag: 0xFEA, access: [[Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.ITEM_RED_KEY]] },
        { flag: 0xFEB, access: [
            [Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL, Progression.ITEM_BLUE_KEY, Progression.PSY_POUND]
        ] },
        { flag: 0xFEC, access: [
            [Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL, Progression.ITEM_BLUE_KEY, Progression.PSY_POUND]
        ] }
    ],

    djinn: [
        { flag: 0x7A, access: [
            [Progression.PSY_CYCLONE, Progression.PSY_HOVER, Progression.PSY_REVEAL, Progression.ITEM_BLUE_KEY, Progression.PSY_POUND]
        ] }
    ],

    progression: [
        { key: Progression.JUPITER_LIT, access: [[
            Progression.PSY_CYCLONE, 
            Progression.PSY_HOVER, 
            Progression.PSY_REVEAL, 
            Progression.ITEM_RED_KEY, 
            Progression.ITEM_BLUE_KEY, 
            Progression.PSY_POUND
        ]] }
    ]
};

export default location;