import { readFileSync } from "node:fs";
import { AbilityManager } from "./data/abilities/manager";
import { timeFunction } from "$lib/util";
import { CharacterManager } from "./data/characters/manager";
import { BinaryView } from "./binary_view";
import { TextManager } from "./data/text/manager";
import { ClassManager } from "./data/classes/manager";
import { DjinniManager } from "./data/djinn/manager";

/**
 * Represents the full ROM data from the game. Includes utility methods for easy reading and writing of binary data.
 */
export class RomData extends BinaryView
{
    readonly abilities : AbilityManager;
    readonly characters : CharacterManager;
    readonly classes : ClassManager;
    readonly djinn : DjinniManager;
    readonly text : TextManager;

    /**
     * @param instance (optional) An existing `RomData` instance to clone; will load and parse data from `src/rom/gs2.gba` if not provided
     */
    constructor(instance? : RomData) {
        super();

        if (instance == undefined) {
            // Creates the RomData from the ROM file
            console.log('Loading game data from ROM...');
            const file = readFileSync("./src/rom/gs2.gba");
            this.data = Uint8Array.from(file);

            this.text = timeFunction(() => TextManager.loadFromRom(this), '> Loading text data...');

            this.abilities = timeFunction(() => AbilityManager.loadFromRom(this), '> Loading abilities...');
            this.characters = timeFunction(() => CharacterManager.loadFromRom(this), '> Loading characters...');
            this.classes = timeFunction(() => ClassManager.loadFromRom(this), '> Loading classes...');
            this.djinn = timeFunction(() => DjinniManager.loadFromRom(this), '> Loading djinn...');
        } else {
            // Creates the RomData by copying another instance
            this.data = Uint8Array.from(instance.data);

            this.abilities = instance.abilities.clone();
            this.characters = instance.characters.clone();
            this.classes = instance.classes.clone();
            this.djinn = instance.djinn.clone();
            this.text = instance.text.clone();
        }
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : RomData
    {
        return new RomData(this);
    }
}