import { CharacterDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { elementLevelBlocks, PlayableCharacter } from "./model";

/**
 * Data manager for playable characters. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class CharacterManager 
{
    private data : PlayableCharacter[];

    constructor ()
    {
        this.data = [];
    }

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
     * Returns a character from this data manager.
     * @param id The id of the character to fetch
     * @returns A `PlayableCharacter` object, or `undefined` if no character with this id exists
     */
    get (id : number) : PlayableCharacter|undefined 
    {
        return this.data[id];
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