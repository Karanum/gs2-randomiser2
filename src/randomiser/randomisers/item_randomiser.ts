import type { PRNG } from "$lib/prng";
import { ItemLocationType } from "../data/item_locations/enums";
import type { ItemLocationManager } from "../data/item_locations/manager";
import type { Progression } from "../logic/enums";
import { FlatLogic } from "../logic/flat_logic";
import { Setting, SettingShipStart, SettingShuffleItems } from "../settings/enums";
import type { SettingsObject } from "../settings/settings";
import { BaseItemRandomiser, type Sphere } from "./base_randomiser";


const WEIGHT_MOD_TREASURE_ISLE = 0.25;
const WEIGHT_MOD_ANKOHL_RUINS = 0.75;


class ItemRandomiser extends BaseItemRandomiser
{
    private flatLogic : FlatLogic;
    private keyItems : number[];

    constructor(prng : PRNG, settings : SettingsObject, itemLocations : ItemLocationManager) 
    {
        super(prng, settings, itemLocations, new FlatLogic());
        this.flatLogic = this.logic as FlatLogic;
        this.keyItems = [];
    }

    /**
     * Runs the randomiser.
     */
    run() 
    {
        if (this.settings[Setting.SHUFFLE_ITEMS] == SettingShuffleItems.NONE) return;

        // Do pre-shuffle setup and get the list of early items
        const biasEarly : number[] = this.doPreShuffle();

        // Initialise the logic and get all of the initially accessible item locations
        this.logic.init(this.settings);
        this.updateAccessibleSlots();

        // Fill all key items, inserting early items whenever the number of available slots is running low
        while (this.keyItems.length > 0) {
            if (this.accessibleSlots.length <= biasEarly.length) {
                const item : number = this.prng.randomArrayElement(biasEarly, true);
                this.keyItems.splice(this.keyItems.indexOf(item), 1);
                this.weightedFill(item);
            } else {
                const item : number = this.prng.randomArrayElement(this.keyItems, true);
                if (biasEarly.includes(item)) biasEarly.splice(biasEarly.indexOf(item), 1);
                this.weightedFill(item);
            }
            this.updateAccessibleSlots();
        }

        // First pass over all remaining items, giving priority to items with placement restrictions
        this.availableItems.forEach(item => {
            const itemLoc = this.itemLocations.get(item)?.asVanilla();
            if (itemLoc == undefined) return;

            if (itemLoc.isSummon() || itemLoc.type == ItemLocationType.MIMIC || itemLoc.contents == 0 || itemLoc.isCoins()) {
                this.randomFill(item);
                this.updateAccessibleSlots();
            }
        });

        // Second pass over all remaining items, filling everything that remains
        this.availableItems.forEach(item => {
            this.randomFill(item);
            this.updateAccessibleSlots();
        });
    }

    /**
     * Returns the sphere map for the current randomiser state.
     * @param allItems Whether to include all items in the sphere map, or just key items
     * @param djinn Whether to include Djinn in the sphere map
     * @param progression Whether to include relevant progression events in the sphere map
     * @returns An array of `LogicMap`-like objects, with each array item representing a single progression sphere
     */
    getSpheres(allItems : boolean, djinn : boolean, progression : boolean) : Sphere[] {
        const spheres : Sphere[] = [];
        const seenItems : Set<number> = new Set();
        const seenDjinn : Set<number> = new Set();
        const seenProgression : Set<Progression> = new Set();

        this.flatLogic.init(this.settings);
        this.flatLogic.updateAccessibleNodes();

        while (true) {
            const sphere : Sphere = { items: [], djinn: [], progression: [] }
            const inventorySlots : number[] = [];
            const accessibleNodes = this.flatLogic.accessibleNodes;

            accessibleNodes.items.forEach(item => {
                if (!seenItems.has(item.flag)) {
                    const loc = this.itemLocations.get(item.flag);
                    if (loc == undefined) return;

                    if (allItems || loc.isKeyItem()) { sphere.items.push(item.flag); }
                    seenItems.add(item.flag);

                    this.addProgression(loc);
                    if (loc.isCharacter()) {
                        switch (loc.contents) {
                            case 0xD00:
                                inventorySlots.push(0x104);
                                break;
                            case 0xD01:
                                inventorySlots.push(0x103);
                                break;
                            case 0xD02:
                                inventorySlots.push(0x102);
                                break;
                            case 0xD03:
                                inventorySlots.push(0x101);
                                break;
                            case 0xD06:
                                inventorySlots.push(0x2, 0x3);
                                break;
                            case 0xD07:
                                inventorySlots.push(0x105, 0x106);
                                break;
                        }
                    }
                }
            });

            if (djinn) {
                accessibleNodes.djinn.forEach(djinni => {
                    if (!seenDjinn.has(djinni.flag)) {
                        sphere.djinn.push(djinni.flag);
                        seenDjinn.add(djinni.flag);
                    }
                });
            }

            if (progression) {
                accessibleNodes.progression.forEach(entry => {
                    if (!seenProgression.has(entry.key)) {
                        sphere.progression.push(entry.key);
                        seenProgression.add(entry.key);
                    }
                });
            }

            if (sphere.items.length == 0 && sphere.djinn.length == 0 && sphere.progression.length == 0) {
                break;
            }

            inventorySlots.forEach(slot => {
                if (!seenItems.has(slot)) {
                    const loc = this.itemLocations.get(slot);
                    if (loc == undefined) return;

                    if (allItems || loc.isKeyItem()) { sphere.items.push(slot); }
                    seenItems.add(slot);
                    this.addProgression(loc);
                }
            });

            spheres.push(sphere);
            this.flatLogic.updateAccessibleNodes();
        }

        return spheres;
    }

