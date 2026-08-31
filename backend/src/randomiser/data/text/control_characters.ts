/** Control code for ending a textbox. Will wait for input, but not close the textbox. */ 
export const BOX = '\x01';

/** Control code for ending a textbox. Will wait for input and close the textbox after. */ 
export const END = '\x02';

/** Control code for line breaks. */ 
export const LINE = '\x03';

/** Control codes for adding a pause to the text. `SHORT` is 20 frames, `MID` is 60 frames, and `LONG` is 120 frames. */
export enum Pause {
    MID = '\x04',
    SHORT = '\x05',
    LONG = '\x06',
}

/** Control code for resetting font color and font effects. */
export const RESET = '\x07';

/** Control codes for setting font color. Based on the colors of the icon palette. */
export enum Color {
    NONE = '\x08\x01',
    BLACK = '\x08\x02',
    RED = '\x08\x03',
    ORANGE = '\x08\x04',
    YELLOW = '\x08\x05',
    LIME = '\x08\x06',
    GREEN = '\x08\x07',
    CYAN = '\x08\x08',
    BLUE = '\x08\x09',
    MAGENTA = '\x08\x0A',
    BEIGE = '\x08\x0B',
    BROWN = '\x08\x0C',
    MAROON = '\x08\x0D',
    GRAY = '\x08\x0E',
    LIGHT_GRAY = '\x08\x0F',
    WHITE = '\x08\x10',
}

export enum Name {
    ISAAC = '\x11\x01',
    GARET = '\x11\x02',
    IVAN = '\x11\x03',
    MIA = '\x11\x04',
    FELIX = '\x11\x05',
    JENNA = '\x11\x06',
    SHEBA = '\x11\x07',
    PIERS = '\x11\x08'
}

/** Control codes for displaying text variables. Most of these need to be set by an event before invoking the textbox. */
export enum Var {
    LEADER = '\x10',
    CHAR_NAME = '\x12\x01',
    ITEM_NAME = '\x14\x01',
    ABILITY = '\x15',
    NUM = '\x16'
}

/** Control code for ending a textbox. Does not wait for input, and does not close the textbox.
 * Generally used in events/cutscenes that offer a choice. */
export const END_PERSIST = '\x1E';
