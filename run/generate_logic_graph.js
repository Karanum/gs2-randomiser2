const fs = require('fs');
const graphology = require('graphology');

const graph = new graphology.MultiDirectedGraph({ allowSelfLoops: false });
const loadedLocations = [];

function loadLocation(name) {
    // Prevent reloading an already loaded location
    if (loadedLocations.includes(name)) return;
    loadedLocations.push(name);

    // Load the corresponding JSON data file
    let path = `../randomiser/game_logic/locations_detailed/${name}.json`;
    let json = require(require.resolve(path));
    if (!json) {
        console.error("[ERROR] Attempted to read non-existent JSON file for location:", name);
        return;
    }
    console.log('[INFO] Loading location:', name);

    // Add the entrance nodes to the logic graph
    json.nodes.entrances.forEach((entr) => {
        let parts = entr.split(';');
        if (graph.hasNode(parts[0])) {
            console.warn("[WARNING] Duplicate node:", entr);
            return;
        }
        graph.addNode(parts[0], { type: 'entrance', location: name, deadEnd: parts.includes('dead-end') });
    });

    // Add the treasure nodes to the logic graph
    json.nodes.treasure.forEach((tr) => {
        let parts = tr.split(';');
        if (graph.hasNode(parts[0])) {
            console.warn("[WARNING] Duplicate node:", tr);
            return;
        }

        let restrictions = [];
        for (let i = 1; i < parts.length; ++i) {
            restrictions.push(parts[i]);
        }
        graph.addNode(parts[0], { type: 'treasure', location: name, restrictions });
    });

    // Add the Djinni nodes to the logic graph
    json.nodes.djinn.forEach((djinni) => {
        if (graph.hasNode(djinni)) {
            console.warn("[WARNING] Duplicate node:", djinni);
            return;
        }
        graph.addNode(djinni, { type: 'djinni', location: name });
    })

    // Add the flag nodes to the logic graph
    json.nodes.flags.forEach((flag) => {
        if (graph.hasNode(flag)) {
            console.warn("[WARNING] Duplicate node:", flag);
            return;
        }
        graph.addNode(flag, { type: 'flag', location: name });
    });

    // Create the internal edge structure
    json.edges.internal.forEach((edge) => {
        let node1 = edge[0], node2 = edge[1], mirror = edge[2], shuffle = edge[3], special = edge[4], requirements = edge[5];

        if (requirements.length > 1) {
            requirements.forEach((reqSet) => {
                let attr = { shuffle, special: special.length > 0 ? special.split(';') : [], requirements: reqSet, overworld: { internal: name == "Overworld", external: name == "Overworld" } };
                graph.addEdge(node1, node2, attr);
                if (mirror) graph.addEdge(node2, node1, attr);
            });
        } else {
            let attr = { shuffle, special: special.length > 0 ? special.split(';') : [], requirements: requirements[0] ?? [], overworld: { internal: name == "Overworld", external: name == "Overworld" } };
            graph.addEdge(node1, node2, attr);
            if (mirror) graph.addEdge(node2, node1, attr);
        }
    });

    // Create the external edge structure and load the corresponding locations
    json.edges.external.forEach((edge) => {
        let intNode = edge[0], extNode = edge[1], extLocation = edge[2], shuffle = edge[3], special = edge[4], requirements = edge[5];

        loadLocation(extLocation);
        if (requirements.length > 1) {
            requirements.forEach((reqSet) => {
                graph.addEdge(intNode, extNode, { shuffle, special: special.length > 0 ? special.split(';') : [], requirements: reqSet, overworld: { internal: name == "Overworld", external: extLocation == "Overworld" } });
            });
        } else {
            graph.addEdge(intNode, extNode, { shuffle, special: special.length > 0 ? special.split(';') : [], requirements: requirements[0] ?? [], overworld: { internal: name == "Overworld", external: extLocation == "Overworld" } });
        }
    });
}

console.log('[INFO] Generating logic graph...');
loadLocation("Idejima");

console.log('[INFO] Graph generated, now writing to file...');
fs.writeFileSync('./logic_graph.json', JSON.stringify(graph.export()));
console.log('[INFO] Done!\n');