    /**
     * Prepare the randomiser for item shuffle. Populates the required instance variables
     * and performs fixed item fills based on settings.
     */
    private doPreShuffle() : number[]
    {
        const shuffleCharactersSetting = this.settings[Setting.SHUFFLE_CHARACTERS];
        const shuffleItemsSetting = this.settings[Setting.SHUFFLE_ITEMS];
        const shipSetting = this.settings[Setting.SHIP_START];
        const startRevealSetting = this.settings[Setting.START_WITH_REVEAL];

        // Compose an array of source locations whose items need to be assigned early to avoid locks
        const biasEarly : number[] = [];
        if (shuffleItemsSetting == SettingShuffleItems.KEY_ITEMS || shipSetting != SettingShipStart.UNLOCKED) {
            biasEarly.push(0x84A, 0x878, 0x105, 0x106, 0x88C, 0x9BA, 0x3);

            if (shuffleItemsSetting == SettingShuffleItems.KEY_ITEMS) {
                biasEarly.push(0x918, 0xF67);
                if (startRevealSetting) biasEarly.push(0x8D4);
                if (shuffleCharactersSetting) biasEarly.push(0xD05, 0xD06, 0xD07, 0xD00, 0xD01, 0xD02, 0xD03);
            }
            if (shipSetting == SettingShipStart.VANILLA) {
                biasEarly.push(0x8FF);
                if (shuffleCharactersSetting && !biasEarly.includes(0xD07)) {
                    biasEarly.push(0xD07);
                }
            }
        }

        // Get all unlocked item locations and initialise slot weights
        this.slotWeights = {};
        this.keyItems = [];
        this.availableItems = [];
        this.itemLocations.getUnlockedLocations().forEach(loc => {
            const flag = loc.id;
            let weight : number = 1.0;

            if (!this.settings[Setting.SPLIT_MAJOR_MINOR]) {
                if (flag >= 0xFCF && flag <= 0xFD8) { weight = WEIGHT_MOD_TREASURE_ISLE; } 
                else if (flag >= 0xFB0 && flag <= 0xFB5) { weight = WEIGHT_MOD_ANKOHL_RUINS; }
            } 

            this.slotWeights[flag] = weight;
            this.availableItems.push(loc.id);
            if (loc.isKeyItem() && !loc.isSummon()) {
                this.keyItems.push(loc.id);
            }
        });

        // If character shuffle is enabled, force a 2nd character at the start
        if (shuffleCharactersSetting) {
            const charId = this.prng.randomInt(7);
            const flag = 0xD00 + charId + (charId >= 4 ? 1 : 0);

            this.fixedFill(flag, 0xD05);
            if (biasEarly.includes(flag)) {
                biasEarly.splice(biasEarly.indexOf(flag), 1);
            }
        }

        // If starting with Reveal is enabled, add it to Felix's starting inventory
        if (startRevealSetting) {
            this.fixedFill(0x8D4, 0x1);
        }

        return biasEarly;
    }

    /**
     * Updates the slots that are accessible with the currently placed progression.
     */
    private updateAccessibleSlots() 
    {
        this.flatLogic.updateAccessibleNodes();
        this.accessibleSlots = [...this.flatLogic.accessibleNodes.items];
    }
}