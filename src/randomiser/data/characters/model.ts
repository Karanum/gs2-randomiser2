import { CharacterDefinition } from "$lib/definitions";
import type { PRNG } from "$lib/prng";
import type { BinaryView } from "../../binary_view";
import { StatBlock } from "../enums";
import type { TextManager } from "../text/manager";

/** These are the base "affinities" for each of the in-game elements */
export const elementLevelBlocks = [[54, 3, 1, 2], [3, 54, 2, 1], [1, 2, 54, 3], [2, 1, 3, 54]];

/**
 * Data class representing a single in-game playable character.
 */
export class PlayableCharacter 
{
    readonly id : number;
    readonly address : number;

    public name : string = '';
    public startingLevel : number;
    public statGrowths : number[][];
    public eLevels : number[];
    public inventory : number[];
    public psynergy : number[];

    constructor (id:number, name:string, startingLevel:number, statGrowths:number[][], eLevels:number[], inventory:number[], psynergy:number[])
    {
        this.id = id;
        this.address = CharacterDefinition.ADDRESS + CharacterDefinition.BLOCK_SIZE * id;

        this.name = name;
        this.startingLevel = startingLevel;
        this.statGrowths = statGrowths;
        this.eLevels = eLevels;
        this.inventory = inventory;
        this.psynergy = psynergy;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array
    {
        const data = new Uint8Array(CharacterDefinition.BLOCK_SIZE);

        for (let i = 0; i < 6; ++i) {
            for (let j = 0; j < 5; ++j) {
                data[80 + 12 * j + 2 * i] = this.statGrowths[j][i];
                data[81 + 12 * j + 2 * i] = (this.statGrowths[j][i] >> 8);
            }
            data[140 + i] = this.statGrowths[5][i];
        }

        data.set(this.eLevels, 146);
        data[150] = this.startingLevel;

        let addr = 152;
        this.inventory.filter(item => item < 0x800).forEach(item => {
            if (!item) return;
            data.set([item, item >> 8], addr);
            addr += 2;
        });

        return data;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : PlayableCharacter
    {
        return new PlayableCharacter(this.id, this.name, this.startingLevel, this.statGrowths.map(stat => ([...stat])), 
            [...this.eLevels], [...this.inventory], [...this.psynergy]);
    }

    /**
     * Randomly sets the stat growths of the character within a variance of the current values.
     * @param prng The PRNG instance for the currently generating seed
     * @param lowVariance (optional) The variance in percent for Lv 1, defaults to `0.5`
     * @param highVariance (optional) The variance in percent for Lv 99, defaults to `0.25`
     * @param luckVariance  (optional) The variance in percent for the Luck stat, defaults to `0.25`
     */
    adjustStatGrowths (prng : PRNG, lowVariance : number = 0.5, highVariance : number = 0.25, luckVariance : number = 0.25) : void
    {
        this.statGrowths.forEach((statBlock, i) => {
            if (i != StatBlock.LUCK) {
                const low = Math.max(1, Math.round(statBlock[0] * prng.randomBetween(1 - lowVariance, 1 + lowVariance)));
                const high = Math.min(999, Math.round(statBlock[5] * prng.randomBetween(1 - highVariance, 1 + highVariance)));
                const step = (high - low) / 5;
                for (let i = 0; i < 6; ++i) {
                    statBlock[i] = Math.round(low + i * step);
                }
            } else {
                const luck = Math.max(1, Math.round(statBlock[0] * prng.randomBetween(1 - luckVariance, 1 + luckVariance)));
                statBlock.fill(luck);
            }
        });
    }

    setStartingLevel () : void
    {
        //TODO: Implement (after doing randomisation because this should optionally be based on sphere depth)
    }

    /**
     * Creates a new `PlayableCharacter` instance from a binary data block.
     * @param id The zero-indexed id of the character within the game data
     * @param data The binary data block to read from; must be 180 bytes
     * @returns The newly created `PlayableCharacter`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, text : TextManager) : PlayableCharacter|undefined
    {
        if (data.length < CharacterDefinition.BLOCK_SIZE) return;
        const statGrowths : number[][] = [[], [], [], [], [], []];
        const eLevels : number[] = [data.readByte(146), data.readByte(147), data.readByte(148), data.readByte(149)];
        const inventory : number[] = [];
        const name : string = text.get(CharacterDefinition.TEXT_NAMES + id) ?? '?';

        for (let i = 0; i < 6; ++i) {
            statGrowths[0].push(data.readHalfword(80 + 2 * i));
            statGrowths[1].push(data.readHalfword(92 + 2 * i));
            statGrowths[2].push(data.readHalfword(104 + 2 * i));
            statGrowths[3].push(data.readHalfword(116 + 2 * i));
            statGrowths[4].push(data.readHalfword(128 + 2 * i));
            statGrowths[5].push(data.readByte(140 + i));
        }

        let addr = 152;
        while (addr < 180) {
            const item = data.readHalfword(addr);
            if (item == 0x0000) break;
            inventory.push(item);
            addr += 2;
        }

        return new PlayableCharacter(id, name, data.readHalfword(150), statGrowths, eLevels, inventory, []);
    }
}