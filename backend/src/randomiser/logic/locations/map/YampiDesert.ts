import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x88C, restrictions: Restriction.EVENT, access: [[Progression.BOSS_KING_SCORPION]] },
        { flag: 0x88E, access: [
            [Progression.ACCESS_YAMPI_BACKSIDE, Progression.PSY_REVEAL],
            [Progression.ACCESS_YAMPI_BACKSIDE, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF18, access: [
            [Progression.PSY_POUND],
            [Progression.PSY_SAND],
            [Progression.PSY_SCOOP, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF19, access: [
            [Progression.PSY_POUND],
            [Progression.PSY_SAND]
        ] },
        { flag: 0xF1A, access: [
            [Progression.ACCESS_YAMPI_BACKSIDE, Progression.PSY_LASH],
            [Progression.ACCESS_YAMPI_BACKSIDE, Progression.PSY_SAND],
            [Progression.ACCESS_YAMPI_BACKSIDE, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ] },
        { flag: 0xF1B, access: [[Progression.ACCESS_YAMPI_BACKSIDE]] },
        { flag: 0xF1C, access: [[Progression.ACCESS_YAMPI_BACKSIDE, Progression.PSY_POUND]] },
        { flag: 0xF89, access: [[Progression.ACCESS_YAMPI_BACKSIDE, Progression.PSY_SCOOP]] }
    ],

    djinn: [
        { flag: 0x74, access: [
            [Progression.PSY_POUND],
            [Progression.SKIPS_SAND, Progression.PSY_SAND]
        ] }
    ],

    progression: [
        { key: Progression.BOSS_KING_SCORPION, access: [[Progression.PSY_POUND, Progression.NUM_DJINN_3]] },
        { key: Progression.ACCESS_YAMPI_BACKSIDE, access: [
            [Progression.SKIPS_RETREAT_OOB],
            [Progression.PSY_SCOOP],
            [Progression.PSY_SAND],
            [Progression.SHIP]
        ] }
    ]
};

export default location;