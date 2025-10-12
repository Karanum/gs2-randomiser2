/**
 * Represents how an enemy selects an action slot to use.
 */
export enum EnemyAttackPattern {
    RANDOM_EQUAL,
    RANDOM_LINEAR,
    RANDOM_EXPONENTIAL,
    SEQUENTIAL,
    SEQUENTIAL_RANDOM_START,
    ONLY_FIRST_SLOT,
    ALWAYS_DEFEND
}

/**
 * Represents how "smart" the enemy AI acts. Has the following effects:
 * - `LOW` - Does not check for PP or seal status, will ONLY use items on flagged action slots (the slot is skipped entirely if the item has run out), 
 * and is more likely to target characters with low current HP. 
 * - `MEDIUM` - Checks for PP but not seal status, will use items on flagged action slots until it runs out,
 * and is more likely to target characters with low maximum HP.
 * - `HIGH` - Checks for both PP and seal status, will use items on flagged action slots until it runs out,
 * and does not have a targeting preference.
 */
export enum EnemyIQ {
    LOW = 0,
    MEDIUM,
    HIGH
}