import { DjinniDefinition } from "$lib/definitions";
import type { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import type { Element } from "../enums";
import type { TextManager } from "../text/manager";

/**
 * Data class representing a single Djinni.
 */
export class Djinni extends DataModel
{
    readonly element : Element;

    public name : string;
    public stats : number[];
    public ability : number;

    constructor (id : number, name : string, stats : number[], ability : number) 
    {
        super(id, DjinniDefinition.ADDRESS + DjinniDefinition.BLOCK_SIZE * id);
        this.element = Math.floor(id / 20);

        this.name = name;
        this.stats = stats;
        this.ability = ability;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        return new Uint8Array([ this.ability & 0xFF, this.ability >> 8, 0, 0, 
            this.stats[0], this.stats[1], this.stats[2], this.stats[3], this.stats[4], this.stats[5], 0, 0 ]);
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : Djinni 
    {
        return new Djinni(this.id, this.name, [...this.stats], this.ability);
    }

    /**
     * Creates a new `Djinni` instance from a binary data block.
     * @param id The zero-indexed id of the djinni within the game data
     * @param data The binary data block to read from; must be 12 bytes
     * @returns The newly created `Djinni`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, text : TextManager) : Djinni|undefined
    {
        if (data.length < DjinniDefinition.BLOCK_SIZE) return;
        const name : string = text.get(DjinniDefinition.TEXT_NAMES + id) ?? '?';

        const stats : number[] = [];
        for (let i = 0; i < 6; ++i) {
            stats.push(data.readByte(4 + i));
        }

        return new Djinni(id, name, stats, data.readHalfword(0));
    }
}