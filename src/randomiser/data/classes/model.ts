import { ClassDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { BinaryView } from "../../binary_view";
import { PsynergyLearnType, type AbilityEffect } from "../abilities/enums";
import type { PsynergyLine } from "../abilities/psynergyLines";
import { DataModel } from "../base";
import type { TextManager } from "../text/manager";

/**
 * Data class representing a group of sequential in-game character classes.
 */
export class ClassLine
{
    readonly classes : CharacterClass[];
    public freePsynergySlots : number;

    constructor (classes : CharacterClass[])
    {
        this.classes = classes;
        this.freePsynergySlots = classes[classes.length - 1].psynergy.filter(p => p[0] == 0).length;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : ClassLine
    {
        const cloned = new ClassLine(this.classes.map(c => c.clone()));
        return cloned;
    }

    /**
     * Clears all Psynergy learning data from each class in this class line.
     */
    clearPsynergyData () : void
    {
        this.classes.forEach(c => c.clearPsynergyData());
        this.freePsynergySlots = 16;
    }

    /**
     * Deletes all learning data for the given Psynergy from each class in this class line.
     * @param psynergy The id of the Psynergy to delete
     */
    deletePsynergy (psynergy : number) : void
    {
        this.classes.forEach(c => {
            for (let i = 0; i < c.psynergy.length; ++i) {
                if (c.psynergy[i][0] == psynergy) {
                    c.psynergy[i][0] = 0;
                    c.psynergy[i][1] = 0;
                }
            }
        });
        this.freePsynergySlots = this.classes[this.classes.length - 1].psynergy.filter(p => p[0] == 0).length;
    }

    /**
     * Inserts a Psynergy line into the classes of this class line. If the class line already has half of its Psynergy slots
     * filled, the formula for determining progression of the Psynergy within the class line will include a random stagger factor.
     * This means that the first class in this line is not guaranteed to learn any of the Psynergy yet.
     * @param prng The PRNG instance for the currently generating seed
     * @param psynergyLine The `PsynergyLine` object to insert
     */
    insertPsynergyLine (prng : PRNG, psynergyLine : PsynergyLine) : void
    {
        let stagger = 0;
        if (this.freePsynergySlots <= 4) {
            stagger = prng.randomBetween(0.5, 0.9);
        } else if (this.freePsynergySlots <= 8) {
            stagger = prng.randomBetween(0.1, 0.5);
        }

        // Calculate learning thresholds for all Psynergy and classes
        const psynergyLearnThreshold = psynergyLine.progressFactor * (1 - stagger);
        const psynergyLearnThresholdStep = psynergyLearnThreshold / Math.max(1, psynergyLine.psynergy.length - 1);
        const psynergyThresholds = psynergyLine.psynergy.map((_, i) => stagger + i * psynergyLearnThresholdStep);
        const classLearnThresholdStep = 1 / this.classes.length;

        if (psynergyLine.learning == PsynergyLearnType.NORMAL) {   
            // Insert the entire Psynergy line cumulatively  
            for (let i = 0; i < this.classes.length; ++i) {
                const classObj = this.classes[i];
                const classLearnThreshold = (i + 1) * classLearnThresholdStep;
                const startingSlot = 16 - this.freePsynergySlots;

                for (let j = 0; j < psynergyThresholds.length && startingSlot + j < 16; ++j) {
                    if (classLearnThreshold < psynergyThresholds[j]) continue;
                    classObj.psynergy[startingSlot + j] = psynergyLine.psynergy[j];
                }
            }

            this.freePsynergySlots -= psynergyThresholds.length;
        } else {
            // Insert the highest available Psynergy in the line into a single slot
            for (let i = 0; i < this.classes.length; ++i) {
                const classObj = this.classes[i];
                const classLearnThreshold = (i + 1) * classLearnThresholdStep;
                const slot = 16 - this.freePsynergySlots;

                for (let j = psynergyThresholds.length - 1; j >= 0; --j) {
                    if (classLearnThreshold < psynergyThresholds[j]) continue;
                    classObj.psynergy[slot] = psynergyLine.psynergy[j];
                    break;
                }
            }

            this.freePsynergySlots -= 1;
        }
    }
}


/**
 * Data class representing a single in-game character class.
 */
export class CharacterClass extends DataModel
{
    public name : string;
    public priority : number;
    public elements : number[];
    public stats : number[];
    public psynergy : [number, number][];
    public weaknesses : AbilityEffect[];

    constructor (id:number, name:string, priority:number, elements:number[], stats:number[], psynergy:[number, number][], weaknesses:number[])
    {
        super(id, ClassDefinition.ADDRESS + ClassDefinition.BLOCK_SIZE * id);
        this.name = name;
        this.priority = priority;
        this.elements = elements;
        this.stats = stats;
        this.psynergy = psynergy;
        this.weaknesses = weaknesses;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array
    {
        const data = new Uint8Array(ClassDefinition.BLOCK_SIZE);
        data[0] = this.priority;

        for (let i = 0; i < 4; ++i) {
            data[4 + i] = this.elements[i];
        }
        for (let i = 0; i < 6; ++i) {
            data[8 + i] = this.stats[i];
        }
        for (let i = 0; i < 4; ++i) {
            data[80 + i] = this.weaknesses[i];
        }
        for (let i = 0; i < 16; ++i) {
            const psynergyEntry = this.psynergy[i];
            data[16 + 4 * i] = psynergyEntry[0];
            data[17 + 4 * i] = (psynergyEntry[0] >> 8);
            data[18 + 4 * i] = psynergyEntry[1];
        }

        return data;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : CharacterClass
    {
        return new CharacterClass(this.id, this.name, this.priority, [...this.elements], [...this.stats], 
            this.psynergy.map(p => [p[0], p[1]]), [...this.weaknesses]);
    }

    /**
     * Returns the average of all non-zero element scores for this class.
     */
    getAverageElementScore () : number
    {
        let count = 0, total = 0;
        for (let i = 0; i < 4; ++i) {
            if (this.elements[i] == 0) continue;
            total += this.elements[i];
            ++count;
        }
        return total / count;
    }

    /**
     * Clears all Psynergy learning data from this class.
     */
    clearPsynergyData () : void
    {
        this.psynergy.forEach(p => {
            p[0] = 0;
            p[1] = 0;
        });
    }

    /**
     * Creates a new `CharacterClass` instance from a binary data block.
     * @param id The zero-indexed id of the class within the game data
     * @param data The binary data block to read from; must be 84 bytes
     * @returns The newly created `CharacterClass`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, text : TextManager) : CharacterClass|undefined
    {
        if (data.length < ClassDefinition.BLOCK_SIZE) return;
        const name = text.get(ClassDefinition.TEXT_NAMES + id) ?? '?';
        const elements = [data.readByte(4), data.readByte(5), data.readByte(6), data.readByte(7)];
        const stats = [data.readByte(8), data.readByte(9), data.readByte(10), data.readByte(11), data.readByte(12), data.readByte(13)];
        const weaknesses = [data.readByte(80), data.readByte(81), data.readByte(82), data.readByte(83)];
        const psynergy : [number, number][] = [];

        for (let i = 0; i < 16; ++i) {
            psynergy.push([ data.readHalfword(16 + 4 * i), data.readByte(18 + 4 * i) ]);
        }
        return new CharacterClass(id, name, data.readByte(0), elements, stats, psynergy, weaknesses);
    }
}