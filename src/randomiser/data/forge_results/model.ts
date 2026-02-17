import { ForgeResultDefinition } from "$lib/definitions";
import type { BinaryView } from "../../binary_view";
import { DataModel } from "../base";

export class ForgeResult extends DataModel
{
    public forgeItem : number;
    public isRusty : boolean;
    public results : number[];
    public weights : number[];

    constructor (id : number, forgeItem : number, isRusty : boolean, results : number[], weights : number[])
    {
        super(id, ForgeResultDefinition.ADDRESS + id * ForgeResultDefinition.BLOCK_SIZE);
        this.forgeItem = forgeItem;
        this.isRusty = isRusty;
        this.results = [...results];
        this.weights = [...weights];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : ForgeResult 
    {
        return new ForgeResult(this.id, this.forgeItem, this.isRusty, this.results, this.weights);
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary() : Uint8Array 
    {
        const data = [this.forgeItem & 0xFF, this.forgeItem >> 8, this.isRusty ? 1 : 0, 0];
        for (let i = 0; i < 8; ++i) {
            data[4 + 2 * i] = this.results[i] & 0xFF;
            data[5 + 2 * i] = this.results[i] >> 8;
            data[20 + 2 * i] = this.weights[i] & 0xFF;
            data[21 + 2 * i] = this.weights[i] >> 8;
        }
        return new Uint8Array(data);
    }

    /**
     * Creates a new `ForgeResult` instance from a binary data block.
     * @param id The zero-indexed id of the entry within the game data
     * @param data The binary data block to read from; must be 36 bytes
     * @returns The newly created `ForgeResult`, or `undefined` if the binary data block is too short
     */
    static createFromBinary(id : number, data : BinaryView) : ForgeResult|undefined
    {
        if (data.length < ForgeResultDefinition.BLOCK_SIZE) return;
        const results = [];
        const weights = [];

        for (let i = 0; i < 8; ++i) {
            results.push(data.readHalfword(4 + 2 * i));
            weights.push(data.readHalfword(20 + 2 * i));
        }

        return new ForgeResult(id, data.readHalfword(0), data.readByte(2) == 1, results, weights);
    }
}