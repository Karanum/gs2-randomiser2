import { EnemyDefinition } from "$lib/definitions";
import { BinaryView } from "../../binary_view";
import { AbilityEffect } from "../abilities/enums";
import { DataModel } from "../base";
import type { TextManager } from "../text/manager";
import { EnemyAttackPattern, EnemyIQ } from "./enums";

/**
 * Data class representing a single in-game enemy. Due to the high number of fields, 
 * most enemy data is deferred to the `EnemyActions`, `EnemyDisplay`, `EnemyStats`, and `EnemyRewards` classes.
 */
export class Enemy extends DataModel
{
    readonly displayAddress : number;

    readonly actions : EnemyActions;
    readonly display : EnemyDisplay;
    readonly stats : EnemyStats;
    readonly rewards : EnemyRewards;

    public name : string;

    constructor (id:number, name:string, actions:EnemyActions, display:EnemyDisplay, stats:EnemyStats, rewards:EnemyRewards)
    {
        super(id, EnemyDefinition.ADDRESS + id * EnemyDefinition.BLOCK_SIZE);
        this.displayAddress = EnemyDefinition.ADDRESS_DISPLAY + id * 8;

        this.actions = actions;
        this.display = display;
        this.stats = stats;
        this.rewards = rewards;

        this.name = name;
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        const data = new BinaryView();
        data.expand(EnemyDefinition.BLOCK_SIZE);
        for (let i = 0; i < 14; ++i) {
            data.writeByte(i, 0x20);
        }

        data.writeByte(15, this.stats.level);
        data.writeHalfword(16, this.stats.hp);
        data.writeHalfword(18, this.stats.pp);
        data.writeHalfword(20, this.stats.attack);
        data.writeHalfword(22, this.stats.defense);
        data.writeHalfword(24, this.stats.agility);
        data.writeByte(26, this.stats.luck);
        data.writeByte(27, this.actions.actionsPerTurn);
        data.writeByte(28, this.stats.hpRegen);
        data.writeByte(29, this.stats.ppRegen);

        for (let i = 0; i < 4 && i < this.actions.items.length; ++i) {
            data.writeHalfword(30 + 2 * i, this.actions.items[i][0]);
            data.writeByte(38 + i, this.actions.items[i][1]);
        }

        data.writeByte(42, this.stats.elementTable);
        data.writeByte(43, this.actions.iq);
        data.writeByte(44, this.actions.pattern);
        data.writeByte(45, this.actions.slotFlags);
        
        for (let i = 0; i < 8 && i < this.actions.attacks.length; ++i) {
            data.writeHalfword(46 + 2 * i, this.actions.attacks[i]);
        }

        for (let i = 0; i < 3 && i < this.stats.weakTo.length; ++i) {
            data.writeByte(62 + i, this.stats.weakTo[i]);
        }

        data.writeHalfword(66, this.rewards.coins);
        data.writeHalfword(68, this.rewards.drop);
        data.writeHalfword(70, this.rewards.dropRate);
        data.writeHalfword(72, this.rewards.exp);

        return data.getData();
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : Enemy 
    {
        return new Enemy(this.id, this.name, this.actions.clone(), this.display.clone(), this.stats.clone(), this.rewards.clone());
    }

    /**
     * Sets both the item drop and drop rate for this enemy.
     * @param item The id of the item to drop
     * @param rate The drop rate for this item (`1/rate`)
     */
    setDrop(item : number, rate : number) 
    {
        this.rewards.drop = item;
        this.rewards.dropRate = rate;
    }

    /**
     * Creates a new `Enemy` instance from a binary data block.
     * @param id The zero-indexed id of the enemy within the game data
     * @param data The binary data block to read from; must be 76 bytes
     * @returns The newly created `Enemy`, or `undefined` if the binary data block is too short
     */
    static createFromBinary (id : number, data : BinaryView, displayData : BinaryView, text : TextManager) : Enemy|undefined
    {
        if (data.length < EnemyDefinition.BLOCK_SIZE) return;
        if (displayData.length < 8) return;

        const name : string = text.get(EnemyDefinition.TEXT_NAMES + id) ?? '?';
        const items : [number, number][] = [];
        const attacks : number[] = [];
        const weakTo : number[] = [];

        for (let i = 0; i < 4; ++i) {
            items.push([data.readHalfword(30 + 2 * i), data.readByte(38 + i)]);
            attacks.push(data.readHalfword(46 + 4 * i));
            attacks.push(data.readHalfword(48 + 4 * i));
        }
        for (let i = 0; i < 3; ++i) {
            weakTo.push(data.readByte(62 + i));
        }

        const actions = new EnemyActions(data.readByte(27), data.readByte(43), data.readByte(44), data.readByte(45), items, attacks);
        const display = new EnemyDisplay(displayData.readHalfword(0), displayData.readByte(2), displayData.readByte(3), displayData.readByte(4));
        const stats = new EnemyStats(data.readByte(15), data.readHalfword(16), data.readHalfword(18), data.readHalfword(20), data.readHalfword(22),
            data.readHalfword(24), data.readByte(26), data.readByte(27), data.readByte(28), data.readByte(42), weakTo);
        const rewards = new EnemyRewards(data.readHalfword(66), data.readHalfword(72), data.readHalfword(68), data.readHalfword(70));

        return new Enemy(id, name, actions, display, stats, rewards);
    }
}

/**
 * Auxiliary data class representing the battle actions (and related settings) of an enemy.
 */
export class EnemyActions
{
    public actionsPerTurn : number;
    public iq : EnemyIQ;
    public pattern : EnemyAttackPattern;
    public slotFlags : number;
    public items : [number, number][];
    public attacks : number[];
    
