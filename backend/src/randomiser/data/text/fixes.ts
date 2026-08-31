import { END, END_PERSIST, LINE, Var } from "./control_characters";
import type { TextManager } from "./manager";

//TODO: Migrate all of this into other files. Decided that the naming scheme just doesn't vibe.

export function applyGenericTextFixes(text : TextManager) : void
{
    // Update dialogue for changing how Sunshine's forge works
    text.set(4869, `Consider it done.${LINE}Just talk to my wife.${END}`);
    text.set(4870, `Consider it done.${LINE}Just talk to my wife.${END}`);
    text.set(4872, `You ain't got anything${LINE}for me to work with!${END}`);
    text.set(4881, `It's ${Var.NUM} coins for${LINE}this ${Var.ITEM_NAME}.${LINE}Do you want it?${END_PERSIST}`);

    // Set dialogue for the fast Gabomba Statue puzzle
    text.set(320, `Are you finished with${LINE}the puzzle, ${Var.LEADER}?${END_PERSIST}`);
}