const fs = require('fs');
const graphology = require('graphology');
const gShortestPath = require('graphology-shortest-path');

const graphData = require('../logic_graph.json');
if (!graphData) {
    console.warn('[WARN] No logic graph found, has it not been generated yet?');
    return 0;
}

const graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
graph.import(graphData);

const locationNames = fs.readdirSync('./randomiser/game_logic/locations_detailed').map((file) => {
    return file.split('.')[0];
});


function validateConnected() {
    let paths = gShortestPath.singleSource(graph, "9:4");
    let connectedNodes = Object.keys(paths);

    console.log(`[INFO] >> connected nodes: ${connectedNodes.length}/${graph.order}`);

    let disconnectedNodes = graph.nodes().filter((node) => !connectedNodes.includes(node));
    if (disconnectedNodes.length > 0) {
        console.error('[ERROR] The logic graph contains disconnected nodes:', disconnectedNodes);
        return false;
    }
    return true;
}

function validateComplete() {
    let missing = [];
    locationNames.forEach((name) => {
        if (!graph.someNode((_, attr) => attr.location == name)) {
            missing.push(name);
        }
    });

    if (missing.length > 0) {
        console.error('[ERROR] Not all locations have been loaded:', missing);
        return false;
    }
    console.log('[INFO] >> all locations have been loaded');
    return true;
}

function validateSourceNodes() {
    let sources = [];
    graph.nodes().forEach((node) => {
        let degree = graph.inDegree(node);
        if (degree == 0 && node != '9:4') sources.push(node);
    });

    if (sources.length > 0) {
        console.error('[ERROR] There are invalid source nodes:', sources);
        return false;
    }
    console.log('[INFO] >> no invalid source nodes');
    return true;
}

function validateSinkNodes() {
    let sinks = [];
    graph.nodes().forEach((node) => {
        let degree = graph.outDegree(node);
        if (degree == 0 && graph.getNodeAttribute(node, 'type') == 'entrance') sinks.push(node);
        if (degree > 0 && graph.getNodeAttribute(node, 'type') != 'entrance') sinks.push(node);
    });

    if (sinks.length > 0) {
        console.error('[ERROR] There are invalid sink nodes:', sinks);
        return false;
    }

    console.log('[INFO] >> no invalid sink nodes');
    return true;
}

function validateAgainstRom() {
    let romFile = "./randomiser/rom/gs2.gba";
    fs.access(romFile, fs.constants.F_OK, (err) => {
        if (err) {
            console.warn('[WARN] ROM does not exist, skipping validating against it.');
            return true
        }
    });

    let mersenne = require('../modules/mersenne.js');
    let prng = mersenne(1);

    let vanillaRom = new Uint8Array(fs.readFileSync(romFile));
    let rom = Uint8Array.from(vanillaRom);
    let mapCode = require('../randomiser/game_logic/map_code.js');
    mapCode.initialise(rom);
    let doors = require('../randomiser/game_data/doors.js');
    doors.initialise(mapCode.clone());

    const { DoorRandomiser } = require('../randomiser/game_logic/randomisers/door_randomiser.js');
    randomiser = new DoorRandomiser(prng, {});
    var exitData = doors.clone()
    randomiser.applyToExits(exitData);

    let badExits = [];

    exitData.forEach((exit) => {
        if (exit.vanillaDestMap == 10 || exit.vanillaDestMap == 139 || exit.vanillaDestMap == 247 || exit.vanillaDestMap == 200 || exit.mapId == 177 || (exit.mapId == 2 && exit.eventId == 27 && exit.vanillaDestMap == 113) || (exit.mapId == 112 && exit.vanillaDestMap == 113) || (exit.mapId == 120 && exit.vanillaDestMap == 114) || (exit.mapId == 123 && exit.vanillaDestMap == 114) || exit.vanillaDestMap == 41 || exit.vanillaDestMap == 43 || (exit.mapId == 84 && ((exit.eventId == 10 && exit.vanillaDestEntrance == 8) || (exit.eventId == 11 && exit.vanillaDestEntrance == 9)) || (exit.vanillaDestMap == 268 && exit.vanillaDestEntrance == 4))) {
            // ignore Daila for now, it's handled explicitly in map_code.js
            // ignore Yallam for now, it's handled explicitly in map_code.js
            // ignore Trial Raod for now
            // ignore Lemuria anchorage for now (conflicting with Atteka Inlet?)
            // ignore Gaia Rock maze for now
            // ignore Kibombo night time for now, from overworld this is probably from some logic for checking conditions and requirements?
            // ignore post Aqua Hydra for now
            // ignore East Indra Shore for now
            // ignore Air's Rock fog room for now preventing going to the next room, some logic for checking conditions and requirements?
            // ignore Overworld to Northern Reaches north exit to blocked by ice entrance for now
        } else if ((exit.vanillaDestMap !== undefined) && (exit.vanillaDestMap != exit.destMap || exit.vanillaDestEntrance != exit.destEntrance)) {
            badExits.push(exit)
        }
    })

    if (badExits.length > 0) {
        let bad = badExits.map((exit) => `${exit.mapId}:${exit.eventId} !-> ${exit.vanillaDestMap}:${exit.vanillaDestEntrance}: ${(exit.addr + 0x8000).toString(16)}`)
        console.error('[ERROR] Bad exits found: ');
        bad = bad.filter(function (item, pos) {
            if (bad.indexOf(item) == pos) {
                console.log(item)
            }
        })

        return false
    }

    return true
}

let valid = true;

console.log('[INFO] Starting graph validation...');
if (!validateConnected()) valid = false;
if (!validateComplete()) valid = false;
if (!validateSourceNodes()) valid = false;
if (!validateSinkNodes()) valid = false;
if (!validateAgainstRom()) valid = false;

if (!valid) {
    console.error('[ERROR] Graph validation failed! One or more tests did not pass!\n');
} else {
    console.log('[INFO] All tests passed!\n');
}