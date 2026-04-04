/**
 * The purpose of this file is to collate information about where certain data is located 
 * in the original game, rather than have it spread out across different places.
 */

export const AbilityDefinition = {
    ADDRESS: 0xB7C14,
    BLOCK_SIZE: 12,
    TEXT_NAMES: 1447,
    TEXT_DESCRIPTIONS: 2181
};

export const AbilityIconDefinition = {
    ADDRESS: 0x3D4DC,
    ADDRESS_WRITE: 0xFFAA00,
    ADDRESS_MAPPING: 0x100311C,
    COUNT: 260
};

export const CharacterDefinition = {
    ADDRESS: 0xC0F4C,
    BLOCK_SIZE: 180,
    TEXT_NAMES: 131,
    ADDRESS_READ_PSYNERGY: 0xADF02,
    ADDRESS_WRITE_PSYNERGY: 0xFA0130
};

export const ClassDefinition = {
    ADDRESS: 0xC15F4,
    ADDRESS_END: 0xC6604,
    BLOCK_SIZE: 84,
    TEXT_NAMES: 2915
};

export const DjinniDefinition = {
    ADDRESS: 0xC6BB0,
    BLOCK_SIZE: 12,
    TEXT_NAMES: 1747,
    ADDRESS_MAPPING: 0xFA0000
};

export const ElementTableDefinition = {
    ADDRESS: 0xC6684,
    BLOCK_SIZE: 24,
    COUNT: 48
};

export const EncounterTableDefinition = {
    ADDRESS: 0xEDACC,
    BLOCK_SIZE: 28,
    COUNT: 110,
    ADDRESS_MUSIC: 0xEFD1C
}

export const EnemyDefinition = {
    ADDRESS: 0xB9E7C,
    BLOCK_SIZE: 76,
    TEXT_NAMES: 1068,
    ADDRESS_DISPLAY: 0x130D4C
};

export const EnemyGroupDefinition = {
    ADDRESS: 0x12CE7C,
    BLOCK_SIZE: 24,
    COUNT: 660
};

export const ForgeResultDefinition = {
    ADDRESS: 0x10CC34,
    BLOCK_SIZE: 36
};

export const ItemLocationDefinition = {
    ADDRESS: 0xF2204,
    ADDRESS_END: 0xF2E98,
    BLOCK_SIZE: 8,
    ADDRESS_MAPPING_SPECIAL: 0xFA00A0,
    ADDRESS_MAPPING_CHARACTERS: 0xFA0180
};

export const ItemDefinition = {
    ADDRESS: 0xB2364,
    BLOCK_SIZE: 44,
    COUNT: 461,
    TEXT_NAMES: 607,
    TEXT_DESCRIPTIONS: 146
};

export const MapDataDefinition = {
    ADDRESS: 0xF17A8,
    ADDRESS_BATTLE_BG: 0xEF984,
    ADDRESS_ENCOUNTERS: 0xEE6D4,
    ADDRESS_ENCOUNTERS_OVERWORLD: 0xEEDBC,
    ADDRESS_MUSIC: 0xEF094,
    ADDRESS_NAMES: 0xEF4A4
}

export const MusicDefinition = {
    ADDRESS: 0x1C4530,
    BLOCK_SIZE: 8
};

export const ShopDefinition = {
    ADDRESS: 0x10C3F4,
    BLOCK_SIZE: 66,
    COUNT: 32
};

export const SummonDefinition = {
    ADDRESS: 0xC150C,
    BLOCK_SIZE: 8,
    COUNT: 29
};

export const TextDefinition = {
    ADDRESS: 0xA9F54,
    BLOCK_SIZE: 2,
    ADDRESS_TREES: 0x5F914,
    ADDRESS_TREE_OFFSETS: 0x60A4C,
    ADDRESS_TREE_POINTER: 0x60C30,
    ADDRESS_WRITE: 0xFB0000
};