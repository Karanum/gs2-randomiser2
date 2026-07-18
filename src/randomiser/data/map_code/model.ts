import { compressBranchLinks, compressFormat1 } from "$lib/compression";
import { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import { EventType, FacingType, type Facing } from "./enums";

/**
 * Data class representing a single map code script.
 */
export class MapCode extends DataModel
{
    public data : BinaryView;
    public hasChanged : boolean;

    constructor (id : number, data : BinaryView, hasChanged : boolean = false)
    {
        super(id, 0);
        this.data = data;
        this.hasChanged = hasChanged;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : MapCode 
    {
        return new MapCode(this.id, this.data.clone(), this.hasChanged);
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        const cloned = this.data.clone();
        compressBranchLinks(cloned);
        return compressFormat1(cloned).getData();
    }

    /**
     * Writes an NPC into the binary data of this map code.
     * @param address The address to write this NPC to
     * @param sprite Sprite index to use for this NPC
     * @param flag Flag for conditional placement, `-1` to ignore
     * @param idle Idle script pointer or preset index
     * @param x X coordinate to place this NPC at (coordinate table index if `coordinateLookup` is enabled)
     * @param z Z coordinate to place this NPC at
     * @param y Y coordinate to place this NPC at
     * @param facing Initial facing direction (use `Facing.S` for static objects)
     * @param facingType Facing behaviour when interacted with
     * @param reuseVRAM Use the same VRAM slot as the previous entry in this NPC table
     * @param coordinateLookup Use the coordinate lookup table for this map to control NPC positioning
     */
    setNpcEntry (address: number, sprite: number, flag: number, idle: number, x: number, z: number, y: number, 
        facing: Facing, facingType: FacingType, reuseVRAM: boolean = false, coordinateLookup : boolean = false) : void
    {
        let flags = 0;
        if (reuseVRAM) { flags += 1; }
        if (coordinateLookup) { flags += 2; }

        this.data.writeHalfword(address + 0, sprite);
        this.data.writeHalfword(address + 2, flag);
        this.data.writeWord(address + 4, idle);
        this.data.writeWord(address + 8, x);
        this.data.writeWord(address + 12, z);
        this.data.writeWord(address + 16, y);
        this.data.writeHalfword(address + 20, facing);
        this.data.writeByte(address + 22, facingType);
        this.data.writeByte(address + 23, flags);
    }

    /**
     * Writes a sign-like NPC entry into the binary data of this map code.
     * @param address The address to write this NPC to
     * @param sprite Sprite index to use for this NPC
     * @param flag Flag for conditional placement, `-1` to ignore
     * @param x X coordinate to place this NPC at
     * @param z Z coordinate to place this NPC at
     * @param y Y coordinate to place this NPC at
     */
    setSignlikeNpcEntry (address : number, sprite : number, flag: number, x : number, z : number, y : number) : void
    {
        this.setNpcEntry(address, sprite, flag, 0x1, x, z, y, 0, 0);
    }

    /**
     * Writes an end-of-table NPC entry into the binary data of this map code.
     * @param address The address to write this NPC to
     */
    setFinalNpcEntry (address : number) : void
    {
        this.setNpcEntry(address, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    /**
     * Writes an event entry into the binary data of this map code.
     * @param address The address to write this event to
     * @param type The type of the event
     * @param params Extra event parameter(s), 8-bit value for Psynergy and Item event types, 12-bit value for all other types
     * @param state State index for Psynergy and Item event types
     * @param objectId Index of the object that triggers this event (NPC/tile/trigger)
     * @param flag Flag for conditional activation, `-1` to ignore
     * @param handler Event handler (pointer/exit/dialogue)
     */
    setEventEntry (address: number, type: EventType, params: number, state: number, objectId: number, flag: number, handler: number) : void
    {
        params <<= 4;
        if ((type & 0xF) == EventType.ITEM_TILE || (type & 0xF) == EventType.PSYNERGY_TILE) {
            params <<= 4;
        }

        this.data.writeHalfword(address + 0, type | params);
        this.data.writeHalfword(address + 2, state);
        this.data.writeHalfword(address + 4, objectId);
        this.data.writeHalfword(address + 6, flag);
        this.data.writeWord(address + 8, handler);
    }

    /**
     * Writes a standard `bl` jump instruction to the map code data. Writes 4 bytes.
     * Will fail if the destination address is too far from the source address.
     * Data will not be written to addresses outside the view.
     * @param address The address to write the instruction to
     * @param jumpTo The address to jump to
     */
    writeLinkedJump (address : number, jumpTo : number) : void
    {
        this.data.writeLinkedJump(address, 0x02008000, jumpTo);
    }
}