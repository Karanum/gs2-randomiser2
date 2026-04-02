import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [[Progression.SHIP]],

    progression: [
        { key: Progression.BOSS_POSEIDON, access: [[Progression.ITEM_TRIDENT, Progression.NUM_DJINN_24]] }
    ]
};

export default location;