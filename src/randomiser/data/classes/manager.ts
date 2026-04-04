import { ClassDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import { clamp } from "$lib/util";
import type { RomData } from "../../rom";
import type { AbilityManager } from "../abilities/manager";
import { psynergyLines } from "../abilities/psynergyLines";
import { GenericManager } from "../base";
import { Element, StatBlock } from "../enums";
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
export class ClassManager extends GenericManager<ClassLine>
{
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

    /**
     * Randomise Psynergy learned by classes, replacing Psynergy only with other Psynergy of the same element. 
     * All non-elemental Psynergy are considered to have an "effective" element for this purpose.
     * @param prng The PRNG instance for the currently generating seed
     * @param abilities The AbilityManager instance for the currently generating seed
     */
    randomisePsynergyByElement (prng : PRNG, abilities : AbilityManager)
    {
        // Sort all Psynergy into buckets per element and prepare weights
        const psynergyData : [number, number][][] = [[], [], [], []];
        const weights : number[][] = [[], [], [], []];
        const totalWeights : number[] = [0, 0, 0, 0];

        psynergyLines.forEach(line => {
            line.psynergy.forEach(([id, level]) => {
                let element = abilities.get(id)?.element ?? Element.PHYSICAL;
                if (element == Element.PHYSICAL) element = this.resolvePsynergyElement(id);

                psynergyData[element].push([id, level]);
                weights[element].push(1);
                totalWeights[element] += 1;
            });
        });

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
                    let element = abilities.get(entry[0])?.element ?? Element.PHYSICAL;
                    if (element == Element.PHYSICAL) element = this.resolvePsynergyElement(entry[0]);

                    let targetIndex, targetPsynergy;
                    do {
                        targetIndex = prng.randomWeighted(weights[element], totalWeights[element]);
                        targetPsynergy = psynergyData[element][targetIndex];
                    } while (selectedPsynergy.includes(targetPsynergy[0]));

                    psynergyMap[entry[0]] = [...targetPsynergy];
                    selectedPsynergy.push(targetPsynergy[0]);
                    classObj.psynergy[i] = [...targetPsynergy];

                    // Update weights to make the picked Psynergy less likely to be repeated
                    const previousWeight = weights[element][targetIndex];
                    weights[element][targetIndex] = previousWeight * psynergyWeightFallout;
                    totalWeights[element] -= (previousWeight - weights[element][targetIndex]);
                }
            });
        });
    }

    /**
     * Randomise Psynergy learned by classes by shuffling the Psynergy lists between class lines.
     * If the class lines have an inconsistent number of classes, the lists will be scaled accordingly.
     * @param prng The PRNG instance for the currently generating seed
     */
    shufflePsynergyByClass (prng : PRNG)
    {
        // Collect all class Psynergy data
        const psynergyData : [number[][], number[][]][] = [];

        this.data.forEach(classLine => {
            const classData : [number[][], number[][]] = [new Array(16).fill([]), new Array(16).fill([])];
            classLine.classes.forEach(classObj => {
                for (let i = 0; i < 16; ++i) {
                    classData[0][i].push(classObj.psynergy[i][0]);
                    classData[1][i].push(classObj.psynergy[i][1]);
                }
            });
            psynergyData.push(classData);
        });

        // Randomly assign a class Psynergy data entry to each class line
        this.data.forEach(classLine => {
            const targetData = prng.randomArrayElement(psynergyData, true);
            const sourceLength = classLine.classes.length;
            const targetLength = targetData[0][0].length;

            if (sourceLength == targetLength) {
                // If the class lines are of equal length, no interpolation is needed
                classLine.classes.forEach((classObj, ci) => {
                    for (let i = 0; i < 16; ++i) {
                        classObj.psynergy[i][0] = targetData[0][i][ci];
                        classObj.psynergy[i][1] = targetData[1][i][ci];
                    }
                });
            } else {
                // If the class lines are of differing lengths, interpolate the Psynergy lists
                const frac = targetLength / sourceLength;
                classLine.classes.forEach((classObj, ci) => {
                    const targetList = (sourceLength < targetLength) ? Math.ceil(frac * ci) : Math.floor(frac * ci);
                    for (let i = 0; i < 16; ++i) {
                        classObj.psynergy[i][0] = targetData[0][i][targetList];
                        classObj.psynergy[i][1] = targetData[1][i][targetList];
                    }
                });
            }
        });
    }

    /**
     * Adjusts the Psynergy learning levels for every class. Each slot will be adjusted between
     * -50% and +50%, but no more than 15 levels difference from its original level.
     * @param prng The PRNG instance for the currently generating seed
     */
    varyPsynergyLevels (prng : PRNG)
    {
        this.data.forEach(classLine => {
            const variance : number[] = [];
            for (let i = 0; i < 16; ++i) {
                variance.push(prng.randomBetween(-0.5, 0.5));
            }

            classLine.classes.forEach(classObj => {
                for (let i = 0; i < 16; ++i) {
                    const level = classObj.psynergy[i][1];
                    if (level == 0) continue;

                    let newLevel = clamp(Math.round(level * variance[i]), 1, 99);
                    classObj.psynergy[i][1] = clamp(newLevel, level - 15, level + 15);
                }
            });
        });
    }

    /**
     * Fully randomise Psynergy learning levels for every class.
     * Each slot will be set to a value between 1 and 50, consistent between classes within a line.
     * @param prng The PRNG instance for the currently generating seed
     */
    randomisePsynergyLevels (prng : PRNG)
    {
        this.data.forEach(classLine => {
            const levels : number[] = [];
            for (let i = 0; i < 16; ++i) {
                levels.push(prng.randomInt(50) + 1);
            }

            classLine.classes.forEach(classObj => {
                for (let i = 0; i < 16; ++i) {
                    if (classObj.psynergy[i][1] == 0) continue;
                    classObj.psynergy[i][1] = levels[i];
                }
            });
        });
    }

    /**
     * Randomises the stat modifiers for every class line. Picks a minimum and maximum modifier
     * based on total elemental value and interpolates it for each class in the line.
     * @param prng The PRNG instance for the currently generating seed
     */
    randomiseStatModifiers (prng : PRNG)
    {
        this.data.forEach(classLine => {
            let minScore = classLine.classes[0].getTotalElementScore();
            let maxScore = classLine.classes[classLine.classes.length - 1].getTotalElementScore();
            
            if (minScore == 0) {
                minScore = 2;
            }

            for (let i = 0; i < 5; ++i) {
                let minStat = this.generateRandomStat(prng, minScore);
                let maxStat = Math.max(this.generateRandomStat(prng, maxScore), this.generateRandomStat(prng, maxScore));
                if (minStat > maxStat) {
                    [minStat, maxStat] = [maxStat, minStat];
                }

                const step = (maxStat - minStat) / classLine.classes.length;
                classLine.classes.forEach((classObj, ci) => {
                    classObj.stats[i] = Math.floor(minStat + ci * step);
                });
            }

            const luck = Math.round(prng.randomBetween(8, 13));
            classLine.classes.forEach(classObj => {
                classObj.stats[StatBlock.LUCK] = luck;
            })
        });
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
     * Generates a random stat modifier value based on the given elemental value.
     * The resulting stat modifier is fractional and needs to be rounded later.
     * @param prng The PRNG instance for the currently generating seed
     * @param elemValue The total elemental value of the class
     */
    private generateRandomStat(prng : PRNG, elemValue : number) : number
    {
        const min = Math.round(7.9 + 0.25 * elemValue);
        const max = min + Math.floor(6 + 0.5 * elemValue);
        return prng.randomBetween(min, max);
    }

    /**
     * Resolves the effective element for Psynergy with the `PHYSICAL` element. 
     */
    private resolvePsynergyElement(id : number) : Element
    {
        if (id == 600 || id == 604) return Element.VENUS;
        if (id == 602) return Element.JUPITER;
        return Element.MARS;
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