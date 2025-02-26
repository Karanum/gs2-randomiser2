const graphology = require('graphology');
const graphData = require('../../../logic_graph.json');

const { ItemRandomiser } = require('./item_randomiser.js');

class DoorRandomiser extends ItemRandomiser {
    #graph;
    #openEdges;

    #oneWayTargets = [];
    #shipTargets = [];
    #deadEnds;

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
        this.#deadEnds = availableTargets.filter((node) => this.#graph.getNodeAttribute(node, 'deadEnd'));

        this.#updateSeenNodes(seenNodes, '9:4');

        while (availableTargets.length > 0) {
            let candidateEdges = this.#openEdges.filter((edge) => seenNodes.includes(edge[0]));

            // TODO: Remove error checks once this is shown to work consistently
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

            // TODO: Remove error checks once this is shown to work consistently
            if (validTargets.length == 0 || (validTargets.length == 1 && validTargets[0] == edge[0])) {
                console.error('[ERROR] Invalid state where either no targets available or only target is self!');
                console.error('[ERROR] >> Edge:', edge);
                break;
            }

            let targets = validTargets.filter((node) => !this.#deadEnds.includes(node) && !seenNodes.includes(node) && node != edge[0]);
            if (targets.length == 0) targets = validTargets.filter((node) => !seenNodes.includes(node) && node != edge[0]);
            if (targets.length == 0) targets = validTargets;

            let newTarget = targets[Math.floor(this.prng.random() * targets.length)];
            while (edge[0] == newTarget && targets.length > 1) {
                newTarget = targets[Math.floor(this.prng.random() * targets.length)];
            }

            this.#relinkEdges(edge[0], newTarget, edge[2]);
            availableTargets = availableTargets.filter((node) => (node != edge[0] && node != newTarget));

            this.#updateSeenNodes(seenNodes, newTarget);

            // TODO: Remove debug info once door rando is fully functional
            console.debug('[DEBUG] Linked nodes:', edge[0], '->', newTarget, `(${this.#openEdges.length}, ${candidateEdges.length}, ${availableTargets.length})`);
        }

        // TODO: Remove debug info once door rando is fully functional
        console.log('[INFO] >> open edges left:', this.#openEdges.length);
        if (this.#openEdges.length > 0 && this.#openEdges.length < 50) console.log(this.#openEdges);
        console.log('[INFO] >> available targets left:', availableTargets.length);
        if (availableTargets.length > 0 && availableTargets.length < 50) console.log(availableTargets);
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
        if (!inverseEdge) {
            if (!attributes.special.includes('one-way')) {
                console.log('[WARN] Node link (', source, '->', target, ') does not have an inverse but is not marked as one-way');
            }
            return;
        }

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
}

module.exports = {DoorRandomiser};