import { compressBranchLinks, compressFormat1 } from "$lib/compression";
import { BinaryView } from "../../binary_view";
import { DataModel } from "../base";

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
}