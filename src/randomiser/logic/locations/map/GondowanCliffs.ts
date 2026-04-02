import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0xF40, access: [[Progression.PSY_FROST]] },
        { flag: 0xF41, access: [
            [Progression.PSY_FROST],
            [Progression.PSY_SCOOP],
            [Progression.ACCESS_GONDOWAN, Progression.BOSS_BRIGGS]
        ] },
        { flag: 0xF43, access: [
            [Progression.PSY_FROST],
            [Progression.PSY_SCOOP],
            [Progression.ACCESS_GONDOWAN, Progression.BOSS_BRIGGS]
        ] }
    ],

    djinn: [
        { flag: 0x61, access: [
            [Progression.PSY_FROST],
            [Progression.PSY_SCOOP],
            [Progression.ACCESS_GONDOWAN, Progression.BOSS_BRIGGS]
        ] }
    ],

    progression: [
        { key: Progression.ACCESS_GONDOWAN, access: [
            [Progression.SHIP],
            [Progression.BOSS_BRIGGS, Progression.PSY_FROST],
            [Progression.BOSS_BRIGGS, Progression.PSY_SCOOP],
            [Progression.SKIPS_RETREAT_OOB, Progression.PSY_WHIRLWIND]
        ] }
    ]
};

export default location;