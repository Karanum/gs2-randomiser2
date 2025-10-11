import { ClassDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { RomData } from "../../rom";
import { psynergyLines } from "../abilities/psynergyLines";
import { Element } from "../enums";
import { CharacterClass, ClassLine } from "./model";


/** The amount by which the randomisation weight of Psynergy lines 
 * is multiplied whenever it is picked. */
const psynergyWeightFallout : number = 0.33;

/** A list of Psynergy that is to be removed by `removeUtilityPsynergy` */
const utilityPsynergy : number[] = [ 12, 24, 33, 78, 185 ];


/**
 * Data manager for character classes. 
 * Use the static `loadFromRom` method to populate it with game data.
 */
export class ClassManager
{
    private data : ClassLine[];

    constructor ()
    {
        this.data = [];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone() : ClassManager 
    {
        const cloned = new ClassManager();
        cloned.data = this.data.map(cl => cl.clone());
        return cloned;
    }

    /**
     * Returns a class from this data manager.
     * @param id The id of the class to fetch
     * @returns A `CharacterClass` object, or `undefined` if no class with this id exists
     */
    get (id : number) : CharacterClass|undefined 
    {
        const classLine = Math.floor(id / 10);
        return this.data[classLine]?.classes.find(c => c.id == id);
    }

    /**
     * Fully randomise Psynergy learned by classes without constraint, aside from internal consistency 
     * within class lines (e.g. if Squire learns Quake, so will Knight, Gallant, etc.)
     * @param prng The PRNG instance for the currently generating seed
     */
    randomisePsynergy (prng : PRNG)
    {
        // Collect all Psynergy and prepare weights
        const psynergyData : [number, number][] = [];
        const weights : number[] = [];
        psynergyLines.forEach(line => {
            line.psynergy.forEach(psynergy => {
                psynergyData.push([...psynergy]);
                weights.push(1);
            });
        });
        let totalWeight = psynergyData.length;

        // For each class line, keep a record of Psynergy mappings to maintain internal consistency
        this.data.forEach(classLine => {
            const psynergyMap : Record<number, [number, number]> = {};
            const selectedPsynergy : number[] = [];

            classLine.classes.forEach(classObj => {
                for (let i = 0; i < 16; ++i) {
                    const entry = classObj.psynergy[i];
                    if (entry[0] == 0) continue;

                    // If the base Psynergy exists in the mapping, use that
                    const mappedEntry = psynergyMap[entry[0]];
                    if (mappedEntry) {
                        classObj.psynergy[i] = [...mappedEntry];
                        continue;
                    }

                    // Otherwise, pick a weighted-random Psynergy to replace it with
                    let targetIndex, targetPsynergy;
                    do {
                        targetIndex = prng.randomWeighted(weights, totalWeight);
                        targetPsynergy = psynergyData[targetIndex];
                    } while (selectedPsynergy.includes(targetPsynergy[0]));

                    psynergyMap[entry[0]] = [...targetPsynergy];
                    selectedPsynergy.push(targetPsynergy[0]);
                    classObj.psynergy[i] = [...targetPsynergy];

                    // Update weights to make the picked Psynergy less likely to be repeated
                    const previousWeight = weights[targetIndex];
                    weights[targetIndex] = previousWeight * psynergyWeightFallout;
                    totalWeight -= (previousWeight - weights[targetIndex]);
                }
            });
        });
    }

    /**
     * Randomise Psynergy learned by classes, keeping Psynergy that belong to the same line together.
     * (e.g. If a class learns Cure, then that same class line will also learn Cure Well and Potent Cure)
     * @param prng The PRNG instance for the currently generating seed
     * @param preferSameElement Whether to give more weight to Psynergy lines of elements that match the class line
     */
    randomisePsynergyByLine (prng : PRNG, preferSameElement : boolean)
    {
        // Prepare weights
        const weights : number[] = [];
        psynergyLines.forEach(line => weights.push(1));

        // For each class line, keep a record of selected Psynergy lines to avoid duplicates
        this.data.forEach(classLine => {
            const selectedLines : number[] = [];
            const adjustedWeights : number[] = [...weights];
            const finalClass : CharacterClass = classLine.classes[classLine.classes.length - 1];

            // Optionally modify Psynergy line weights based on the elemental scores of the class line
            if (preferSameElement) {
                for (let i = 0; i < psynergyLines.length; ++i) {
                    adjustedWeights[i] *= (psynergyLines[i].element == Element.PHYSICAL)
                        ? finalClass.getAverageElementScore()
                        : Math.max(1, finalClass.elements[psynergyLines[i].element]);
                }
            }

            // Clear all Psynergy in the class line, then start filling with random Psynergy lines
            classLine.clearPsynergyData();

            while (true) {
                let targetIndex;
                do {
                    targetIndex = prng.randomWeighted(adjustedWeights);
                } while (selectedLines.includes(targetIndex));

                const targetPsynergyLine = psynergyLines[targetIndex];
                if (classLine.freePsynergySlots < targetPsynergyLine.psynergy.length) break;

                classLine.insertPsynergyLine(prng, targetPsynergyLine);
                selectedLines.push(targetIndex);
                
                weights[targetIndex] *= psynergyWeightFallout;
                adjustedWeights[targetIndex] *= psynergyWeightFallout;
            }
        });
    }

    randomisePsynergyByElement ()
    {
        // Prepare weights
        const weights : number[] = [];
        psynergyLines.forEach(line => weights.push(1));

        //TODO: Implement
    }

    shufflePsynergyByClass ()
    {
        //TODO: Implement
    }

    varyPsynergyLevels ()
    {
        //TODO: Implement
    }

    randomisePsynergyLevels ()
    {
        //TODO: Implement
    }

    randomiseStatModifiers ()
    {
        //TODO: Implement
    }
    
    /**
     * Removes all utility Psynergy that can normally be learned by classes, e.g. Whirlwind.
     */
    removeUtilityPsynergy ()
    {
        this.data.forEach(classLine => {
            utilityPsynergy.forEach(classLine.deletePsynergy);
        });
    }

    /**
     * Writes all classes in this data manager to the internal buffer of the specified ROM instance.
     * @param rom The `RomData` object to write to
     */
    writeToRom (rom : RomData) 
    {
        for (let i = 0; i < this.data.length; ++i) {
            const classLine = this.data[i].classes;
            for (let j = 0; j < this.data[i].classes.length; ++j) {
                if (classLine[j] == undefined) continue;
                rom.text.set(ClassDefinition.TEXT_NAMES + i, classLine[j].name);
                rom.writeBlock(classLine[j].address, classLine[j].toBinary());
            }
        }
    }

    /**
     * Creates a new instance from the provided ROM data.
     * @param rom The `RomData` object to read from
     * @returns A new `ClassManager` instance which has been populated with game data
     */
    static loadFromRom (rom : RomData) : ClassManager
    {
        const instance = new ClassManager();
        const blockSize = ClassDefinition.BLOCK_SIZE;
        const address = ClassDefinition.ADDRESS;
        const endAddress = ClassDefinition.ADDRESS_END;
        const count = Math.floor((endAddress - address) / blockSize);

        let classLine : CharacterClass[] = [];

        // Iterate through all classes, skipping ID 0 because it is a dummy class
        for (let i = 1; i < count; ++i) {
            if (i % 10 == 0) {
                instance.data.push(new ClassLine(classLine));
                classLine = [];
            }

            const block = rom.readBlock(address + i * blockSize, blockSize);
            if (block.readByte(0) == 0) {
                // If it hits an empty block, then move i to the end of the class line data and continue
                i = Math.floor(i / 10) * 10 + 9;
                continue;
            }

            const classObj = CharacterClass.createFromBinary(i, block, rom.text);
            if (!classObj) continue;
            classLine.push(classObj);
        }

        instance.data.push(new ClassLine(classLine));
        return instance;
    }
}