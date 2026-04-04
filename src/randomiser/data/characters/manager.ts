import { CharacterDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import { clamp } from "$lib/util";
import type { Sphere } from "../../randomisers/item_randomiser";
import type { RomData } from "../../rom";
import { DataManager } from "../base";
import type { ItemLocationManager } from "../item_locations/manager";
import { PseudoItemGroup } from "../items/enums";
import { CharacterId } from "./enums";
import { elementLevelBlocks, PlayableCharacter } from "./model";

/**
 * Data manager for playable characters. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class CharacterManager extends DataManager<PlayableCharacter>
{
    /**
     * Returns a deep copy of this object.
     */
    clone() : CharacterManager 
    {
        const cloned = new CharacterManager();
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            cloned.data[i] = this.data[i].clone();
        }
        return cloned;
    }

    /**
     * Writes all characters in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        let psynergyAddr = CharacterDefinition.ADDRESS_WRITE_PSYNERGY;
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            rom.text.set(CharacterDefinition.TEXT_NAMES + i, this.data[i].name);

            // Write general character data
            rom.writeBlock(this.data[i].address, this.data[i].toBinary());

            // Write starting Psynergy data
            this.data[i].psynergy.forEach(psynergyId => {
                rom.writeHalfword(psynergyAddr, this.data[i].id);
                rom.writeHalfword(psynergyAddr + 2, psynergyId);
                psynergyAddr += 4;
            });
        }
        rom.writeWord(psynergyAddr, 0xFFFF);
    }

    /**
     * Shuffles stat growths between all characters.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleStatGrowths (prng : PRNG) : void
    {
        const stats : number[][][] = [[], [], [], [], [], []];
        this.data.forEach(character => {
            for (let i = 0; i < 6; ++i) {
                stats[i].push(character.statGrowths[i]);
            }
        });

        this.data.forEach(character => {
            for (let i = 0; i < 6; ++i) {
                character.statGrowths[i] = prng.randomArrayElement(stats[i], true);
            }
        });
    }

    /**
     * Shuffles character elements such that there are two characters for each element.
     * @param prng The PRNG instance for the currently generating seed
     */
    shuffleElements (prng : PRNG) : void
    {
        const elements = [...elementLevelBlocks, ...elementLevelBlocks];
        this.data.forEach(character => {
            character.eLevels = [...prng.randomArrayElement(elements, true)];
        });
    }

    /**
     * Randomises character elements, ensuring that each element appears at least once.
     * @param prng The PRNG instance for the currently generating seed
     */
    randomiseElements (prng : PRNG) : void
    {
        const characters = [0, 1, 2, 3, 4, 5, 6, 7];
        for (let i = 0; i < 4; ++i) {
            this.data[prng.randomArrayElement(characters, true)].eLevels = [...elementLevelBlocks[i]];
        }
        for (let i = 0; i < characters.length; ++i) {
            this.data[characters[i]].eLevels = prng.randomArrayElement(elementLevelBlocks);
        }
    }

    /**
     * Sets the minimum starting level for all characters. Has no effect on characters
     * with a higher starting level. (e.g. Piers starts at 18, so a `level` of 17 or lower
     * does not change his starting level, but does affect Felix and co.)
     * @param level Number from 5 to 99 (inclusive)
     */
    setStartingLevels (level : number) : void 
    {
        this.data.forEach(character => character.setStartingLevel(level));
    }

    /**
     * Dynamically sets the starting level for all characters based on their sphere depth.
     * @param minLevel The level for sphere 0, between 5 and 99
     * @param maxLevel The level for the highest sphere, between `minLevel` and 99
     * @param spheres The sphere map for the currently generating seed
     * @param itemLocations The item location manager for the currently generating seed
     */
    setStartingLevelsDynamic (minLevel : number, maxLevel : number, spheres : Sphere[], itemLocations : ItemLocationManager) : void 
    {
        minLevel = clamp(minLevel, 5, 99);
        maxLevel = clamp(maxLevel, minLevel, 99);
        if (minLevel == maxLevel) {
            this.data.forEach(character => character.setStartingLevel(minLevel, true));
            return;
        }

        this.data[CharacterId.FELIX].setStartingLevel(minLevel, true);

        spheres.forEach((sphere, depth) => {
            sphere.items.forEach(flag => {
                const loc = itemLocations.get(flag);
                if (loc?.isCharacter()) {
                    const charId = loc.contents - PseudoItemGroup.CHARACTER;
                    const level = minLevel + Math.round((maxLevel - minLevel) * depth / spheres.length);
                    this.data[charId]?.setStartingLevel(level, true);
                }
            });
        });
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `CharacterManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : CharacterManager
    {
        const instance = new CharacterManager();
        const blockSize = CharacterDefinition.BLOCK_SIZE;
        const address = CharacterDefinition.ADDRESS;

        for (let i = 0; i < 8; ++i) {
            const block = rom.readBlock(address + i * blockSize, blockSize);
            const character = PlayableCharacter.createFromBinary(i, block, rom.text);
            if (!character) continue;
            instance.data[i] = character;
        }

        let psynergyAddr = CharacterDefinition.ADDRESS_READ_PSYNERGY;
        while (true) {
            const block = rom.readBlock(psynergyAddr, 4);
            if (block.readByte(1) != 0x21 || block.readByte(2) > 0x7 || block.readByte(3) != 0x20) break;

            instance.data[block.readByte(2)].psynergy.push(block.readByte(0));
            psynergyAddr += 8;
        }

        return instance;
    }
}