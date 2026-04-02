import { ShopDefinition } from "$lib/definitions";
import { BinaryView } from "../../binary_view";
import { DataModel } from "../base";
import type { ShopType } from "./enums";

/**
 * Data class representing a single shop.
 */
export class Shop extends DataModel 
{
    public type : ShopType;
    public items : number[];
    public artifacts : number[];

    constructor(id : number, type : ShopType, items : number[], artifacts : number[])
    {
        super(id, ShopDefinition.ADDRESS + id * ShopDefinition.BLOCK_SIZE);
        this.type = type;
        this.items = [...items];
        this.artifacts = [...artifacts];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : Shop 
    {
        return new Shop(this.id, this.type, this.items, this.artifacts);
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary() : Uint8Array 
    {
        const data = new BinaryView();
        data.expand(ShopDefinition.BLOCK_SIZE);

        for (let i = 0; i < 24; ++i) {
            data.writeHalfword(i * 2, this.items[i] ?? 0);
        }
        for (let i = 0; i < 8; ++i) {
            data.writeHalfword(48 + i * 2, this.artifacts[i] ?? 0);
        }

        data.writeByte(64, this.type);
        return data.getData();
    }

    /**
     * Creates a new `Shop` instance from a binary data block.
     * @param id The zero-indexed id of the shop within the game data
     * @param data The binary data block to read from; must be 66 bytes
     * @returns The newly created `Shop`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView) : Shop|undefined
    {
        if (data.length < ShopDefinition.BLOCK_SIZE) return;

        const items : number[] = [];
        const artifacts : number[] = [];

        for (let i = 0; i < 24; ++i) {
            items.push(data.readHalfword(i * 2));
        }
        for (let i = 0; i < 8; ++i) {
            artifacts.push(data.readHalfword(48 + i * 2));
        }

        return new Shop(id, data.readByte(64), items, artifacts);
    }
}