const graphology = require('graphology');

const graphData = require('../logic_graph.json');
if (!graphData) {
    console.warn('[WARN] No logic graph found, has it not been generated yet?');
    return 0;
}

const graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
graph.import(graphData);