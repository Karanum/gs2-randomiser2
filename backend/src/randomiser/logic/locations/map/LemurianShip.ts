import { Progression, Restriction } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [
        [Progression.CHAR_PIERS, Progression.GABOMBA_CLEARED, Progression.ITEM_BLACK_CRYSTAL],
        [Progression.SHIP_OPEN],
        [Progression.SHIP_DOCKED]
    ],

    items: [
        { flag: 0xF54, access: [
            [Progression.SHIP_DOCKED, Progression.PSY_FROST],
            [Progression.SKIPS_MISSABLE, Progression.PSY_FROST]
        ] },
        { flag: 0xF55, access: [
            [Progression.SHIP_DOCKED],
            [Progression.SKIPS_MISSABLE]
        ] },
        { flag: 0xF56, access: [
            [Progression.SHIP_DOCKED, Progression.PSY_FROST],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT_SAVEQUIT]
        ] },
        { flag: 0xF57, access: [
            [Progression.SHIP_DOCKED, Progression.PSY_FROST],
            [Progression.SHIP_DOCKED, Progression.SKIPS_RETREAT_OOB],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT_OOB]
        ] },
        { flag: 0xF58, restrictions: Restriction.RELATED_EVENT, access: [
            [Progression.SHIP_DOCKED, Progression.BOSS_AQUA_HYDRA, Progression.PSY_PARCH],
            [Progression.SKIPS_MISSABLE, Progression.BOSS_AQUA_HYDRA, Progression.PSY_PARCH]
        ] }
    ],

    progression: [
        { key: Progression.BOSS_AQUA_HYDRA, access: [
            [Progression.NUM_DJINN_10, Progression.PSY_FROST],
            [Progression.NUM_DJINN_10, Progression.SKIPS_RETREAT_OOB]
        ] },
        { key: Progression.SHIP, access: [[Progression.BOSS_AQUA_HYDRA, Progression.PSY_DOUSE]] }
    ]
};

export default location;