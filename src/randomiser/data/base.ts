import type { RomData } from "../rom";

/**
 * Base class for models created from game data.
 * Should also implement a static `createFromBinary` function.
 */
export abstract class DataModel 
{
    readonly id : number;
    readonly address : number;

    constructor (id : number, address : number)
    {
        this.id = id;
        this.address = address;
    }

    abstract clone() : DataModel;
    abstract toBinary() : Uint8Array;
}

/**
 * Base class for generic data managers that can contain any type of object.
 * Should also implement a static `loadFromRom` function.
 */
export abstract class GenericManager<T>
{
    protected data : T[];

    constructor ()
    {
        this.data = [];
    }

    abstract clone() : GenericManager<T>;
    abstract writeToRom(rom : RomData) : void;
}

/**
 * Base class for data managers that contain objects derived from `DataModel`.
 * Should also implement a static `loadFromRom` function.
 */
export abstract class DataManager<T extends DataModel> extends GenericManager<T> 
{
    /**
     * Returns an object from this data manager.
     * @param id The id of the object to fetch
     * @returns The requested object, or `undefined` if this id does not exist
     */
    get(id : number) : T|undefined
    {
        return this.data[id];
    }

    /**
     * Returns the amount of objects stored in this data manager.
     */
    get length() : number
    {
        return this.data.length;
    }
}