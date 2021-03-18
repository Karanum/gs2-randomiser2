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
        'skips-adv': (settings[5] >> 4) & 0b1,
        'skips-maze': (settings[5] >> 3) & 0b1,
        'boss-logic': (settings[5] >> 2) & 0b1,
        'free-avoid': (settings[5] >> 1) & 0b1,
        'free-retreat': settings[5] & 0b1,

        'start-levels': settings[6] >> 5,
        'start-heal': (settings[6] >> 2) & 0b1,
        'start-revive': (settings[6] >> 1) & 0b1,
        'start-reveal': settings[6] & 0b1,

        'scale-exp': settings[7] >> 4,
        'scale-coins': settings[7] & 0b1111
    };
}

module.exports = {parse};