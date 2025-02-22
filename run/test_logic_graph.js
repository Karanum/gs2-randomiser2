const graphology = require('graphology');

const graphData = require('../logic_graph.json');
if (!graphData) {
    console.warn('[WARN] No logic graph found, has it not been generated yet?');
    return 0;
}

const graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
graph.import(graphData);

const startingDjinn = 0;
const startingFlags = ["Whirlwind", "Mind Read", "Growth", "Shaman's Rod"];
const testGoals = [
    ["lash_pebble", "0x84A", ["Lash Pebble"]],
    ["pound_cube", "0x878", ["Pound Cube"]],
    ["scoop_gem", "0x88C", ["Scoop Gem"]],
    ["reveal", "0x8D4", ["Reveal"]],
    ["catacombs_1", "0xF16", ["Tremor Bit"]],
    ["catacombs_2", "0xF15", ["Ruin Key"]],
    ["kibombo_piers", "piers", ["Douse Drop", "Frost Jewel"]],
    ["gabomba", "0x8FF", ["Black Crystal"]],
    ["healing_fungus", "0xF40", ["Healing Fungus"]],
    ["mayor's_gift", "0x918", ["Cyclone Chip"]],
    ["sea_god's_tear", "0xA20", ["Sea God's Tear"]],
    ["sotsg_prong", "0x8C7", ["Right Prong"]],
    ["gaia_rock_1", "0xF74", ["Dancing Idol"]],
    ["gaia_rock_2", "0x9BA", ["Sand"]],
    ["ankohl_prong", "0xF80", ["Left Prong"]],
    ["aqua_rock_1", "0xF6E", ["Aquarius Stone"]],
    ["aqua_rock_2", "0x9AE", ["Parch"]],
    ["burst", "0x949", ["Burst Brooch"]],
    ["tundaria_prong", "0x945", ["Center Prong"]],
    ["trident", "0x978", ["Trident"]],
    ["grind", "0xF67", ["Grindstone", "Lucky Medal"]],
    ["trial_road", "0x94D", ["Hover Jade"]],
    ["jupiter_lh_1", "0xFE7", ["Red Key"]],
    ["jupiter_lh_2", "0xFE8", ["Blue Key"]],
    ["reunion", "reunion", ["Orb of Force", "Lifting Gem", "Carry Stone", "Mars Star"]],
    ["magma_rock_1", "0x9FA", ["Blaze"]],
    ["magma_rock_2", "0x9F9", ["Magma Ball"]],
    ["teleport", "0xFFE", ["Teleport Lapis"]],
    ["victory", "boss_parents", []],

    ["trading_quest_1", "0xAA2", ["Pretty Stone"]],
    ["trading_quest_2", "0xAA4", ["Red Cloth"]],
    ["trading_quest_3", "0xAA3", ["Milk"]],
    ["trading_quest_4", "0xAA1", ["Li'l Turtle"]],

    ["summon_zagan", "0x10", []],
    ["summon_megaera", "0x11", []],
    ["summon_flora", "0x12", []],
    ["summon_moloch", "0x13", []],
    ["summon_ulysses", "0x14", []],
    ["summon_haures", "0x15", []],
    ["summon_eclipse", "0x90B", []],
    ["summon_coatlicue", "0x17", []],
    ["summon_daedalus", "0x18", []],
    ["summon_azul", "0x19", []],
    ["summon_catastrophe", "0x1A", []],
    ["summon_charon", "0x1B", []],
    ["summon_iris", "0x1C", []]
];


function prepareGraph() {
    testGoals.forEach((goal) => {
        graph.mergeNode(goal[1], { goal: goal[0], goal_rewards: goal[2] });
    });

    graph.dropEdge("40:1", "234:4");
    graph.addEdge("2:7", "40:1", { shuffle: true, special: "debug", requirements: ["mayors_gift_trigger"] });
}

function runTest() {
    graph.setNodeAttribute('9:4', 'seen', true);
    let openEdges = graph.outEdges('9:4');
    let blockedEdges = [];

    let steps = 0;
    let nodesSeen = 1;
    let goalsSeen = [];

    let djinn = startingDjinn;
    let flags = [...startingFlags];

    while (openEdges.length > 0) {
        let edge = openEdges.splice(0, 1)[0];
        ++steps;

        let targetNode = graph.target(edge);
        if (graph.hasNodeAttribute(targetNode, 'seen')) continue;

        let attr = graph.getEdgeAttributes(edge);
        let reqs = attr.requirements;
        if (!checkRequirements(reqs, flags, djinn)) {
            blockedEdges.push(edge);
            continue;
        }

        ++nodesSeen;
        graph.setNodeAttribute(targetNode, 'seen', true);

        switch (graph.getNodeAttribute(targetNode, 'type')) {
            case 'entrance':
                openEdges = openEdges.concat(graph.outEdges(targetNode));
                break;
            case 'djinni':
                ++djinn;
                flags.push(`djinn:${djinn}`);
                openEdges = openEdges.concat(blockedEdges);
                blockedEdges = [];
                break;
            case 'flag':
                flags.push(targetNode);
                openEdges = openEdges.concat(blockedEdges);
                blockedEdges = [];
                break;
        }

        if (graph.hasNodeAttribute(targetNode, 'goal')) {
            let goal = graph.getNodeAttribute(targetNode, 'goal');
            let rewards = graph.getNodeAttribute(targetNode, 'goal_rewards');

            console.log(`[INFO] >> reached goal '${goal}' at ${steps} steps and ${nodesSeen} nodes`);

            goalsSeen.push(goal);
            if (rewards.length > 0) {
                flags = flags.concat(rewards);
                openEdges = openEdges.concat(blockedEdges);
                blockedEdges = [];
            }
        }
    }

    console.log('[INFO] Test has concluded with the following status:');
    console.log(`[INFO] >> ${steps} steps taken`);
    console.log(`[INFO] >> ${nodesSeen} out of ${graph.order} nodes seen`);
    if (nodesSeen != graph.order) {
        console.log('[WARN] Not all nodes have been reached!', graph.filterNodes((_, attr) => !attr.seen));
    }
    console.log(`[INFO] >> ${goalsSeen.length} out of ${testGoals.length} goal nodes reached`);
    if (goalsSeen.length < testGoals.length) {
        console.log('[ERROR] Not all goals have been reached!', testGoals.filter((goal) => !goalsSeen.includes(goal[0])).map((goal) => goal[0]));
        console.log('[INFO] >> test failed with following flags:', flags);
    }
}

function checkRequirements(requirements, flags) {
    for (let i = 0; i < requirements.length; ++i) {
        if (!flags.includes(requirements[i])) return false;
    }
    return true;
}


console.log('[INFO] Starting graph logic test...');
let startTime = Date.now();

prepareGraph();
runTest();

let endTime = Date.now();
console.log('[INFO] Test finished in', endTime - startTime, 'ms');