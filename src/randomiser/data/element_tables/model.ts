import { ElementTableDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import { clamp } from "$lib/util";
import type { BinaryView } from "../../binary_view";
import type { Element } from "../enums";

/**
 * Data class representing a single elemental stats table.
 */
export class ElementTable
{
    readonly id : number;
    readonly address : number;
    
    public element : Element;
    public levels : number[];
    public power : number[];
    public resist : number[];

    constructor (id:number, element:Element, levels:number[], power:number[], resist:number[])
    {
        this.id = id;
        this.address = ElementTableDefinition.ADDRESS + id * ElementTableDefinition.BLOCK_SIZE;

        this.element = element;
        this.levels = levels;
        this.power = power;
        this.resist = resist;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        return new Uint8Array([ this.element, 0, 0, 0, this.levels[0], this.levels[1], this.levels[2], this.levels[3],
            this.power[0] & 0xFF, this.power[0] >> 8, this.resist[0] & 0xFF, this.resist[0] >> 8,
            this.power[1] & 0xFF, this.power[1] >> 8, this.resist[1] & 0xFF, this.resist[1] >> 8,
            this.power[2] & 0xFF, this.power[2] >> 8, this.resist[2] & 0xFF, this.resist[2] >> 8,
            this.power[3] & 0xFF, this.power[3] >> 8, this.resist[3] & 0xFF, this.resist[3] >> 8 ]);
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : ElementTable 
    {
        return new ElementTable(this.id, this.element, [...this.levels], [...this.power], [...this.resist]);
    }

    /**
     * Shuffles the elemental resistances in this table.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleResistances (prng : PRNG)
    {
        const pool = [...this.resist];
        this.resist = [];

        while (pool.length > 0) {
            this.resist.push(prng.randomArrayElement(pool, true));
        }
    }

    /**
     * Randomises the elemental resistances in this table.
     * @param prng The PRNG instance for the currently generating seed
     */
    randomiseResistances (prng : PRNG)
    {   
        let total = this.resist.reduce((acc, res) => acc + res, 0);
        let values = [];

        for (let i = 0; i < 3; ++i) {
            let res = prng.randomBetween(total / 6, total / 2);
            res = Math.floor(clamp(res, total / 4, 200));
            values.push(res);
            total -= res;
        }
        values.push(Math.min(200, total));

        for (let i = 0; i < 4; ++i) {
            this.resist[i] = prng.randomArrayElement(values, true);
        }
    }

    /**
     * Creates a new `ElementTable` instance from a binary data block.
     * @param id The zero-indexed id of the table within the game data
     * @param data The binary data block to read from; must be 24 bytes
     * @returns The newly created `ElementTable`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView) : ElementTable|undefined
    {
        if (data.length < ElementTableDefinition.BLOCK_SIZE) return;

        const levels : number[] = [];
        const power : number[] = [];
        const resist : number[] = [];

        for (let i = 0; i < 4; ++i) {
            levels.push(data.readByte(4 + i));
            power.push(data.readHalfword(8 + i * 4));
            resist.push(data.readHalfword(10 + i * 4));
        }

        return new ElementTable(id, data.readByte(0), levels, power, resist);
    }
}