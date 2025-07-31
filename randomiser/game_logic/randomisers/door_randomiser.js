const graphology = require('graphology');
const graphData = require('../../../logic_graph.json');

const { BaseRandomiser } = require('./base_randomiser.js');
const itemLocations = require('../../game_data/item_locations.js');

class DoorRandomiser extends BaseRandomiser {

    #graph;
    #openEdges;
    #blockingEdges;

    #oneWayTargets = [];
    #shipTargets = [];
    #deadEnds;

    #djinnCount;

    constructor(prng, settings) {
        super(prng, settings);

        this.#graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
        this.#graph.import(graphData);
        this.#openEdges = [];

        this.#blockingEdges = [];
        this.#djinnCount = 0;

        if (settings['shuffle-characters']) this.#prepCharacterShuffleLocations();
    }

    shuffleItems(instItemLocations) {
        this.itemLocations = instItemLocations;
        if (this.settings['item-shuffle'] == 0) return;

        this.availableItems = itemLocations.getUnlockedItems(this.itemLocations);

        this.#djinnCount = 0;
        this.slotWeights = {};
        Object.keys(this.availableItems).forEach((flag) => { this.slotWeights[flag] = 1 });

        if (!this.settings['major-shuffle'] && this.settings['item-shuffle'] > 0) {
            Object.entries(this.availableItems).forEach(([flag, slot]) => {
                if (slot.id >= 0xFCF && slot.id <= 0xFD8) {
                    this.slotWeights[flag] = 0.25;
                } else if (slot.id >= 0xFB0 && slot.id <= 0xFB5) {
                    this.slotWeights[flag] = 0.75;
                }
            });
        }

        this.#graph.forEachNode((node) => this.#graph.removeNodeAttribute(node, 'seen'));
        this.flagSet = this.getInitialFlagSet();
        this.updateAccessibleItems();

        console.log('fixed fill start:', Object.keys(this.availableItems).length);
        if (this.settings['shuffle-characters']) {
            let flag = `0xd0${Math.floor(this.prng.random() * 8)}`;
            while (flag == '0xd04') flag = `0xd0${Math.floor(this.prng.random() * 8)}`;

            this.fixedFill(this.availableItems[flag], '0xd05');
            this.updateAccessibleItems();
        }

        if (this.settings['start-reveal']) {
            this.fixedFill(this.availableItems['0x8d4'], '0x1');
            this.updateAccessibleItems();
        }

        let keyItems = Object.values(this.availableItems).filter((item) => item.isKeyItem && !item.isSummon);

        console.log('key item fill start:', Object.keys(this.availableItems).length);
        while (keyItems.length > 0) {
            let length = keyItems.length;

            let keyItem = this.#pickBlockingKeyItem(keyItems);
            keyItems = keyItems.filter((item) => item.id != keyItem.id);
            this.weightedFill(keyItem);
            this.updateAccessibleItems();
        }

        console.log('weird item fill start:', Object.keys(this.availableItems).length);
        Object.values(this.availableItems).forEach((item, i) => {
            if (item.isSummon || item.eventType == 0x81 || item.vanillaContents == 0 || item.vanillaContents > 0x8000) {
                this.randomFill(item);
                this.updateAccessibleItems();
            }
        });

        console.log('random fill start:', Object.keys(this.availableItems).length);
        Object.values(this.availableItems).forEach((item) => {
            this.randomFill(item);
            this.updateAccessibleItems();
        });
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

    applyToExits(exitData) {
        for (let i = 0; i < exitData.length; ++i) {
            let exit = exitData[i];
            let edge = this.#graph.findEdge((edge, attr, source, target, sourceAttr, targetAttr, undirected) =>
                attr.shuffle && attr.eventId == exit.eventId && source.split(":")[0] == exit.mapId)
            if (edge) {
                let destination = this.#graph.target(edge).split(':');
                if (destination.length < 2) {
                    console.error('[ERROR] A shuffled edge was connected to a non-entrance node: ', destination);
                    continue;
                }

                exitData[i] = {
                    ...exitData[i],
                    vanillaDestMap: exitData[i].destMap, vanillaDestEntrance: exitData[i].destEntrance,
                    destMap: Number(destination[0]), destEntrance: Number(destination[1])
                }
            }
        }
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
                console.warn('[WARN] Node link (', source, '->', target, ') does not have an inverse but is not marked as one-way');
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

    locHasRestriction(itemLoc, restriction) {
        let node = `0x${itemLoc.id.toString(16).toUpperCase()}`;
        let restrictionList = this.#graph.getNodeAttribute(node, 'restrictions');
        return restrictionList.includes(restriction);
    }

    updateAccessibleItems() {
        let edgeQueue = [...this.#blockingEdges];
        this.#blockingEdges = [];

        let charactersFound = ['Isaac', 'Garet', 'Ivan', 'Mia', 'Jenna', 'Sheba', 'Piers'].filter((char) => this.flagSet.includes(char)).length + 1;
        for (let i = 1; i <= charactersFound; ++i) {
            if (!this.flagSet.includes('pc_' + i)) this.flagSet.push('pc_' + i);
        }

        if (!this.#graph.hasNodeAttribute('9:4', 'seen')) {
            edgeQueue = edgeQueue.concat(this.#graph.outEdges('9:4'));
        }

        while (edgeQueue.length > 0) {
            let edge = edgeQueue.splice(0, 1)[0];
            let targetNode = this.#graph.target(edge);
            if (this.#graph.hasNodeAttribute(targetNode, 'seen')) continue;

            let reqs = this.#graph.getEdgeAttribute(edge, 'requirements');
            if (!this.#checkRequirements(reqs, this.flagSet)) {
                this.#blockingEdges.push(edge);
                continue;
            }

            this.#graph.setNodeAttribute(targetNode, 'seen', true);

            switch (this.#graph.getNodeAttribute(targetNode, 'type')) {
                case 'entrance':
                    edgeQueue = edgeQueue.concat(this.#graph.outEdges(targetNode));
                    break;
                case 'treasure':
                    this.accessibleItems.push(targetNode.toLowerCase());
                    break;
                case 'djinni':
                    this.flagSet.push(`djinn:${++this.#djinnCount}`);
                    edgeQueue = edgeQueue.concat(this.#blockingEdges);
                    this.#blockingEdges = [];
                    break;
                case 'flag':
                    this.flagSet.push(targetNode);
                    edgeQueue = edgeQueue.concat(this.#blockingEdges);
                    this.#blockingEdges = [];
                    break;
            }
        }
    }

    #checkRequirements(requirements, flags) {
        for (let i = 0; i < requirements.length; ++i) {
            if (!flags.includes(requirements[i])) return false;
        }
        return true;
    }

    #pickBlockingKeyItem(availableKeyItems) {
        let edges = [...this.#blockingEdges];
        while (edges.length > 0) {
            let edge = edges.splice(Math.floor(this.prng.random() * edges.length), 1)[0];
            let requirements = this.#graph.getEdgeAttribute(edge, 'requirements');
            requirements = requirements.filter((req) => !this.flagSet.includes(req));

            if (requirements.length == 1) {
                let keyItem = availableKeyItems.find((item) => item.vanillaName == requirements[0]);
                if (keyItem) return keyItem;
            }
        }
        return availableKeyItems[Math.floor(this.prng.random() * availableKeyItems.length)];
    }

    getInitialFlagSet() {
        var set = [];
        if (this.settings['ship'] == 2) set.push('ship');
        if (this.settings['ship-wings']) set.push('ship_wings');

        return set;
    }

    getSpheres(allItems = false) {
        let checkedItems = [];
        let spheres = [];
        this.flagSet = this.getInitialFlagSet();

        this.#graph.forEachNode((node) => this.#graph.removeNodeAttribute(node, 'seen'));
        this.#djinnCount = 0;
        this.#blockingEdges = [];
        this.accessibleItems = [];
        this.updateAccessibleItems();

        while (true) {
            let sphere = [];
            let characterItems = [];

            this.accessibleItems.forEach((slot) => {
                if (checkedItems.includes(slot)) return;
                let item = this.itemLocations[slot][0];

                if (allItems || item.isKeyItem) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    this.flagSet.push(item.name);
                }

                if (item.contents == 0xD00) characterItems.push('0x104');
                else if (item.contents == 0xD01) characterItems.push('0x103');
                else if (item.contents == 0xD02) characterItems.push('0x102');
                else if (item.contents == 0xD03) characterItems.push('0x101');
                else if (item.contents == 0xD06) characterItems = characterItems.concat(['0x2', '0x3']);
                else if (item.contents == 0xD07) characterItems = characterItems.concat(['0x105', '0x106']);
            });

            if (sphere.length == 0) break;
            this.updateAccessibleItems();

            characterItems.forEach((slot) => {
                if (checkedItems.includes(slot) || !this.accessibleItems.includes(slot)) return;
                let item = this.itemLocations[slot][0];

                if (allItems || item.isKeyItem) {
                    sphere.push(slot);
                    checkedItems.push(slot);
                    this.flagSet.push(item.name);
                }
            });

            spheres.push(sphere);
            this.updateAccessibleItems();
        }

        return spheres;
    }

    #prepCharacterShuffleLocations() {
        const djinnMapping = {
            '0x30': 'pc_4', '0x31': 'pc_5', '0x32': 'pc_6', '0x33': 'pc_7', '0x34': 'pc_7', '0x35': 'pc_8', '0x44': 'pc_5', '0x45': 'pc_6', '0x46': 'pc_6',
            '0x47': 'pc_7', '0x48': 'pc_7', '0x49': 'pc_8', '0x4D': 'pc_3', '0x4E': 'pc_3', '0x58': 'pc_4', '0x59': 'pc_5', '0x5A': 'pc_6', '0x5B': 'pc_7',
            '0x5C': 'pc_8', '0x5D': 'pc_8', '0x6C': 'pc_4', '0x6D': 'pc_5', '0x6E': 'pc_6', '0x6F': 'pc_7', '0x70': 'pc_8', '0x71': 'pc_8'
        };

        // Adding character items
        this.#graph.addNode('0xD00', { type: 'treasure', location: 'Contigo', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addNode('0xD01', { type: 'treasure', location: 'Contigo', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addNode('0xD02', { type: 'treasure', location: 'Contigo', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addNode('0xD03', { type: 'treasure', location: 'Contigo', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addNode('0xD05', { type: 'treasure', location: 'Idejima', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addNode('0xD06', { type: 'treasure', location: 'Idejima', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addNode('0xD07', { type: 'treasure', location: 'Kibombo', restrictions: ['no-empty', 'no-mimic'] });
        this.#graph.addEdge('237:4', '0xD00', { shuffle: false, special: [], requirements: ['reunion'] });
        this.#graph.addEdge('237:4', '0xD01', { shuffle: false, special: [], requirements: ['reunion'] });
        this.#graph.addEdge('237:4', '0xD02', { shuffle: false, special: [], requirements: ['reunion'] });
        this.#graph.addEdge('237:4', '0xD03', { shuffle: false, special: [], requirements: ['reunion'] });
        this.#graph.addEdge('9:4', '0xD05', { shuffle: false, special: [], requirements: [] });
        this.#graph.addEdge('9:4', '0xD06', { shuffle: false, special: [], requirements: [] });
        this.#graph.addEdge('111:5', '0xD07', { shuffle: false, special: [], requirements: ['piers'] });

        // Moving starting inventories to Overworld and setting their character requirement
        this.#graph.dropEdge('9:4', '0x2');
        this.#graph.dropEdge('9:4', '0x3');
        this.#graph.dropEdge('237:4', '0x101');
        this.#graph.dropEdge('237:4', '0x102');
        this.#graph.dropEdge('237:4', '0x103');
        this.#graph.dropEdge('237:4', '0x104');
        this.#graph.dropEdge('111:5', '0x105');
        this.#graph.dropEdge('111:5', '0x106');
        this.#graph.addEdge('2:1', '0x2', { shuffle: false, special: [], requirements: ['Sheba'] });
        this.#graph.addEdge('2:1', '0x3', { shuffle: false, special: [], requirements: ['Sheba'] });
        this.#graph.addEdge('2:1', '0x101', { shuffle: false, special: [], requirements: ['Mia'] });
        this.#graph.addEdge('2:1', '0x102', { shuffle: false, special: [], requirements: ['Ivan'] });
        this.#graph.addEdge('2:1', '0x103', { shuffle: false, special: [], requirements: ['Garet'] });
        this.#graph.addEdge('2:1', '0x104', { shuffle: false, special: [], requirements: ['Isaac'] });
        this.#graph.addEdge('2:1', '0x105', { shuffle: false, special: [], requirements: ['Piers'] });
        this.#graph.addEdge('2:1', '0x106', { shuffle: false, special: [], requirements: ['Piers'] });

        // Moving Djinni nodes to Overworld and setting their character requirement
        Object.entries(djinnMapping).forEach(([djinni, req]) => {
            this.#graph.forEachInboundEdge(djinni, (edge) => this.#graph.dropEdge(edge));
            this.#graph.addEdge('2:1', djinni, { shuffle: false, special: [], requirements: [req] });
        });
    }
}

module.exports = { DoorRandomiser };