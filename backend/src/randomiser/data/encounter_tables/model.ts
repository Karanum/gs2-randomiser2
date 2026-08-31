import { EncounterTableDefinition } from "$lib/definitions";
import type { BinaryView } from "../../binary_view";
import { DataModel } from "../base";

/**
 * Data class representing a single area encounter table.
 */
export class EncounterTable extends DataModel
{
    public encounterRate : number;
    public playerLevel : number;
    public groups : number[];
    public weights : number[];

    constructor (id:number, encounterRate:number, playerLevel:number, groups:number[], weights:number[])
    {
        super(id, EncounterTableDefinition.ADDRESS + id * EncounterTableDefinition.BLOCK_SIZE);
        this.encounterRate = encounterRate;
        this.playerLevel = playerLevel;
        this.groups = [...groups];
        this.weights = [...weights];
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        const data : number[] = [ this.encounterRate & 0xFF, this.encounterRate >> 8,
            this.playerLevel & 0xFF, this.playerLevel >> 8];
        for (let i = 0; i < 8; ++i) {
            data[4 + 2 * i] = (this.groups[i] ?? 0) & 0xFF;
            data[5 + 2 * i] = (this.groups[i] ?? 0) >> 8;
            data[20 + i] = this.weights[i] ?? 0;
        }
        return new Uint8Array(data);
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : EncounterTable
    {
        return new EncounterTable(this.id, this.encounterRate, this.playerLevel, this.groups, this.weights);
    }

    /**
     * Creates a new `EncounterTable` instance from a binary data block.
     * @param id The zero-indexed id of the table within the game data
     * @param data The binary data block to read from; must be 28 bytes
     * @returns The newly created `EncounterTable`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView) : EncounterTable|undefined
    {
        if (data.length < EncounterTableDefinition.BLOCK_SIZE) return;
        const groups : number[] = [];
        const weights : number[] = [];

        for (let i = 0; i < 8; ++i) {
            groups.push(data.readHalfword(4 + 2 * i));
            weights.push(data.readByte(20 + i));
        }

        return new EncounterTable(id, data.readHalfword(0), data.readHalfword(2), groups, weights);
    }
}