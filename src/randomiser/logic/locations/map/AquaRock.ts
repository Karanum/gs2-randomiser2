import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP, Progression.PSY_DOUSE]],

    items: [
        { flag: 0x9AE, restrictions: Restriction.EVENT, access: [
            [Progression.PSY_DOUSE, Progression.PSY_FROST, Progression.ITEM_AQUARIUS_STONE],
            [Progression.PSY_PARCH, Progression.ITEM_AQUARIUS_STONE]
        ]},
        { flag: 0xE73, access: [
            [Progression.PSY_DOUSE, Progression.PSY_FROST],
            [Progression.PSY_DOUSE, Progression.PSY_PARCH]
        ]},
        { flag: 0xF68 },
        { flag: 0xF69 },
        { flag: 0xF6A, access: [[Progression.PSY_DOUSE, Progression.PSY_FROST]] },
        { flag: 0xF6B, access: [[Progression.PSY_DOUSE]] },
        { flag: 0xF6C, access: [[Progression.PSY_DOUSE, Progression.PSY_FROST]] },
        { flag: 0xF6D, access: [
            [Progression.PSY_DOUSE, Progression.PSY_FROST],
            [Progression.PSY_DOUSE, Progression.PSY_PARCH]
        ]},
        { flag: 0xF6E, access: [
            [Progression.PSY_DOUSE, Progression.PSY_FROST],
            [Progression.PSY_DOUSE, Progression.PSY_PARCH]
        ]},
        { flag: 0xF6F, access: [[Progression.PSY_PARCH]] },
        { flag: 0xF70, access: [[Progression.PSY_DOUSE, Progression.PSY_FROST]] },
        { flag: 0xF71, access: [[Progression.PSY_DOUSE, Progression.PSY_FROST]] },
        { flag: 0xF72, access: [
            [Progression.PSY_DOUSE, Progression.PSY_FROST],
            [Progression.PSY_PARCH]
        ]},
    ],

    djinn: [
        { flag: 0x50, access: [[Progression.PSY_PARCH]] }
    ]
};

export default location;