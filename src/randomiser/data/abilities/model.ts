import { AbilityDefinition } from "$lib/definitions";
import { AbilityCalculation, AbilityEffect, AbilityRange, AbilityTarget, AbilityType, AbilityUse, UtilityEffect } from "./enums";
import { Element } from "./../enums";
import type { PRNG } from "$lib/prng";
import type { BinaryView } from "../../binary_view";
import type { TextManager } from "../text/manager";
import { DataModel } from "../base";

/**
 * Data class representing a single in-game ability. (Psynergy, Djinn/summon actions, battle actions, et cetera)
 */
export class Ability extends DataModel
{
    readonly type : AbilityType;

    public name : string = '';
    public description : string = '';
    public target : AbilityTarget;
    public usage : AbilityUse;
    public calcType : AbilityCalculation;
    public element : Element;
    public addedEffect : AbilityEffect;
    public icon : number;
    public utility : UtilityEffect;
    public range : AbilityRange;
    public cost : number;
    public power : number;


    constructor (id:number, name:string, description:string, target:AbilityTarget, usage:AbilityUse, calcType:AbilityCalculation, element:Element, 
        addedEffect:AbilityEffect, icon:number, utility:UtilityEffect, range:AbilityRange, cost:number, power:number) 
    {
        super(id, AbilityDefinition.ADDRESS + AbilityDefinition.BLOCK_SIZE * id);
        this.type = this.determineType();
        this.name = name;
        this.description = description;
        this.target = target;
        this.usage = usage;
        this.calcType = calcType;
        this.element = element;
        this.addedEffect = addedEffect;
        this.icon = icon;
        this.utility = utility;
        this.range = range;
        this.cost = cost;
        this.power = power;
    }

    /**
     * Determines the type of an ability based on its id number.
     * @returns The AbilityType that best describes this ability.
     */
    private determineType () : AbilityType 
    {
        if (this.id < 3) return AbilityType.SYSTEM;
        if (this.id < 208) return AbilityType.PSYNERGY;
        if (this.id < 239) return AbilityType.UNLEASH;
        if (this.id < 271) return AbilityType.ITEM;
        if (this.id < 300) return AbilityType.ENEMY_SKILL;
        if (this.id < 380) return AbilityType.DJINNI;
        if (this.id < 413) return AbilityType.SUMMON;
        if (this.id < 519) return AbilityType.ENEMY_SKILL;
        if (this.id < 580) return AbilityType.UNLEASH;
        if (this.id < 637) return AbilityType.PSYNERGY;
        return AbilityType.ENEMY_SKILL;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array
    {
        return new Uint8Array([ this.target, (this.usage << 4) + this.calcType, this.element, this.addedEffect, this.icon & 0xFF,
            this.icon >> 8, this.utility, 0x00, this.range, this.cost, this.power & 0xFF, this.power >> 8 ]);
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : Ability
    {
        return new Ability(this.id, this.name, this.description, this.target, this.usage, this.calcType, this.element, this.addedEffect,
            this.icon, this.utility, this.range, this.cost, this.power);
    }

    /**
     * Randomly sets the range of the ability. Has no effect on abilities that
     * already have a range of `AbilityRange.NONE`.
     * @param prng The PRNG instance for the currently generating seed
     */
    randomiseRange (prng : PRNG) : void 
    {
        if (this.range == AbilityRange.NONE) return;
        this.range = prng.randomInt(6);
        if (this.range == AbilityRange.NONE) this.range = AbilityRange.ALL;
    }

    /**
     * Randomly sets the cost of the ability within a variance of its current cost.
     * Has no effect on abilities that are not considered Psynergy, or have a cost of 0.
     * @param prng The PRNG instance for the currently generating seed
     * @param variance (optional) The variance in percent, defaults to `0.4`
     */
    varyCost (prng : PRNG, variance : number = 0.4) : void 
    {
        if (this.type != AbilityType.PSYNERGY || this.cost == 0) return;
        this.cost = Math.round(this.cost * prng.randomBetween(1 - variance, 1 + variance));
    }

    /**
     * Randomly sets the power of the ability within a variance of its current power.
     * Has no effect on abilities that have a power of 0.
     * @param prng The PRNG instance for the currently generating seed
     * @param variance (optional) The variance in percent, defaults to `0.2`
     */
    varyPower (prng : PRNG, variance : number = 0.2) : void 
    {
        if (this.power == 0) return;
        this.power = Math.round(this.power * prng.randomBetween(1 - variance, 1 + variance));
    } 

    /**
     * Override of the default `toString` method.
     */
    toString () : string
    {
        return JSON.stringify({
            id: this.id,
            address: '0x' + this.address.toString(16).toUpperCase(),
            type: AbilityType[this.type],
            target: AbilityTarget[this.target],
            usage: AbilityUse[this.usage],
            calcType: AbilityCalculation[this.calcType],
            element: Element[this.element],
            addedEffect: AbilityEffect[this.addedEffect],
            icon: this.icon,
            utility: UtilityEffect[this.utility],
            range: AbilityRange[this.range],
            cost: this.cost,
            power: this.power
        });
    }

    /**
     * Creates a new `Ability` instance from a binary data block.
     * @param id The zero-indexed id of the ability within the game data
     * @param data The binary data block to read from; must be 12 bytes
     * @returns The newly created `Ability`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, text : TextManager) : Ability|undefined
    {
        if (data.length < AbilityDefinition.BLOCK_SIZE) return;
        const usage = (data.readByte(1) >> 4) & 0xF;
        const calcType = data.readByte(1) & 0xF;
        const name = text.get(AbilityDefinition.TEXT_NAMES + id) ?? '?';
        const description = text.get(AbilityDefinition.TEXT_DESCRIPTIONS + id) ?? '?';

        return new Ability(id, name, description, data.readByte(0), usage, calcType, data.readByte(2), data.readByte(3), 
            data.readHalfword(4), data.readByte(6), data.readByte(8), data.readByte(9), data.readHalfword(10));
    }
}