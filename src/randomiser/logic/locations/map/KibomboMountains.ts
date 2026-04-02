import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.ACCESS_GONDOWAN],
        [Progression.SHIP]
    ],

    items: [
        { flag: 0xF49, access: [
            [Progression.PSY_LASH],
            [Progression.GABOMBA_CLEARED],
            [Progression.SHIP, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF4A, access: [
            [Progression.PSY_LASH],
            [Progression.GABOMBA_CLEARED],
            [Progression.SHIP, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF4B },
        { flag: 0xF4C, access: [
            [Progression.PSY_LASH],
            [Progression.GABOMBA_CLEARED],
            [Progression.SHIP, Progression.SKIPS_RETREAT]
        ] }
    ],

    djinn: [
        { flag: 0x76, access: [
            [Progression.PSY_FROST, Progression.PSY_GROWTH],
            [Progression.PSY_LASH, Progression.SKIPS_RETREAT_SAVEQUIT],
            [Progression.SHIP, Progression.SKIPS_RETREAT_SAVEQUIT]
        ] }
    ]
};

export default location;