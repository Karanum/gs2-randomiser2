import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x8C7, access: [
            [Progression.PSY_LASH, Progression.PSY_FROST, Progression.PSY_REVEAL, Progression.ITEM_SEA_GODS_TEAR],
            [Progression.SKIPS_RETREAT, Progression.PSY_FROST, Progression.PSY_REVEAL, Progression.ITEM_SEA_GODS_TEAR],
            [Progression.SKIPS_RETREAT_OOB, Progression.PSY_REVEAL, Progression.ITEM_SEA_GODS_TEAR]
        ] },
        { flag: 0xF59, access: [
            [Progression.PSY_LASH, Progression.PSY_FROST],
            [Progression.SKIPS_RETREAT, Progression.PSY_FROST],
            [Progression.SKIPS_RETREAT_OOB, Progression.PSY_LASH]
        ] }
    ],

    djinn: [
        { flag: 0x73, access: [
            [Progression.PSY_LASH],
            [Progression.SKIPS_RETREAT]
        ] }
    ]
};

export default location;