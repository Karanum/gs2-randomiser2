/**
 * Represents the added effects that equipment can have on the wearer while equipped.
 */
export enum EquipEffect {
    NONE,
    ADD_HP,
    ADD_HP_REGEN,
    ADD_PP,
    ADD_PP_REGEN,
    ADD_AGILITY,
    ADD_LUCK,
    MULTIPLY_HP,
    MULTIPLY_HP_REGEN,
    MULTIPLY_PP,
    MULTIPLY_PP_REGEN,
    MULTIPLY_ATTACK,
    MULTIPLY_DEFENSE,
    MULTIPLY_AGILITY,
    MULTIPLY_LUCK,
    VENUS_POWER,
    MERCURY_POWER,
    MARS_POWER,
    JUPITER_POWER,
    VENUS_RESIST,
    MERCURY_RESIST,
    MARS_RESIST,
    JUPITER_RESIST,
    UNLEASH_RATE,
    COUNTER,
    IGNORE_CURSE,
    ADD_TURN,
    BOOST_ENCOUNTERS
}

/**
 * Represents the different types of items.
 */
export enum ItemType {
    ITEM,
    WEAPON,
    ARMOUR,
    SHIELD,
    HEADGEAR,
    FOOTGEAR,
    ABILITY_EQUIP,
    GENERIC_EQUIP,
    RING,
    UNDERSHIRT,
    CLASS_EQUIP,
    STORY
}

/**
 * Represents what happens to usable items when they are used.
 * For `REPLACE` it seems that the id of the item is incremented by 1 on use (only used by Hermes' Water).
 */
export enum ItemUseEffect {
    NONE,
    CONSUME,
    BREAK,
    LEARN_ABILITY,
    REPLACE
}

/**
 * Represents the starting IDs for the groups of technical "pseudo"-items added by the randomiser.
 * For comparing item IDs, using `(id & 0xFF00)` will give the group as represented by this enum.
 */
export enum PseudoItemGroup {
    ARCHIPELAGO = 0xA00,
    CHARACTER = 0xD00,
    PSYNERGY = 0xE00,
    SUMMON = 0xF00
}