    constructor (actionsPerTurn:number, iq:EnemyIQ, pattern:EnemyAttackPattern, slotFlags:number, items:[number,number][], attacks:number[])
    {
        this.actionsPerTurn = actionsPerTurn;
        this.iq = iq;
        this.pattern = pattern;
        this.slotFlags = slotFlags;
        this.items = items;
        this.attacks = attacks;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : EnemyActions
    {
        return new EnemyActions(this.actionsPerTurn, this.iq, this.pattern, this.slotFlags,
            this.items.map(slot => ([...slot])), [...this.attacks]);
    }
}

/**
 * Auxiliary data class representing information required to display an enemy in battle.
 */
export class EnemyDisplay
{
    public sprite : number;
    public attackEffects : number;
    public deathEffects : number;
    public effectHeight : number;

    constructor (sprite:number, attackEffects:number, deathEffects:number, effectHeight:number)
    {
        this.sprite = sprite;
        this.attackEffects = attackEffects;
        this.deathEffects = deathEffects;
        this.effectHeight = effectHeight;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : EnemyDisplay
    {
        return new EnemyDisplay(this.sprite, this.attackEffects, this.deathEffects, this.effectHeight);
    }

    /**
     * Returns a binary representation of this object.
     */
    toBinary () : Uint8Array 
    {
        return new Uint8Array([ this.sprite & 0xFF, this.sprite >> 8, this.attackEffects, 
            this.deathEffects, this.effectHeight, 0, 0, 0 ]);
    }
}

/**
 * Auxiliary data class representing the stats of an enemy.
 */
export class EnemyStats
{
    public level : number;
    public hp : number;
    public pp : number;
    public attack : number;
    public defense : number;
    public agility : number;
    public luck : number;
    public hpRegen : number;
    public ppRegen : number;
    public elementTable : number;
    public weakTo : AbilityEffect[];

    constructor (level:number, hp:number, pp:number, attack:number, defense:number, agility:number, luck:number, hpRegen:number, 
        ppRegen:number, elementTable:number, weakTo:AbilityEffect[])
    {
        this.level = level;
        this.hp = hp;
        this.pp = pp;
        this.attack = attack;
        this.defense = defense;
        this.agility = agility;
        this.luck = luck;
        this.hpRegen = hpRegen;
        this.ppRegen = ppRegen;
        this.elementTable = elementTable;
        this.weakTo = weakTo;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : EnemyStats
    {
        return new EnemyStats(this.level, this.hp, this.pp, this.attack, this.defense, this.agility, this.luck, this.hpRegen, 
            this.ppRegen, this.elementTable, this.weakTo);
    }
}

/**
 * Auxiliary data class representing the battle rewards of an enemy.
 */
export class EnemyRewards
{
    public coins : number;
    public exp : number;
    public drop : number;
    public dropRate : number;

    constructor (coins:number, exp:number, drop:number, dropRate:number) {
        this.coins = coins;
        this.exp = exp;
        this.drop = drop;
        this.dropRate = dropRate;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : EnemyRewards
    {
        return new EnemyRewards(this.coins, this.exp, this.drop, this.dropRate);
    }
}
