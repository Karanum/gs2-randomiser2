import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = 
{
    access: [
        [Progression.SHIP, Progression.PSY_GRIND],
        [Progression.SHIP_FLIGHT]
    ],

    items: [
        { flag: 0x1B, access: [[Progression.ANEMOS_OPEN, Progression.PSY_TELEPORT]] },
        { flag: 0x1C, access: [
            [Progression.BOSS_DULLAHAN],
            [Progression.PSY_REVEAL, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT],
            [Progression.ANEMOS_OPEN, Progression.PSY_TELEPORT, Progression.SKIPS_RETREAT]
        ]},
        { flag: 0xE05, access: [[Progression.ANEMOS_OPEN, Progression.PSY_TELEPORT]] },
        { flag: 0xE05, access: [[Progression.ANEMOS_OPEN, Progression.PSY_TELEPORT, Progression.PSY_LIFT]] }
    ],

    progression: [
        { key: Progression.ANEMOS_OPEN, access: [[Progression.NUM_DJINN_72]] },
        { key: Progression.BOSS_DULLAHAN, access: [
            [
                Progression.ANEMOS_OPEN, 
                Progression.PSY_TELEPORT, 
                Progression.PSY_SAND,
                Progression.PSY_HOVER,
                Progression.PSY_LIFT,
                Progression.NUM_DJINN_72
            ]
        ]}
    ]
};

export default location;