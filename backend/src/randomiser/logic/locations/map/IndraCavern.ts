import { Progression } from "../../enums";
import type { LogicMapLocation } from "../types";

const location : LogicMapLocation = {
    access: [],

    items: [
        { flag: 0x10, access: [[Progression.PSY_LASH]] }
    ]
};

export default location;