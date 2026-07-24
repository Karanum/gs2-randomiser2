/**
 * Represents the type of calculation that the game will perform when the ability is used.
 * Determines hit chance, effect chance, damage, et cetera.
 */
export enum AbilityCalculation {
    NONE = 0,
    HP_RECOVERY,
    APPLY_EFFECT,
    ADDITIVE_POWER,
    MULTIPLICATIVE_POWER,
    FLAT_POWER,
    FLAT_POWER_WEAK_SPREAD,
    PRIORITY_EFFECT,
    SUMMON,
    APPLY_EFFECT_NO_FAIL, //TODO: Test whether this is accurate. Atrius' editor just calls it "Utility" but that seems too narrow. (see 498-508)
    PP_DRAIN,
    PP_RECOVERY
}

/**
 * Represents the ability effect script that is triggered by using an ability.
 */
//TODO: Figure out what's up with some effect scripts having multiple versions, and find some better naming scheme
export enum AbilityEffect {
    NONE = 0, UNKNOWN_01, UNKNOWN_02, 
    CURE_POISON, CURE_BATTLE_STATUS, REVIVE, 
    ATTACK_UP, ATTACK_UP_LOW, ATTACK_DOWN, ATTACK_DOWN_LOW,
    DEFENSE_UP, DEFENSE_UP_LOW, DEFENSE_DOWN, DEFENSE_DOWN_LOW,
    RESIST_UP, RESIST_UP_LOW, RESIST_DOWN, RESIST_DOWN_LOW,
    INFLICT_POISON, INFLICT_VENOM, INFLICT_DELUSION, INFLICT_CONFUSION, INFLICT_CHARM, INFLICT_STUN, INFLICT_SLEEP, 
        INFLICT_SEAL, INFLICT_HAUNT, INFLICT_DEATH, INFLICT_DEATH_CURSE,
    APPLY_REGEN, APPLY_REFLECT,
    HP_DRAIN, PP_DRAIN,
    BREAK, MAY_SET_HP_1, IGNORE_DEFENSE_HALF,
    UNKNOWN_36, UNKNOWN_37, UNKNOWN_38, UNKNOWN_39, UNKNOWN_40, UNKNOWN_41,
    MAY_DOUBLE_DAMAGE, UNKNOWN_43, MAY_TRIPLE_DAMAGE,
    CHANGE_RESISTANCES, 
    DAMAGE_SHIELD_50P, DAMAGE_SHIELD_90P,
    SIDESTEP, FLEE, SUMMON_COPY, BATTLE_CRY, CRAZY_VOICE,
    PREVENT_TARGET_ACTION, CHALLENGE, SELF_DESTRUCT,
    REVIVE_50P, REVIVE_80P,
    AGILITY_DOWN, AGILITY_UP,
    LIFE_STEAL, HEAL_HP_60P, HEAL_HP_30P, HEAL_PP_7P, CURE_ALL_STATUS,
    MAY_DOUBLE_DAMAGE_ALT, EXTRA_ACTION, INFLICT_SEAL_ALT, MAY_TRIPLE_DAMAGE_ALT,
    MAY_HEAL_PP_10P, HEAL_HP_50P, HEAL_HP_70P,
    DAMAGE_SHIELD_60P, REVIVE_60P,
    COUNTER,
    INFLICT_DELUSION_ALL,
    HEAL_HP_40P, HEAL_PP_10P, HEAL_PP_30P,
    VANISH,
    INFLICT_DEATH_CURSE_ALT,
    FORCE_END_TURN,
    MAY_REMOVE_TARGET,
    LOSE_HP_12P, LOSE_PP_10P,
    MAY_INFLICT_STUN,
    SUMMON_BALL, SUMMON_REVIVE,
    DAMAGE_SHIELD_95P,
    RANDOM_DAMAGE_BOOST,
    IGNORE_DEFENSE,
    TRIDENT
}

/**
 * Represents the number of targets targeted by an ability. 
 * The `SPREAD_X` ranges cause targets that are further out to use a diminished version of the hit calculation.
 */
export enum AbilityRange {
    NONE = 0,
    SINGLE,
    SPREAD_1,
    SPREAD_2,
    SPREAD_3,
    SPREAD_4,
    SPREAD_5,
    ALL = 0xFF
}

/**
 * Represents the potential targets for any given ability.
 */
export enum AbilityTarget {
    NONE = 0,
    ENEMY = 1,
    ALLY = 2,
    SELF = 4
}

/**
 * Represents the general type of an ability. This is purely semantic and is not represented in the ROM data.
 */
export enum AbilityType {
    DJINNI, ENEMY_SKILL, ITEM, PSYNERGY, SUMMON, SYSTEM, UNLEASH
}

/**
 * Represents whether an ability can be used from the field menu, the battle menu, or both.
 */
export enum AbilityUse {
    FIELD = 0x00,
    BATTLE = 0x80,
    BOTH = 0xC0
}

/**
 * Represents the way a Psynergy line is learned.
 * `NORMAL` lines let you learn each Psynergy cumulatively.
 * `REPLACE` lines replace the old Psynergy when you learn the next.
 */
export enum PsynergyLearnType {
    NORMAL,
    REPLACE
}

/**
 * Represents the type of Psynergy line.
 */
export enum PsynergyLineType {
    ATTACK,
    HEALING,
    BUFF,
    DEBUFF
}

/**
 * Represents the utility effect script that is triggered by using an ability.
 */
export enum UtilityEffect {
    NONE = 0,
    MOVE,
    MIND_READ,
    PLY,
    FORCE,
    DOUSE,
    FROST,
    LIFT,
    REVEAL,
    HALT,
    CLOAK,
    CARRY,
    GROWTH,
    CATCH,
    WHIRLWIND,
    RETREAT,
    AVOID,
    LASH,
    POUND,
    TREMOR,
    SCOOP,
    BURST,
    PARCH,
    SAND,
    HOVER,
    CYCLONE,
    BLAZE,
    GRIND,
    MAGNET,
    ARROW,
    TELEPORT
}

/**
 * Represents the indices of various field Psynergy.
 */
export enum FieldPsynergy {
    GROWTH      = 0x0C,
    FROST       = 0x18,
    DOUSE       = 0x21,
    WHIRLWIND   = 0x4E,
    LASH        = 0x85,
    POUND       = 0x86,
    TREMOR      = 0x87,
    SCOOP       = 0x88,
    CYCLONE     = 0x89,
    PARCH       = 0x8A,
    SAND        = 0x8B,
    MIND_READ   = 0x8D,
    FORCE       = 0x8E,
    LIFT        = 0x8F,
    REVEAL      = 0x90,
    CARRY       = 0x93,
    BURST       = 0x97,
    GRIND       = 0x98,
    HOVER       = 0x99,
    BLAZE       = 0x9A,
    TELEPORT    = 0x9C,
}