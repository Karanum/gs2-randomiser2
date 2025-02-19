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
        if (!graph.someNode((_, attr) => attr.location == name )) {
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


let valid = true;

console.log('[INFO] Starting graph validation...');
if (!validateConnected()) valid = false;
if (!validateComplete()) valid = false;
if (!validateSourceNodes()) valid = false;
if (!validateSinkNodes()) valid = false;

if (!valid) {
    console.error('[ERROR] Graph validation failed! One or more tests did not pass!\n');
} else {
    console.log('[INFO] All tests passed!\n');
}