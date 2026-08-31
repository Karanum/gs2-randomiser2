import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation =
{
    access: [
        [Progression.ACCESS_YAMPI_BACKSIDE], 
        [Progression.SHIP]
    ],
    
    items: [
        { flag: 0xF1D, access: [
            [Progression.PSY_REVEAL],
            [Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ]},
        { flag: 0xF1E },
        { flag: 0xF1F, access: [[Progression.BOSS_BRIGGS]] },
        { flag: 0xF20 },
        { flag: 0xF21 },
        { flag: 0xF23 },
        { flag: 0xF24 },
    ],

    progression: [
        { key: Progression.BOSS_BRIGGS, access: [[Progression.NUM_DJINN_6]] },
        { key: Progression.BRIGGS_ESCAPED, access: [
            [
                Progression.BOSS_BRIGGS, 
                Progression.PSY_LASH, 
                Progression.PSY_POUND, 
                Progression.PSY_BURST
            ],
            [
                Progression.BOSS_BRIGGS, 
                Progression.SKIPS_RETREAT_SAVEQUIT, 
                Progression.PSY_BURST
            ],
            [
                Progression.SKIPS_SAND, 
                Progression.PSY_SAND, 
                Progression.PSY_BURST
            ]    
        ]}
    ]
};

export default location;