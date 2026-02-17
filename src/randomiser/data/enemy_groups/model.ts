import { EnemyGroupDefinition } from "$lib/definitions";
import type { BinaryView } from "../../binary_view";
import { DataModel } from "../base";

export type EnemySlot = {
    enemy : number,
    min : number,
    max : number
};

/**
 * Data class representing a single enemy encounter group.
 */
export class EnemyGroup extends DataModel
{
    public slots : EnemySlot[];

    constructor (id : number, slots : EnemySlot[])
    {
        super(id, EnemyGroupDefinition.ADDRESS + id * EnemyGroupDefinition.BLOCK_SIZE);
        this.slots = slots;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        const data : number[] = new Array(24).fill(0);
        for (let i = 0; i < 5 && i < this.slots.length; ++i) {
            const slot = this.slots[i];
            if (!slot) continue;

            data[i * 2] = slot.enemy & 0xFF;
            data[1 + i * 2] = slot.enemy >> 8;
            data[10 + i] = slot.min;
            data[15 + i] = slot.max;
        }
        return new Uint8Array(data);
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : EnemyGroup 
    {
        return new EnemyGroup(this.id, this.slots.map(slot => ({ ...slot })));
    }

    /**
     * Creates a new `EnemyGroup` instance from a binary data block.
     * @param id The zero-indexed id of the group within the game data
     * @param data The binary data block to read from; must be 24 bytes
     * @returns The newly created `EnemyGroup`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView) : EnemyGroup|undefined
    {
        if (data.length < EnemyGroupDefinition.BLOCK_SIZE) return;

        const slots : EnemySlot[] = [];
        for (let i = 0; i < 5; ++i) {
            slots.push({
                enemy: data.readHalfword(i * 2),
                min: data.readByte(10 + i),
                max: data.readByte(15 + i)
            })
        }

        return new EnemyGroup(id, slots);
    }
}