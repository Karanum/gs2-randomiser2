import type { SettingsObject } from "../settings/settings";
import { BaseLogic } from "./base_logic";
import { Progression } from "./enums";
import { getAllNodes } from "./locations/map/_";
import type { LogicDjinni, LogicItem, LogicMap, LogicProgression } from "./locations/types";

/**
 * Represents an instance of the flat logic map used in the normal item randomiser.
 * This object is stateful and should be reset or recreated for each run.
 */
export class FlatLogic extends BaseLogic
{
    private nodes : LogicMap;
    public accessibleNodes : LogicMap;

    constructor() {
        super();
        this.nodes = getAllNodes();
        this.accessibleNodes = { items: [], djinn: [], progression: [] };
    }

    /**
     * Resets and initialises the progression state with the provided randomisation settings.
     * Includes a call to `updateAccessibleNodes()`.
     */
    init(settings : SettingsObject) {
        super.init(settings);
        this.updateAccessibleNodes();
    }

    /**
     * Updates the public `accessibleNodes` field using the current progression state.
     * Should be run after every set of progression changes.
     */
    updateAccessibleNodes() {
        while (true) {
            const oldDjinnNum = this.accessibleNodes.djinn.length;
            const oldProgressionSize = this.progression.size;

            this.accessibleNodes.djinn = this.nodes.djinn.filter(this.isNodeAccessible);
            this.setDjinn(this.accessibleNodes.djinn.length);

            this.accessibleNodes.progression = this.nodes.progression.filter(this.isNodeAccessible);
            this.accessibleNodes.progression.forEach(node => this.addProgression(node.key));

            if (oldDjinnNum == this.accessibleNodes.djinn.length && oldProgressionSize == this.progression.size) {
                break;
            }
        }
        this.accessibleNodes.items = this.nodes.items.filter(this.isNodeAccessible);
    }

    /**
     * Resets the current progression state.
     */
    reset() {
        super.reset();
        this.accessibleNodes = { items: [], djinn: [], progression: [] };
    }

    /**
     * Returns whether the node is accessible with the current progression state.
     */
    private isNodeAccessible(node : (LogicItem|LogicDjinni|LogicProgression)) : boolean {
        if (node.access == undefined) return true;

        const isBoss = ('key' in node && (node.key & 0xF00) == 0x200);
        const validPath = node.access.find(path => {
            return path.every(flag => {
                if ((flag & 0xF80) == Progression.NUM_PC_START) {
                    if (isBoss && this.ignoreBossLogic) return true;
                    const num = flag + 1 - Progression.NUM_PC_START;
                    return this.characterNum >= num;
                }
                if ((flag & 0xF80) == Progression.NUM_DJINN_START) {
                    if (isBoss && this.ignoreBossLogic) return true;
                    const num = flag - Progression.NUM_DJINN_START;
                    return this.djinnNum >= num;
                }
                return this.progression.has(flag);
            });
        });

        return validPath !== undefined;
    }
}