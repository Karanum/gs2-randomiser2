import { MapDataDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import { WorldMapDisplay } from "./enums";
import { MapData, WorldMapLocation } from "./model";

export class MapDataManager extends DataManager<MapData>
{
    protected worldMapData : WorldMapLocation[] = [];

    /**
     * Returns a world map location from this data manager.
     * @param id The id of the object to fetch
     * @returns The requested object, or `undefined` if this id does not exist
     */
    getWorldMapLocation (id : number) : WorldMapLocation|undefined
    {
        return this.worldMapData[id];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : MapDataManager 
    {
        const cloned = new MapDataManager();
        cloned.data = this.data.map(entry => entry.clone());
        cloned.worldMapData = this.worldMapData.map(entry => entry.clone());
        return cloned;
    }

    /**
     * Updates map data to support using Teleport to every map destination.
     */
    applyTeleportEverywhereChanges () : void
    {
        // Add map markers for all locations to the Teleport map view
        [1, 3, 11, 12, 15, 17, 20, 21, 22, 23, 24, 26, 28, 30, 32, 
            37, 38, 39, 40, 41, 42, 44, 45, 51, 52, 55, 56, 57, 58, 59].forEach(id => {
                this.worldMapData[id].teleportMapDisplay = WorldMapDisplay.YELLOW;
        });

        // Add missing map markers in general for some locations that are missing one
        [45, 51, 52, 56, 57].forEach(id => {
            this.worldMapData[id].worldMapDisplay = WorldMapDisplay.YELLOW;
        });

        // Fix Shaman Village Cave entries using outdated map IDs
        this.worldMapData[45].mapId = 0xF0;
        this.worldMapData[46].mapId = 0xF0;
        this.worldMapData[46].visitFlag = 0x38;
    }

    /**
     * Writes all data in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) : void
    {
        this.data.forEach(entry => { 
            rom.writeBlock(entry.address, entry.toBinary()); 
        });
        this.worldMapData.forEach(entry => { 
            rom.writeBlock(entry.address, entry.toBinary()); 
        });
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `MapDataManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : MapDataManager
    {
        const instance = new MapDataManager();

        // Load map data
        for (let i = 0; i < MapDataDefinition.COUNT; ++i) {
            const data = rom.readBlock(MapDataDefinition.ADDRESS + MapDataDefinition.BLOCK_SIZE * i, MapDataDefinition.BLOCK_SIZE);
            const mapData = MapData.createFromBinary(i, data);
            instance.data.push(mapData!);
        }

        // Load world map location data
        for (let i = 0; true; ++i) {
            const data = rom.readBlock(
                MapDataDefinition.ADDRESS_WORLD_MAP + MapDataDefinition.BLOCK_SIZE_WORLD_MAP * i, 
                MapDataDefinition.BLOCK_SIZE_WORLD_MAP
            );
            if (data.readWord(0) == 0) { break; }

            const worldMapLoc = WorldMapLocation.createFromBinary(i, data);
            instance.worldMapData.push(worldMapLoc!);
        }

        // Allow alternate/"back" entrances to set their Teleport flags
        instance.worldMapData[4].visitFlag = 0x6;   // Dehkan Plateau
        instance.worldMapData[4].mapId = 36;
        instance.worldMapData[12].mapId = 75;       // Yampi Desert
        instance.worldMapData[68].visitFlag = 0x13;
        instance.worldMapData[68].mapId = 74;

        // Change Taopo Swamp exterior area ID to match the interior
        instance.data[43].area = 0x2A;
        instance.data[44].area = 0x2A;

        return instance;
    }
}