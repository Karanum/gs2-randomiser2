import { AbilityDefinition, SummonDefinition } from "$lib/definitions";
import type { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import type { TextManager } from "../text/manager";

/**
 * Data class representing a single summon.
 */
export class Summon extends DataModel
{
    public ability : number;
    public venusCost : number;
    public mercuryCost : number;
    public marsCost : number;
    public jupiterCost : number;
    readonly name : string;

    constructor(id : number, name : string, ability : number, venusCost : number, mercuryCost : number, marsCost : number, jupiterCost : number)
    {
        super(id, SummonDefinition.ADDRESS + id * SummonDefinition.BLOCK_SIZE);
        this.name = name;

        this.ability = ability;
        this.venusCost = venusCost;
        this.mercuryCost = mercuryCost;
        this.marsCost = marsCost;
        this.jupiterCost = jupiterCost;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : Summon 
    {
        return new Summon(this.id, this.name, this.ability, this.venusCost, this.mercuryCost, this.marsCost, this.jupiterCost);
    }

    /**
     * Returns the total Djinn cost of this summon.
     */
    getTotalCost() : number 
    {
        return this.venusCost + this.mercuryCost + this.marsCost + this.jupiterCost;
    }

    /**
     * Shorthand function for setting the Djinn costs of this summon.
     * @param cost An array of the `Venus`, `Mercury`, `Mars` and `Jupiter` costs in that order
     */
    setCost(cost : [number, number, number, number])
    {
        this.venusCost = cost[0];
        this.mercuryCost = cost[1];
        this.marsCost = cost[2];
        this.jupiterCost = cost[3];
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary() : Uint8Array 
    {
        return Uint8Array.from([
            this.ability & 0xFF, this.ability << 8, 0, 0,
            this.venusCost, this.mercuryCost, this.marsCost, this.jupiterCost
        ]);
    }

    /**
     * Creates a new `Summon` instance from a binary data block.
     * @param id The zero-indexed id of the summon within the game data
     * @param data The binary data block to read from; must be 8 bytes
     * @returns The newly created `Summon`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, text : TextManager) : Summon|undefined
    {
        if (data.length < SummonDefinition.BLOCK_SIZE) return;

        const ability = data.readHalfword(0);
        return new Summon(id, text.get(AbilityDefinition.TEXT_NAMES + ability) ?? '?', ability,
            data.readByte(4), data.readByte(5), data.readByte(6), data.readByte(7));
    }
}