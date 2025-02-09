function parse(settings) {
    return {
        'item-shuffle': (settings[0] >> 6),
        'omit': (settings[0] >> 4) & 0b11,
        'gs1-items': (settings[0] >> 3) & 0b1,
        'show-items': (settings[0] >> 2) & 0b1,
        'no-learning': (settings[0] >> 1) & 0b1,
        'class-stats': settings[0] & 0b1,

        'equip-shuffle': settings[1] >> 7,
        'equip-cost': (settings[1] >> 6) & 0b1,
        'equip-stats': (settings[1] >> 5) & 0b1,
        'equip-sort': (settings[1] >> 4) & 0b1,
        'equip-unleash': (settings[1] >> 3) & 0b1,
        'equip-effect': (settings[1] >> 2) & 0b1,
        'equip-curse': (settings[1] >> 1) & 0b1,
        'psynergy-power': settings[1] & 0b1,

        'djinn-shuffle': settings[2] >> 7,
        'djinn-stats': (settings[2] >> 6) & 0b1,
        'djinn-power': (settings[2] >> 5) & 0b1,
        'djinn-aoe': (settings[2] >> 4) & 0b1,
        'djinn-scale': (settings[2] >> 3) & 0b1,
        'summon-cost': (settings[2] >> 2) & 0b1,
        'summon-power': (settings[2] >> 1) & 0b1,
        'summon-sort': settings[2] & 0b1,

        'char-stats': settings[3] >> 6,
        'char-element': (settings[3] >> 4) & 0b11,
        'psynergy-cost': (settings[3] >> 3) & 0b1,
        'psynergy-aoe': (settings[3] >> 2) & 0b1,
        'enemypsy-power': (settings[3] >> 1) & 0b1,
        'enemypsy-aoe': settings[3] & 0b1,

        'class-psynergy': settings[4] >> 5,
        'class-levels': (settings[4] >> 3) & 0b11,
        'qol-cutscenes': (settings[4] >> 2) & 0b1,
        'qol-tickets': (settings[4] >> 1) & 0b1,
        'qol-fastship': settings[4] & 0b1,

        'ship': settings[5] >> 6,
        'skips-basic': (settings[5] >> 5) & 0b1,
        'skips-sq': (settings[5] >> 4) & 0b1,
        'skips-maze': (settings[5] >> 3) & 0b1,
        'boss-logic': (settings[5] >> 2) & 0b1,
        'free-avoid': (settings[5] >> 1) & 0b1,
        'free-retreat': settings[5] & 0b1,

        'adv-equip': settings[6] >> 7,
        'dummy-items': (settings[6] >> 6) & 0b1,
        'skips-sanctum': (settings[6] >> 5) & 0b1,
        'equip-attack': (settings[6] >> 4) & 0b1,
        'qol-hints': (settings[6] >> 3) & 0b1,
        'start-heal': (settings[6] >> 2) & 0b1,
        'start-revive': (settings[6] >> 1) & 0b1,
        'start-reveal': settings[6] & 0b1,

        'scale-exp': settings[7] >> 4,
        'scale-coins': settings[7] & 0b1111,

        'equip-defense': settings[8] >> 7,
        'start-levels': settings[8] & 0b1111111,

        'enemy-eres': settings[9] >> 6,
        'sanc-revive': (settings[9] >> 4) & 0b11,
        'curse-disable': (settings[9] >> 3) & 0b1,
        'avoid-patch': (settings[9] >> 2) & 0b1,
        'skips-wiggle': (settings[9] >> 1) & 0b1,
        'skips-missable': settings[9] & 0b1,

        'hard-mode': (settings[10] >> 7) & 0b1,
        'halve-enc': (settings[10] >> 6) & 0b1,
        'major-shuffle': (settings[10] >> 5) & 0b1,
        'easier-bosses': (settings[10] >> 4) & 0b1,
        'random-puzzles': (settings[10] >> 3) & 0b1,
        'fixed-puzzles': (settings[10] >> 2) & 0b1,
        'manual-rg': (settings[10] >> 1) & 0b1,
        'ship-wings': settings[10] & 0b1,

        'music-shuffle': (settings[11] >> 7) & 0b1,
        'teleport-everywhere': (settings[11] >> 6) & 0b1,
        'force-boss-drops': (settings[11] >> 5) & 0b1,
        'force-superboss-minors': (settings[11] >> 4) & 0b1,
        'anemos-access': (settings[11] >> 2) & 0b11,
        'shuffle-characters': (settings[11] >> 1) & 0b1,
        'skips-oob': settings[11] & 0b1,

        'skips-sand': (settings[12] >> 7) & 0b1,
        'skips-storage': (settings[12] >> 6) & 0b1,
        'remove-mimics': (settings[12] >> 5) & 0b1,
        'shortcut-mars-lighthouse': (settings[12] >> 4) & 0b1
    };
}

module.exports = {parse};