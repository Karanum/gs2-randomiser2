import { AbilityDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { AbilityCalculation, UtilityEffect } from "./enums";
import { Ability } from "./model";

/**
 * Data manager for abilities such as Psynergy, Djinn/summon actions, battle actions, et cetera.
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class AbilityManager 
{
    private data : Ability[];

    constructor () 
    {
        this.data = [];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : AbilityManager 
    {
        const cloned = new AbilityManager();
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            cloned.data[i] = this.data[i].clone();
        }
        return cloned;
    }

    /**
     * Returns an ability from this data manager.
     * @param id The id of the ability to fetch
     * @returns An `Ability` object, or `undefined` if no ability with this id exists
     */
    get (id : number) : Ability|undefined 
    {
        return this.data[id];
    }

    //TODO: Add new feature -- Utility Psynergy randomisation
    //TODO: In addition to the above, consider how this will be communicated to the logic
    shuffleUtilityEffects () : void
    {
        const utilityAbilities = this.data.filter(ability => ability.utility != UtilityEffect.NONE);
    }

    /**
     * Writes all abilities in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        for (let i = 0; i < this.data.length; ++i) {
            if (this.data[i] == undefined) continue;
            rom.text.set(AbilityDefinition.TEXT_NAMES + i, this.data[i].name);
            rom.text.set(AbilityDefinition.TEXT_DESCRIPTIONS + i, this.data[i].description);
            rom.writeBlock(this.data[i].address, this.data[i].toBinary());
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `AbilityManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : AbilityManager
    {
        const instance = new AbilityManager();
        const blockSize = AbilityDefinition.BLOCK_SIZE;
        const address = AbilityDefinition.ADDRESS;
        let i = 0;

        while (true) {
            const block = rom.readBlock(address + i * blockSize, blockSize);
            if (block.readByte(0) == 0x20) break;

            const ability = Ability.createFromBinary(i++, block, rom.text);
            if (!ability || ability.calcType == AbilityCalculation.NONE) continue;
            instance.data[ability.id] = ability;
        }

        // Fix the double "Blast" Psynergy by renaming the one from the Nova line to its Dark Dawn name
        instance.data[57].name = "Starburst";

        return instance;
    }
}