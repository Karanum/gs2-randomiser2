import { MapCodeEntry } from "../data/map_code/enums";
import { END, END_PERSIST, LINE, Var } from "../data/text/control_characters";
import type { RomData } from "../rom";

export function applyFastForgingPatch(rom : RomData)
{
    const mapCode = rom.mapCode.get(MapCodeEntry.YALLAM_BUILDINGS)!;
    mapCode.data.writeHalfword(0x654, 0xE065);  // b #0x02008722

    rom.text.set(4869, `Consider it done.${LINE}Just talk to my wife.${END}`);
    rom.text.set(4870, `Consider it done.${LINE}Just talk to my wife.${END}`);
    rom.text.set(4872, `You ain't got anything${LINE}for me to work with!${END}`);
    rom.text.set(4881, `It's ${Var.NUM} coins for${LINE}this ${Var.ITEM_NAME}.${LINE}Do you want it?${END_PERSIST}`);
}