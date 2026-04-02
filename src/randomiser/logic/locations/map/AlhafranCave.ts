import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation =
{
    access: [
        [Progression.BRIGGS_ESCAPED],
        [Progression.BOSS_BRIGGS, Progression.PSY_TREMOR]
    ],

    items: [
        { flag: 0xF25, access: [[Progression.PSY_POUND, Progression.PSY_LASH]] },
        { flag: 0xF26, access: [[Progression.PSY_POUND, Progression.PSY_LASH]] },
        { flag: 0xF27, access: [[Progression.PSY_POUND, Progression.PSY_LASH]] },
        { flag: 0xF8E, access: [[Progression.BRIGGS_ESCAPED]] },
        { flag: 0xF8F, access: [
            [Progression.BRIGGS_ESCAPED, Progression.PSY_FROST],
            [Progression.PSY_POUND, Progression.PSY_LASH, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ]},
        { flag: 0xF90, access: [
            [Progression.BRIGGS_ESCAPED, Progression.PSY_FROST],
            [Progression.PSY_POUND, Progression.PSY_LASH, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ]},
        { flag: 0xF91, access: [
            [Progression.BRIGGS_ESCAPED, Progression.PSY_FROST],
            [Progression.PSY_POUND, Progression.PSY_LASH, Progression.SKIPS_MISSABLE, Progression.SKIPS_RETREAT]
        ]}
    ]
}

export default location;