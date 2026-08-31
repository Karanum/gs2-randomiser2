import { Element } from "../enums";
import { PsynergyLearnType, PsynergyLineType } from "./enums";

export type PsynergyLine = Readonly<{
    name: string,
    type: PsynergyLineType,
    learning: PsynergyLearnType,
    element: Element,
    progressFactor : number,
    psynergy: [number, number][]
}>;


export const psynergyLines : PsynergyLine[] = [
    {
        name: "Quake",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[3, 2], [4, 4], [5, 14]]
    },
    {
        name: "Spire",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[6, 6], [7, 20], [8, 42]]
    },
    {
        name: "Gaia",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[9, 6], [10, 24], [11, 54]]
    },
    {
        name: "Growth",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[12, 1], [13, 12], [14, 28]]
    },
    {
        name: "Thorn",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[15, 4], [16, 14], [17, 36]]
    },
    {
        name: "Frost",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.5,
        psynergy: [[24, 1], [25, 8], [26, 24]]
    },
    {
        name: "Ice",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[27, 4], [28, 17], [29, 42]]
    },
    {
        name: "Prism",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[30, 6], [31, 22], [32, 52]]
    },
    {
        name: "Douse",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.5,
        psynergy: [[33, 1], [34, 12], [35, 30]]
    },
    {
        name: "Froth",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[36, 2], [37, 14], [38, 40]]
    },
    {
        name: "Cool",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[39, 4], [40, 21], [41, 48]]
    },
    {
        name: "Flare",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[45, 1], [46, 6], [47, 18]]
    },
    {
        name: "Fire",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[48, 4], [49, 14], [50, 36]]
    },
    {
        name: "Volcano",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[51, 8], [52, 22], [53, 48]]
    },
    {
        name: "Blast",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[54, 2], [55, 10], [56, 27]]
    },
    {
        name: "Starburst",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[57, 6], [58, 16], [59, 40]]
    },
    {
        name: "Fume",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[60, 5], [61, 26], [62, 47]]
    },
    {
        name: "Beam",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[63, 7], [64, 21], [65, 41]]
    },
    {
        name: "Bolt",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[66, 1], [67, 6], [68, 22]]
    },
    {
        name: "Ray",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[69, 4], [70, 14], [71, 36]]
    },
    {
        name: "Plasma",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[72, 8], [73, 26], [74, 46]]
    },
    {
        name: "Slash",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[75, 1], [76, 10], [77, 30]]
    },
    {
        name: "Whirlwind",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[78, 1], [79, 18], [80, 44]]
    },
    {
        name: "Aura",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[87, 9], [88, 16], [89, 33]]
    },
    {
        name: "Cure",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[90, 1], [91, 10], [92, 26]]
    },
    {
        name: "Ply",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[93, 1], [94, 16], [95, 34]]
    },
    {
        name: "Wish",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.90,
        psynergy: [[96, 8], [97, 22], [98, 46]]
    },
    {
        name: "Cure Poison",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.25,
        psynergy: [[99, 1], [100, 13]]
    },
    {
        name: "Revive",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[101, 17]]
    },
    {
        name: "Impact",
        type: PsynergyLineType.BUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[102, 1], [103, 21]]
    },
    {
        name: "Dull",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[104, 11], [105, 37]]
    },
    {
        name: "Guard",
        type: PsynergyLineType.BUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[106, 3], [107, 15]]
    },
    {
        name: "Impair",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[108, 9], [109, 23]]
    },
    {
        name: "Ward",
        type: PsynergyLineType.BUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[110, 6], [111, 22]]
    },
    {
        name: "Weaken",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[112, 9], [113, 25]]
    },
    {
        name: "Delude",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.25,
        psynergy: [[116, 1]]
    },
    {
        name: "Sleep",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.25,
        psynergy: [[120, 12]]
    },
    {
        name: "Bind",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[121, 17]]
    },
    {
        name: "Haunt",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[122, 17]]
    },
    {
        name: "Curse",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[123, 20]]
    },
    {
        name: "Condemn",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[124, 29]]
    },
    {
        name: "Drain",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[125, 31]]
    },
    {
        name: "Psy Drain",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[126, 36]]
    },
    {
        name: "Break",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[127, 30]]
    },
    {
        name: "Dragon Cloud",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[160, 12], [205, 12]]
    },
    {
        name: "Demon Night",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[161, 18], [206, 18]]
    },
    {
        name: "Helm Splitter",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[162, 33], [207, 33]]
    },
    {
        name: "Quick Strike",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[163, 40]]
    },
    {
        name: "Rockfall",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[164, 6], [165, 24], [166, 54]]
    },
    {
        name: "Lava Shower",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[167, 8], [168, 22], [169, 48]]
    },
    {
        name: "Demon Spear",
        type: PsynergyLineType.BUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[170, 7], [171, 21]]
    },
    {
        name: "Guardian",
        type: PsynergyLineType.BUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[172, 3], [173, 15]]
    },
    {
        name: "Magic Shell",
        type: PsynergyLineType.BUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[174, 10], [175, 27]]
    },
    {
        name: "Death Plunge",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[176, 12], [204, 12]]
    },
    {
        name: "Shuriken",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[177, 21]]
    },
    {
        name: "Annihilation",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[178, 31]]
    },
    {
        name: "Punji",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.75,
        psynergy: [[179, 4], [180, 15], [181, 36]]
    },
    {
        name: "Fire Bomb",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[182, 6], [183, 16], [184, 40]]
    },
    {
        name: "Gale",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[185, 1], [186, 18], [187, 44]]
    },
    {
        name: "Thunderclap",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.75,
        psynergy: [[188, 8], [189, 26], [190, 50]]
    },
    {
        name: "Mist",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.25,
        psynergy: [[191, 7]]
    },
    {
        name: "Ragnarok",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[192, 13], [198, 13]]
    },
    {
        name: "Cutting Edge",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MERCURY,
        progressFactor: 0.5,
        psynergy: [[193, 11], [200, 11]]
    },
    {
        name: "Heat Wave",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[194, 12], [199, 12]]
    },
    {
        name: "Astral Blast",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[195, 12], [201, 12]]
    },
    {
        name: "Planet Diver",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[196, 13], [202, 13]]
    },
    {
        name: "Diamond Dust",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MERCURY,
        progressFactor: 0.5,
        psynergy: [[197, 12], [203, 12]]
    },
    {
        name: "Sabre Dance",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.25,
        psynergy: [[584, 10]]
    },
    {
        name: "Backstab",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[585, 29]]
    },
    {
        name: "Fire Breath",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.5,
        psynergy: [[586, 22]]
    },
    {
        name: "Juggle",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[587, 5], [588, 17], [589, 37]]
    },
    {
        name: "Flame Card",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.PHYSICAL,
        progressFactor: 0.5,
        psynergy: [[590, 13], [591, 25], [592, 33], [593, 46]]
    },
    {
        name: "Baffle Card",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.PHYSICAL,
        progressFactor: 0.5,
        psynergy: [[594, 3], [595, 8], [596, 15], [597, 27]]
    },
    {
        name: "Whiplash",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[599, 10]]
    },
    {
        name: "Wild Wolf",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.VENUS,
        progressFactor: 0.90,
        psynergy: [[600, 1], [604, 1], [610, 1], [618, 1]]
    },
    {
        name: "Emu",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.JUPITER,
        progressFactor: 0.90,
        psynergy: [[601, 20], [605, 20], [611, 20], [619, 20]]
    },
    {
        name: "Roc",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.PHYSICAL,
        progressFactor: 0.90,
        psynergy: [[602, 45], [606, 45], [612, 45], [620, 45]]
    },
    {
        name: "Salamander",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MARS,
        progressFactor: 0.90,
        psynergy: [[603, 10], [607, 10], [613, 10], [621, 10]]
    },
    {
        name: "Wyvern",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.REPLACE,
        element: Element.PHYSICAL,
        progressFactor: 0.75,
        psynergy: [[608, 32], [614, 32], [622, 32]]
    },
    {
        name: "Pixie",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[609, 7], [615, 7], [623, 7]]
    },
    {
        name: "Elder Wood",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MERCURY,
        progressFactor: 0.90,
        psynergy: [[616, 15], [625, 15]]
    },
    {
        name: "Lich",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.REPLACE,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[617, 28], [627, 28]]
    },
    {
        name: "Succubus",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MERCURY,
        progressFactor: 0.75,
        psynergy: [[624, 24]]
    },
    {
        name: "Manticore",
        type: PsynergyLineType.HEALING,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[626, 38]]
    },
    {
        name: "Call Zombie",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.PHYSICAL,
        progressFactor: 0.75,
        psynergy: [[629, 1], [630, 26], [631, 47]]
    },
    {
        name: "Raging Heat",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.MARS,
        progressFactor: 0.75,
        psynergy: [[632, 9], [633, 22], [634, 53]]
    },
    {
        name: "Poison Flow",
        type: PsynergyLineType.ATTACK,
        learning: PsynergyLearnType.NORMAL,
        element: Element.JUPITER,
        progressFactor: 0.5,
        psynergy: [[635, 33]]
    },
    {
        name: "Fire Puppet",
        type: PsynergyLineType.DEBUFF,
        learning: PsynergyLearnType.NORMAL,
        element: Element.VENUS,
        progressFactor: 0.5,
        psynergy: [[636, 20]]
    }
];


export const psynergyLinesPerElement : PsynergyLine[][] = psynergyLines.reduce((result, line) => {
    result[line.element].push(line);
    return result;
}, [[], [], [], [], []] as PsynergyLine[][]);


export const psynergyLinesPerType : PsynergyLine[][] = psynergyLines.reduce((result, line) => {
    result[line.type].push(line);
    return result;
}, [[], [], [], [], []] as PsynergyLine[][])