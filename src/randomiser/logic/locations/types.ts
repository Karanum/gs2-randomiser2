import type { Progression, Restriction } from "../enums";

export type LogicItem = {
    flag: number,
    access?: Progression[][],
    restrictions?: Restriction
}

export type LogicDjinni = {
    flag: number,
    access?: Progression[][]
}

export type LogicProgression = {
    key: Progression,
    access: Progression[][]
}

export type LogicMap = {
    items: LogicItem[],
    djinn: LogicDjinni[],
    progression: LogicProgression[]
};

export type LogicMapLocation = { access: Progression[][] } & Partial<LogicMap>;