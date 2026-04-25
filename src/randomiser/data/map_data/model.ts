import { MapDataDefinition } from "$lib/definitions";
import { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import type { MapCodeEntry } from "../map_code/enums";
import { WorldMapDisplay } from "./enums";

/**
 * Represents a single entry in the map data table.
 */
export class MapData extends DataModel
{
    public dataId : number;
    public area : number; 
    public outdoors : boolean;
    public canRetreat : boolean;
    public mapCode : MapCodeEntry;

    constructor (id : number, dataId : number, area : number, outdoors : boolean, canRetreat : boolean, mapCode : MapCodeEntry)
    {
        super(id, MapDataDefinition.ADDRESS + id * MapDataDefinition.BLOCK_SIZE);
        this.dataId = dataId;
        this.area = area;
        this.outdoors = outdoors;
        this.canRetreat = canRetreat;
        this.mapCode = mapCode;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : MapData 
    {
        return new MapData(this.id, this.dataId, this.area, this.outdoors, this.canRetreat, this.mapCode);
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        const data = new BinaryView(new Uint8Array(MapDataDefinition.BLOCK_SIZE));

        data.writeHalfword(0, this.mapCode);
        data.writeByte(2, this.area);
        data.writeByte(3, this.canRetreat ? 0x1 : 0x2);
        data.writeHalfword(4, this.dataId);
        data.writeHalfword(6, this.outdoors ? 0x1 : 0x0);

        return data.getData();
    }
    
    /**
     * Creates a new `MapData` instance from a binary data block.
     * @param id The zero-indexed id of the map data entry within the game data
     * @param data The binary data block to read from; must be 8 bytes
     * @returns The newly created `MapData`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView) : MapData|undefined
    {
        if (data.length < MapDataDefinition.BLOCK_SIZE) return;

        if (data.readByte(3) < 1 || data.readByte(3) > 2) {
            console.log(`Found untracked map type (${data.readByte(3)}) for map #${id}`);
        }

        const outdoors = (data.readByte(6) == 1);
        const canRetreat = (data.readByte(3) == 1);

        return new MapData(id, data.readHalfword(4), data.readByte(2), canRetreat, outdoors, data.readHalfword(0));
    }
}


/**
 * Represents a single entry in the world map location table.
 */
export class WorldMapLocation extends DataModel
{
    public visitFlag : number;
    public worldMapDisplay : WorldMapDisplay;
    public teleportMapDisplay : WorldMapDisplay;
    public sprite : number;
    public x : number;
    public y : number;
    public displayMode : number;
    public flag : number;
    public mapId : number;
    public sanctumMapId : number;
    public doorId : number;

    constructor (id : number, visitFlag : number, worldMapDisplay : WorldMapDisplay, teleportMapDisplay : WorldMapDisplay, sprite : number,
        x : number, y : number, displayMode : number, flag : number, mapId : number, sanctumMapId : number, doorId : number)
    {
        super(id, MapDataDefinition.ADDRESS_WORLD_MAP + id * MapDataDefinition.BLOCK_SIZE_WORLD_MAP);
        this.visitFlag = visitFlag;
        this.worldMapDisplay = worldMapDisplay;
        this.teleportMapDisplay = teleportMapDisplay;
        this.sprite = sprite;
        this.x = x;
        this.y = y;
        this.displayMode = displayMode;
        this.flag = flag;
        this.mapId = mapId;
        this.sanctumMapId = sanctumMapId;
        this.doorId = doorId;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : WorldMapLocation 
    {
        return new WorldMapLocation(this.id, this.visitFlag, this.worldMapDisplay, this.teleportMapDisplay, this.sprite,
            this.x, this.y, this.displayMode, this.flag, this.mapId, this.sanctumMapId, this.doorId);
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        const data = new BinaryView(new Uint8Array(MapDataDefinition.BLOCK_SIZE_WORLD_MAP));
        const hasMapId = ((this.mapId & 0xFFFF) != 0xFFFF);

        data.writeByte(0, this.visitFlag);
        data.writeByte(1, this.worldMapDisplay | (this.teleportMapDisplay << 4));
        data.writeHalfword(2, this.sprite);
        data.writeHalfword(4, this.x);
        data.writeHalfword(6, this.y);
        data.writeHalfword(8, this.displayMode);
        data.writeHalfword(10, this.flag);
        data.writeHalfword(12, this.mapId);
        data.writeHalfword(14, hasMapId ? 0xFFFF : 0xFFFE);
        data.writeHalfword(16, this.sanctumMapId);
        data.writeHalfword(18, this.doorId);

        return data.getData();
    }
    
    /**
     * Creates a new `WorldMapLocation` instance from a binary data block.
     * @param id The zero-indexed id of the location entry within the game data
     * @param data The binary data block to read from; must be 20 bytes
     * @returns The newly created `WorldMapLocation`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView) : WorldMapLocation|undefined
    {
        if (data.length < MapDataDefinition.BLOCK_SIZE_WORLD_MAP) return;

        const mapDisplay : number = data.readByte(1);
        const worldMapDisplay : WorldMapDisplay = (mapDisplay & 0xF);
        const teleportMapDisplay : WorldMapDisplay = (mapDisplay >> 4);

        return new WorldMapLocation(id, data.readByte(0), worldMapDisplay, teleportMapDisplay, data.readHalfword(2),
            data.readHalfword(4), data.readHalfword(6), data.readHalfword(8), data.readHalfword(10),
            data.readHalfword(12), data.readHalfword(16), data.readHalfword(18));
    }
}