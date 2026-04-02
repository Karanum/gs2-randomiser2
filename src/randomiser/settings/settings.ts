import { settingsLayout } from "./data";
import { Setting } from "./enums";

export type SettingsObject = Record<Setting, number>;

export const ARRAY_SIZE = 13;

export function toUint8(settings : SettingsObject) : Uint8Array {
    const array = new Uint8Array(ARRAY_SIZE);

    Object.entries(settingsLayout).forEach(([ key, [byte, offset, size] ]) => {
        const value = settings[Number(key) as Setting];
        const mask = (1 << size) - 1;
        array[byte] += ((value & mask) << offset);
    });

    return array;
}

export function fromUint8(array : Uint8Array) : SettingsObject {
    const settings : Partial<SettingsObject> = {};

    Object.entries(settingsLayout).forEach(([ key, [byte, offset, size] ]) => {
        const mask = (1 << size - 1);
        const value = ((array[byte] >> offset) & mask);
        settings[Number(key) as Setting] = value;
    });

    return settings as SettingsObject;
}