import { ShopDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import type { ItemManager } from "../items/manager";
import { Shop } from "./model";

/**
 * Data manager for shops. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class ShopManager extends DataManager<Shop> 
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : ShopManager
    {
        const cloned = new ShopManager();
        this.data.forEach(shop => cloned.data.push(shop.clone()));
        return cloned;
    }

    /**
     * Returns a list of all artifact item IDs in all shops.
     */
    getAllArtifacts() : number[]
    {
        const artifacts = this.data.map(shop => shop.artifacts.filter(item => item != 0));
        return artifacts.flat();
    }

    /**
     * Shuffles all equipment artifacts with random equipment.
     * Modifies the array passed as `pool` by removing the items that were picked.
     * @param prng The PRNG instance for the currently generating seed
     * @param itemManager The ItemManager instance for the currently generating seed
     * @param pool A list of equipment item IDs to pick from
     */
    shuffleEquipmentArtifacts(prng : PRNG, itemManager : ItemManager, pool : number[])
    {
        this.data.forEach(shop => {
            for (let i = 0; i < shop.artifacts.length; ++i) {
                const id = shop.artifacts[i];
                if (id == 0) continue;

                const itemData = itemManager.get(id);
                if (itemData?.isEquipment()) {
                    shop.artifacts[i] = prng.randomArrayElement(pool, true);
                }
            }
        });
    }

    /**
     * Writes all shops in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom(rom: RomData) 
    {       
        this.data.forEach(shop => {
            rom.writeBlock(shop.address, shop.toBinary());
        });
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `ShopManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : ShopManager
    {
        const instance = new ShopManager();
        const blockSize = ShopDefinition.BLOCK_SIZE;
        const address = ShopDefinition.ADDRESS;

        for (let i = 0; i < ShopDefinition.COUNT; ++i) {
            const block = rom.readBlock(address + blockSize * i, blockSize);
            const shop = Shop.createFromBinary(i, block);
            if (shop) instance.data[i] = shop;
        }

        return instance;
    }
}