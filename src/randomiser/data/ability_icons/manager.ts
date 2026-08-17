import { AbilityIconDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { getAssemblyExport } from "../../script_util";
import { GenericManager } from "../base";
import { PseudoItem } from "../items/enums";
import { ArchipelagoIcon_FillerItem, ArchipelagoIcon_KeyItem, ArchipelagoIcon_UsefulItem, CharacterIcon_Felix, CharacterIcon_Garet, CharacterIcon_Isaac, CharacterIcon_Ivan, CharacterIcon_Jenna, CharacterIcon_Mia, CharacterIcon_Piers, CharacterIcon_Sheba } from "./icons";

/**
 * Data manager for ability icons.
 * Does not contain any vanilla ROM data, so no `loadFromRom` call is required.
 */
export class AbilityIconManager extends GenericManager<Uint8Array> {

    private mappings : Record<number, number>;

    constructor ()
    {
        super();
        this.mappings = {};
    }

    /**
     * Returns a deep copy of this object.
     */
    clone (): AbilityIconManager 
    {
        const cloned = new AbilityIconManager();
        cloned.mappings = { ...this.mappings };
        cloned.data = [...this.data];
        return cloned;
    }

    /**
     * Inserts a new icon at the end of the icon list
     * @param icon The compressed icon data
     */
    insert (icon : Uint8Array)
    {
        this.data.push(icon);
    }

    /**
     * Inserts a new icon at the end of the icon list and sets a corresponding pseudo-item mapping.
     * @param icon The compressed icon data
     * @param itemId The item ID to link this icon with
     */
    insertWithItemMapping (icon : Uint8Array, itemId : number)
    {
        this.insert(icon);
        this.setItemMapping(itemId, this.data.length + AbilityIconDefinition.COUNT - 1);
    }

    /**
     * Sets a pseudo-item mapping to an icon.
     */
    setItemMapping (itemId : number, iconId : number)
    {
        this.mappings[itemId] = iconId;
    }

    /**
     * Registers all custom character icons.
     */
    registerCharacterIcons ()
    {
        this.insertWithItemMapping(CharacterIcon_Isaac, PseudoItem.PC_ISAAC);
        this.insertWithItemMapping(CharacterIcon_Garet, PseudoItem.PC_GARET);
        this.insertWithItemMapping(CharacterIcon_Ivan, PseudoItem.PC_IVAN);
        this.insertWithItemMapping(CharacterIcon_Mia, PseudoItem.PC_MIA);
        this.insertWithItemMapping(CharacterIcon_Felix, PseudoItem.PC_FELIX);
        this.insertWithItemMapping(CharacterIcon_Jenna, PseudoItem.PC_JENNA);
        this.insertWithItemMapping(CharacterIcon_Sheba, PseudoItem.PC_SHEBA);
        this.insertWithItemMapping(CharacterIcon_Piers, PseudoItem.PC_PIERS);
    }

    /**
     * Registers all custom Archipelago icons.
     */
    registerArchipelagoIcons ()
    {
        this.insertWithItemMapping(ArchipelagoIcon_UsefulItem, PseudoItem.AP_USEFUL_ITEM);
        this.insertWithItemMapping(ArchipelagoIcon_KeyItem, PseudoItem.AP_KEY_ITEM);
        this.insertWithItemMapping(ArchipelagoIcon_FillerItem, PseudoItem.AP_FILLER_ITEM);
    }

    /**
     * Writes all icons in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom: RomData): void 
    {
        let addrReadPointers = rom.readWord(AbilityIconDefinition.ADDRESS + 4) - 0x08000000;
        let addrWritePointers = AbilityIconDefinition.ADDRESS_WRITE;
        let addrWriteData = addrWritePointers + AbilityIconDefinition.COUNT + (this.data.length * 4) + 4;

        // Set the pointers to the new icon pointer table
        rom.writeWord(AbilityIconDefinition.ADDRESS, 0x08000000 + addrWriteData - 4);
        rom.writeWord(AbilityIconDefinition.ADDRESS + 4, 0x08000000 + addrWritePointers);
        rom.writeWord(AbilityIconDefinition.ADDRESS + 0x598, 0x08000000 + addrWritePointers);

        // Copy the existing icon data to a location with more space
        let word = rom.readWord(addrReadPointers);
        while (word != 0xFFFFFFFF) {
            rom.writeWord(addrWritePointers, word);
            addrReadPointers += 4;
            addrWritePointers += 4;
            word = rom.readWord(addrReadPointers);
        }
        rom.writeWord(addrWritePointers, 0xFFFFFFFF);

        // Write all custom icons to the new location
        this.data.forEach(icon => {
            rom.writeWord(addrWritePointers, addrWriteData);
            rom.writeBlock(addrWriteData, icon);
            addrWritePointers += 4;
            addrWriteData += icon.length;
        });

        // Write the established pseudo-item mappings
        let addr = getAssemblyExport("legacy_randomiser_logic", "data_iconMapping_dynamic");
        Object.entries(this.mappings).forEach(([itemId, iconId]) => {
            rom.writeHalfword(addr, Number(itemId));
            rom.writeHalfword(addr + 2, iconId);
            addr += 4;
        });
    }
}