.export data_iconMapping_dynamic

.align 4


@ These are pairs of itemId + mapId of item display objects
@ that should NOT be mapped to whatever the item was randomised to
data_itemMapping_ignoreList:
    .hword #0xF2
    .hword #0x2B
    .hword #0x1C5
    .hword #0x85
    .hword #0x1C6
    .hword #0x83
    .hword #0x1B9
    .hword #0xBC
    .hword #0x41
    .hword #0xF2
    .hword #0x1CC
    .hword #0x10A
    .word #0x0

.align 4


@ List of item IDs that are considered special locations
@ (i.e. don't have a conventional treasure table entry)
@ These are mapped in the exact same order at #0x08FA00A0
data_itemMapping_specialLocations:
    .hword #0xC6
    .hword #0xC7
    .hword #0xD1
    .hword #0xD2
    .hword #0xD7
    .hword #0xDE
    .hword #0xF2
    .hword #0x146
    .hword #0x1C4
    .hword #0x1C5
    .hword #0x1C6
    .hword #0x1C7
    .hword #0x1C9
    .hword #0x1CA
    .hword #0x1CC
    .hword #0xE90
    .hword #0xE8A
    .hword #0xE8B
    .hword #0xE9A
    .hword #0xF16
    .hword #0x1B9
    .hword #0x41
    .hword #0xE8D
    .hword #0xE4E
    .hword #0xE0C
    .hword #0xCE
    .hword #0xCB
    .hword #0xC8
    .hword #0xCF
    .hword #0xC9
    .hword #0xCA
    .hword #0x0

.align 4


@ List of Djinni attributions for character shuffle
ptrList_characterShuffle_djinniList:
    .pointer data_characterShuffle_djinniListEmpty
    .pointer data_characterShuffle_djinniListEmpty
    .pointer data_characterShuffle_djinniList1
    .pointer data_characterShuffle_djinniList2
    .pointer data_characterShuffle_djinniList3
    .pointer data_characterShuffle_djinniList4
    .pointer data_characterShuffle_djinniList5
    .pointer data_characterShuffle_djinniList6

data_characterShuffle_djinniListEmpty:
    .hword #0xFFFF

data_characterShuffle_djinniList1:
    .hword #0x0901
    .hword #0x0A01
    .hword #0xFFFF

data_characterShuffle_djinniList2:
    .hword #0x0000
    .hword #0x0002
    .hword #0x0003
    .hword #0xFFFF

data_characterShuffle_djinniList3:
    .hword #0x0100
    .hword #0x0001
    .hword #0x0102
    .hword #0x0103
    .hword #0xFFFF

data_characterShuffle_djinniList4:
    .hword #0x0101
    .hword #0x0200
    .hword #0x0201
    .hword #0x0202
    .hword #0x0203
    .hword #0xFFFF

data_characterShuffle_djinniList5:
    .hword #0x0300
    .hword #0x0301
    .hword #0x0302
    .hword #0x0303
    .hword #0x0400
    .hword #0x0401
    .hword #0xFFFF

data_characterShuffle_djinniList6:
    .hword #0x0402
    .hword #0x0403
    .hword #0x0500
    .hword #0x0501
    .hword #0x0502
    .hword #0x0503
    .hword #0xFFFF


@ List of itemId -> abilityIconId mappings for randomiser pseudo-items
data_iconMapping:
    .hword #0xF10
    .hword #0xBA
    .hword #0xF11
    .hword #0xC0
    .hword #0xF12
    .hword #0xC4
    .hword #0xF13
    .hword #0xBD
    .hword #0xF14
    .hword #0xC1
    .hword #0xF15
    .hword #0xBB
    .hword #0xF16
    .hword #0xC5
    .hword #0xF17
    .hword #0xBE
    .hword #0xF18
    .hword #0xC2
    .hword #0xF19
    .hword #0xBF
    .hword #0xF1A
    .hword #0xC6
    .hword #0xF1B
    .hword #0xBC
    .hword #0xF1C
    .hword #0xC3
    .hword #0xE0C
    .hword #0xA
    .hword #0xE4E
    .hword #0x3A
    .hword #0xE8A
    .hword #0xA4
    .hword #0xE8B
    .hword #0xA5
    .hword #0xE8D
    .hword #0x60
    .hword #0xE90
    .hword #0x63
    .hword #0xE9A
    .hword #0xA8
    .hword #0xE85
    .hword #0x9F
    .hword #0xE86
    .hword #0xA0
    .hword #0xE8E
    .hword #0x61
    .hword #0xE21
    .hword #0x1C
    .hword #0xE18
    .hword #0x10
    .hword #0xE8F
    .hword #0x62
    .hword #0xE93
    .hword #0x66
    .hword #0xE94
    .hword #0x67
    .hword #0xE87
    .hword #0xA1
    .hword #0xE88
    .hword #0xA2
    .hword #0xE89
    .hword #0xA7
    .hword #0xE97
    .hword #0xA3
    .hword #0xE98
    .hword #0xA9
    .hword #0xE99
    .hword #0xA6
    .hword #0xE9C
    .hword #0xAC
data_iconMapping_dynamic:
    .reserve #0x100