import { clamp } from "$lib/util";
import { Setting, SettingAnemosAccess, SettingShipStart, SettingShuffleItems } from "../settings/enums";
import type { SettingsObject } from "../settings/settings";
import { Progression } from "./enums";

/**
 * Represents a base logic runner used in the normal item randomiser.
 * This object is stateful and should be reset or recreated for each run.
 */
export abstract class BaseLogic 
{
    protected progression : Set<Progression>;
    protected characterNum : number;
    protected djinnNum : number;
    protected ignoreBossLogic : boolean;

    constructor()
    {
        this.progression = new Set();
        this.characterNum = 1;
        this.djinnNum = 1;
        this.ignoreBossLogic = false;
    }

    /**
     * Initialises the progression state with the provided randomisation settings.
     */
    init(settings : SettingsObject) 
    {
        this.reset();

        if (settings[Setting.SHIP_START] == SettingShipStart.UNLOCKED) { this.addProgression(Progression.SHIP); }
        if (settings[Setting.SHIP_START] == SettingShipStart.DOOR_OPEN) { this.addProgression(Progression.SHIP_OPEN); }
        if (settings[Setting.SHIP_WINGS_START]) { this.addProgression(Progression.SHIP_WINGS); }
        
        if (settings[Setting.ANEMOS_ACCESS] == SettingAnemosAccess.OPEN) { this.addProgression(Progression.ANEMOS_OPEN); }
        if (settings[Setting.NO_BOSS_LOGIC]) { this.addProgression(Progression.NO_BOSS_LOGIC); }
        if (settings[Setting.SHUFFLE_ITEMS] != SettingShuffleItems.ALL) { this.addProgression(Progression.NO_HIDDEN_SHUFFLE); }
        if (settings[Setting.SHORTCUT_MAGMA_ROCK]) { this.addProgression(Progression.MAGMA_ROCK_INTERIOR); }
        if (settings[Setting.SHORTCUT_MARS_LIGHTHOUSE]) { this.addProgression(Progression.SHORTCUT_MARS_LIGHTHOUSE); }
        if (!settings[Setting.SHUFFLE_CHARACTERS]) { this.addProgression(Progression.VANILLA_CHARACTERS); }

        if (settings[Setting.SKIPS_DEATH_STORAGE]) { this.addProgression(Progression.SKIPS_DEATH_STORAGE); }
        if (settings[Setting.SKIPS_MAZE]) { this.addProgression(Progression.SKIPS_MAZE); }
        if (settings[Setting.SKIPS_MISSABLE]) { this.addProgression(Progression.SKIPS_MISSABLE); }
        if (settings[Setting.SKIPS_RETREAT]) { this.addProgression(Progression.SKIPS_RETREAT); }
        if (settings[Setting.SKIPS_RETREAT_OOB]) { this.addProgression(Progression.SKIPS_RETREAT_OOB); }
        if (settings[Setting.SKIPS_RETREAT_SAVEQUIT]) { this.addProgression(Progression.SKIPS_RETREAT_SAVEQUIT); }
        if (settings[Setting.SKIPS_SANCWARP]) { this.addProgression(Progression.SKIPS_SANCWARP); }
        if (settings[Setting.SKIPS_SAND]) { this.addProgression(Progression.SKIPS_SAND); }
        if (settings[Setting.SKIPS_WIGGLECLIP]) { 
            this.addProgression(Progression.SKIPS_SHIPCLIP); 
            this.addProgression(Progression.SKIPS_WIGGLECLIP); 
        }
    }

    /**
     * Resets the current progression state.
     */
    reset() 
    {
        this.progression.clear();
        this.characterNum = 1;
        this.djinnNum = 0;
        this.ignoreBossLogic = false;
    }

    /**
     * Adds a progression key to the current state.
     * @param id The progression key to add
     */
    addProgression(id : Progression) 
    {
        this.progression.add(id);
        if (id == Progression.NO_BOSS_LOGIC) {
            this.ignoreBossLogic = true;
        }
    }

    /**
     * Removes a progression key from the current state.
     * @param id The progression key to remove
     */
    removeProgression(id : Progression) 
    {
        this.progression.delete(id);
        if (id == Progression.NO_BOSS_LOGIC) {
            this.ignoreBossLogic = false;
        }
    }

    /**
     * Sets the number of Djinn in the current progression state.
     * @param amount Number of Djinn between 0 and 72 (inclusive)
     */
    setDjinn(amount : number) 
    {
        this.djinnNum = clamp(amount, 0, 72);
    }

    /**
     * Sets the number of characters in the current progression state.
     * @param amount Number of characters between 1 and 8 (inclusive)
     */
    setCharacters(amount : number) 
    {
        this.characterNum = clamp(amount, 1, 8);
    }

    /**
     * Adds 1 Djinni to the current progression state.
     */
    addDjinni() 
    {
        if (this.djinnNum < 72) {
            ++this.djinnNum;
        }
    }

    /**
     * Adds 1 character to the current progression state.
     */
    addCharacter() 
    {
        if (this.characterNum < 8) {
            ++this.characterNum;
        }
    }
}