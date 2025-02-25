const graphology = require('graphology');
const graphData = require('../../../logic_graph.json');

const { ItemRandomiser } = require('./item_randomiser.js');

class DoorRandomiser extends ItemRandomiser {
    #graph;
    #openEdges;

    #oneWayTargets = [];
    #shipTargets = [];
    #numDeadEnds;

    constructor(prng, settings) {
        super(prng, undefined, settings);

        this.#graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
        this.#graph.import(graphData);
        this.#openEdges = [];
    }

    shuffleDoors() {
        this.#unlinkEdges();

        let seenNodes = [];
        let availableTargets = this.#openEdges.map((edge) => edge[1]);
        this.#numDeadEnds = availableTargets.filter((node) => this.#graph.getNodeAttribute(node, 'deadEnd')).length;

        this.#updateSeenNodes(seenNodes, '9:4');

        let debugOffset = 0;

        while (availableTargets.length > 0) {
            let candidateEdges = this.#openEdges.filter((edge) => seenNodes.includes(edge[0]));
            if (candidateEdges.length == 0) {
                console.warn('[ERROR] Out of available edges while available targets remain!');
                break;
            }

            let edgeIndex = Math.floor(this.prng.random() * candidateEdges.length)
            let edge = candidateEdges[edgeIndex];

            let validTargets = availableTargets;
            if (edge[2].special.includes('one-way')) {
                validTargets = validTargets.filter((node) => this.#oneWayTargets.includes(node));
            } else if (edge[2].special.includes('ship')) {
                validTargets = validTargets.filter((node) => this.#shipTargets.includes(node));
            } else {
                validTargets = validTargets.filter((node) => !this.#oneWayTargets.includes(node) && !this.#shipTargets.includes(node));
            }

            if (validTargets.length == 0 || (validTargets.length == 1 && validTargets[0] == edge[0])) {
                console.error('[ERROR] Invalid state where either no targets available or only target is self!');
                console.error('[ERROR] >> Edge:', edge);
                break;
            }

            let attempts = 0;
            let newTarget = validTargets[Math.floor(this.prng.random() * validTargets.length)];
            while (!this.#isTargetNodeValid(edge[0], newTarget, attempts, seenNodes)) {
                ++attempts;
                newTarget = validTargets[Math.floor(this.prng.random() * validTargets.length)];
            }

            this.#relinkEdges(edge[0], newTarget, edge[2]);
            availableTargets = availableTargets.filter((node) => (node != edge[0] && node != newTarget));

            this.#updateSeenNodes(seenNodes, newTarget);
            //console.debug('[DEBUG] Linked nodes:', edge[0], '->', newTarget, `(${this.#openEdges.length}, ${candidateEdges.length}, ${availableTargets.length})`);

            if (this.#openEdges.length + debugOffset != availableTargets.length) {
                console.warn('[WARN] This link has desynchronized the number of nodes:', edge[0], '->', newTarget);
                debugOffset = availableTargets.length - this.#openEdges.length;
            }
        }

        //console.log('[INFO] WAIT HUH WE FINISHED?');
        console.log('[INFO] >> open edges left:', this.#openEdges.length);
        if (this.#openEdges.length > 0 && this.#openEdges.length < 16) console.log(this.#openEdges);
        console.log('[INFO] >> available targets left:', availableTargets.length);
        if (availableTargets.length > 0 && availableTargets.length < 16) console.log(availableTargets);
    }

    #unlinkEdges() {        
        let shuffleableEdges = this.#graph.filterEdges((_, attr) => attr.shuffle == true && !attr.special.includes('broken'));
        shuffleableEdges.forEach((edge) => {
            let source = this.#graph.source(edge);
            let target = this.#graph.target(edge);
            let attr = this.#graph.getEdgeAttributes(edge);

            this.#openEdges.push([source, target, attr]);

            if (!this.#graph.hasEdge(target, source)) {
                this.#oneWayTargets.push(target);
            } else if (attr.special.includes('ship')) {
                this.#shipTargets.push(target);
            }
        });

        shuffleableEdges.forEach((edge) => this.#graph.dropEdge(edge));
    }

    #relinkEdges(source, target, attributes) {
        this.#graph.addEdge(source, target, attributes);
        this.#openEdges = this.#openEdges.filter((edge) => edge[0] != source);

        let inverseEdge = this.#openEdges.find((edge) => edge[0] == target);
        if (!inverseEdge) return;

        this.#graph.addEdge(target, source, inverseEdge[2]);
        this.#openEdges = this.#openEdges.filter((edge) => edge[0] != target);
    }

    #updateSeenNodes(seenNodes, fromNode) {
        let queuedNodes = [fromNode];

        while (queuedNodes.length > 0) {
            let node = queuedNodes.splice(0, 1)[0];
            if (seenNodes.includes(node)) continue;
            seenNodes.push(node);

            this.#graph.forEachOutNeighbor(node, (neighbour) => queuedNodes.push(neighbour));
        }
    }

    #isTargetNodeValid(source, target, attempt, seenNodes) {
        if (target == source) return false;
        if (attempt > 10) return true;

        if (seenNodes.includes(target)) return false;
        if (this.#graph.getNodeAttribute(target, "deadEnd") == true) {
            if (this.#openEdges.length > this.#numDeadEnds) return false;
        }
        return true;
    }
}

// DEBUG
const mersenne = require('../../../modules/mersenne.js');
let prng = mersenne(Math.floor(Math.random() * 999999999));

let debug = new DoorRandomiser(prng);
debug.shuffleDoors();

module.exports = {DoorRandomiser};