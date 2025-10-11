import { PRNG } from "$lib/prng";
import { RomData } from "./rom";

let vanillaData : RomData;

export function init() {
    vanillaData = new RomData();

    //DEBUG
    // const prng = new PRNG(Date.now());
    // vanillaData.characters.randomiseElements(prng);
    // for (let i = 0; i < 8; ++i) {
    //     let char = vanillaData.characters.get(i);
    //     console.log(char?.name, char?.eLevels);
    // }
}