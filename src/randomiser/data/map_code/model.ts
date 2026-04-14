import type { BinaryView } from "../../binary_view";
import { DataModel } from "../base";

export class MapCode extends DataModel
{
    public data : BinaryView;
    public hasChanged : boolean;

    constructor (id : number, data : BinaryView, hasChanged : boolean)
    {
        super(id, 0);
        this.data = data;
        this.hasChanged = hasChanged;
    }

    clone () : MapCode 
    {
        return new MapCode(this.id, this.data, this.hasChanged);
    }

    toBinary () : Uint8Array 
    {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }

    static createFromBinary(id : number, data : BinaryView) : MapCode|undefined
    {
        //TODO: Implement
        throw new Error("Method not implemented.");
    }
}