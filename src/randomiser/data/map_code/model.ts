import { compressBranchLinks, compressFormat1 } from "$lib/compression";
import { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import { SpriteId } from "../enums";
import { EventType, WarpAnimation, Facing, FacingType, PsynergyPhase } from "./enums";

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
     * Writes an end-of-table NPC entry into the binary data of this map code.
     * @param address The address to write this NPC to
     */
    setFinalNpcEntry (address : number) : void
    {
        let block = new BinaryView(new Uint8Array(24));
        block.writeWord(0, 0xFFFF);
        this.data.writeBlock(address, block.getData());
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


/**
 * Factory for creating NPC definitions
 */
export class NpcBuilder
{
    private sprite : number;
    private flag : number = 0xFFFF;
    private idle : number = 1;
    private x : number = 0;
    private z : number = 0;
    private y : number = 0;
    private facing : Facing = Facing.S;
    private facingType : FacingType = FacingType.STAY_AFTER_INTERACT;
    private reuseVRAM : boolean = false;
    private coordinateLookup : boolean = false;
    
    constructor (sprite : number)
    {
        this.sprite = sprite;
    }

    /**
     * Sets the display condition flag for this NPC. If this flag is set, the NPC will be hidden.
     * Add 0x1000 to the flag value to invert this behaviour. 0xFFFF (default) disables flag checking.
     * @param flag The flag to use as the display condition
     */
    setFlag (flag : number) : NpcBuilder
    {
        this.flag = flag;
        return this;
    }

    /**
     * Sets the idle script for this NPC. Defaults to `1`, which displays the sprite's idle animation if present.
     * @param idleScript The idle script index within the game data
     */
    setIdleScript (idleScript : number) : NpcBuilder
    {
        this.idle = idleScript;
        return this;
    }

    /**
     * Sets the position for this NPC.
     * @param x The X coordinate
     * @param z The Z coordinate (NOTE: not all maps use height-based positions so this will often be `0`)
     * @param y The Y coordinate
     */
    setPosition (x : number, z : number, y : number) : NpcBuilder
    {
        this.x = x;
        this.z = z;
        this.y = y;
        return this;
    }

    /**
     * Flags this NPC for using a lookup table for its coordinates.
     * @param id The lookup table entry for this NPC
     */
    useCoordinateLookup (id : number) : NpcBuilder
    {
        this.x = id;
        this.coordinateLookup = true;
        return this;
    }

    /**
     * Sets the initial facing direction for this NPC.
     * Optionally also sets the facing behaviour when interacted with.
     * @param facing The initial facing direction
     * @param type The facing behaviour
     * @returns 
     */
    setFacing (facing : Facing, type? : FacingType) : NpcBuilder
    {
        this.facing = facing;
        if (type) this.facingType = type;
        return this;
    }

    /**
     * Flags this NPC to reuse the VRAM data of the previous NPC object in the table.
     */
    reusePreviousVRAM () : NpcBuilder
    {
        this.reuseVRAM = true;
        return this;
    }

    /**
     * Builds the NPC object into binary data for insertion into map code.
     */
    build () : Uint8Array
    {
        let flags = 0;
        if (this.reuseVRAM) flags += 1;
        if (this.coordinateLookup) flags += 2;

        const block = new BinaryView(new Uint8Array(24));
        block.writeHalfword(0, this.sprite);
        block.writeHalfword(2, this.flag);
        block.writeWord(4, this.idle);
        block.writeWord(8, this.x);
        block.writeWord(12, this.z);
        block.writeWord(16, this.y);
        block.writeHalfword(20, this.facing);
        block.writeByte(22, this.facingType);
        block.writeByte(23, flags);
        return block.getData();
    }
}

/**
 * Factory for creating map event definitions
 */
export class EventBuilder
{
    private type : EventType = EventType.NPC;
    private params : number = 0;
    private objectId : number = 0;
    private flag : number = 0xFFFF;
    private handler : number = 0;

    constructor () {}

    /**
     * Sets the trigger condition flag for this event. If this flag is set, the event will be disabled.
     * Add 0x1000 to the flag value to invert this behaviour. 0xFFFF (default) disables flag checking.
     * @param flag The flag to use as the trigger condition
     */
    setFlag (flag : number) : EventBuilder
    {
        this.flag = flag;
        return this;
    }

    setType (type : EventType, params? : number) : EventBuilder
    {
        this.type = type;
        this.params = params ?? 0;
        return this;
    }
    
    setTriggerId (id : number) : EventBuilder
    {
        this.objectId = id;
        return this;
    }

    setHandler (handler : number) : EventBuilder
    {
        this.handler = handler;
        return this;
    }

    asNpc (objectId : number, handler : number, facing? : Facing) : EventBuilder
    {
        this.type = EventType.NPC;
        this.params = 0;
        if (facing !== undefined) this.params += 4 + (facing >> 0x8);
        this.objectId = objectId;
        this.handler = handler;
        return this;
    }

    asWarp (tileId : number, exitId : number, facing? : Facing, onPushTimer? : boolean, onCollision? : boolean, animation? : WarpAnimation) : EventBuilder
    {
        this.type = EventType.WARP + ((animation ?? 0) << 4);
        this.params = 0;
        if (onPushTimer) this.params += 2;
        if (facing !== undefined) this.params += 4 + (facing >> 0x8);
        if (onCollision) this.params += 8;

        this.objectId = tileId;
        this.handler = exitId;
        return this;
    }

    asTileTrigger (tileId : number, handler : number, facing? : Facing, onPushTimer? : boolean) : EventBuilder
    {
        this.type = EventType.COLLISION;
        this.params = 0;
        if (onPushTimer) this.params += 2;
        if (facing !== undefined) this.params += 4 + (facing >> 0x8);

        this.objectId = tileId;
        this.handler = handler;
        return this;
    }

    asTileInteraction (tileId : number, handler : number, presetInteraction? : number) : EventBuilder
    {
        this.type = EventType.INTERACT;
        this.params = presetInteraction ?? 0;
        this.objectId = tileId;
        this.handler = handler;
        return this;
    }

    asTileItemPrompt (tileId : number, itemId : number, handler : number) : EventBuilder
    {
        this.type = EventType.ITEM_TILE;
        this.params = itemId;
        this.objectId = tileId;
        this.handler = handler;
        return this;
    }

    asObjectItemPrompt (objectId : number, itemId : number, handler : number) : EventBuilder
    {
        this.type = EventType.ITEM_OBJECT;
        this.params = itemId;
        this.objectId = objectId;
        this.handler = handler;
        return this;
    }

    asTilePsynergyTrigger (tileId : number, psynergyId : number, handler : number, phase? : PsynergyPhase) : EventBuilder
    {
        this.type = EventType.PSYNERGY_TILE;
        this.params = psynergyId + ((phase ?? 0) << 20);
        this.objectId = tileId;
        this.handler = handler;
        return this;
    }

    asObjectPsynergyTrigger (objectId : number, psynergyId : number, handler : number, phase? : PsynergyPhase) : EventBuilder
    {
        this.type = EventType.PSYNERGY_OBJECT;
        this.params = psynergyId + ((phase ?? 0) << 20);
        this.objectId = objectId;
        this.handler = handler;
        return this;
    }

    asGlobalPsynergyTrigger (psynergyId : number, handler : number, phase? : PsynergyPhase) : EventBuilder
    {
        this.type = EventType.PSYNERGY_STATE;
        this.params = psynergyId + ((phase ?? 0) << 20);
        this.objectId = 0;
        this.handler = handler;
        return this;
    }

    asScriptTrigger (triggerId : number, handler : number) : EventBuilder
    {
        this.type = EventType.TRIGGERED;
        this.params = 0;
        this.objectId = triggerId;
        this.handler = handler;
        return this;
    }

    asPushStart (handler : number, tileId? : number) : EventBuilder
    {
        this.type = EventType.PUSH_START;
        this.params = 0;
        this.objectId = tileId ?? 0;
        this.handler = handler;
        return this;
    }

    asPushEnd (handler : number, tileId? : number) : EventBuilder
    {
        this.type = EventType.PUSH_END;
        this.params = 0;
        this.objectId = tileId ?? 0;
        this.handler = handler;
        return this;
    }

    build () : Uint8Array
    {
        const block = new BinaryView(new Uint8Array(12));
        if (this.type == EventType.INTERACT) {
            block.writeWord(0, this.type + (this.params << 4));
        } else {
            block.writeByte(0, this.type);
            block.write24bit(1, this.params);
        }
        block.writeHalfword(4, this.objectId);
        block.writeHalfword(6, this.flag);
        block.writeWord(8, this.handler);
        return block.getData();
    }
}