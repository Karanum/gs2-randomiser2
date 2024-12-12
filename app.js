const express = require('express');
const fs = require('fs');
const https = require('https');
const config = require('./util/config.js');
const { randomInt } = require('node:crypto');

const port = config.get("port");
const app = express();

// The settings array to use for the analysis
// Open the developer console on the randomiser website and run 'getSettingsArray()' to get this array
const settings = [143, 174, 220, 144, 143, 131, 88, 17, 146, 132, 19, 210, 0];

// The number of simulations to run for the analysis
const numSeeds = 10000;

// The maximum random seed jump between simulations
const seedJump = 100000;

// The list of items to check for in the analysis
const itemNames = ['Isaac', 'Garet', 'Ivan', 'Mia', 'Jenna', 'Sheba', 'Piers', 'Zagan', 'Megaera', 'Flora', 'Moloch', 'Ulysses', 'Haures', 'Eclipse', 
    'Coatlicue', 'Daedalus', 'Azul', 'Catastrophe', 'Charon', 'Iris', 'Whirlwind', 'Growth', 'Mind Read', 'Lash Pebble', 'Pound Cube', 'Tremor Bit', 
    'Scoop Gem', 'Reveal', 'Frost Jewel', 'Douse Drop', 'Cyclone Chip', 'Parch', 'Sand', 'Grindstone', 'Hover Jade', 'Blaze', 'Burst Brooch', 
    'Teleport Lapis', 'Lifting Gem', 'Orb of Force', 'Carry Stone', 'Shaman\'s Rod', 'Sea God\'s Tear', 'Black Crystal', 'Aquarius Stone', 'Dancing Idol', 
    'Magma Ball', 'Mars Star', 'Ruin Key', 'Red Key', 'Blue Key', 'Left Prong', 'Center Prong', 'Right Prong', 'Trident', 'Healing Fungus', 'Pretty Stone', 
    'Red Cloth', 'Milk', 'Li\'l Turtle'];

// App initialisation
console.log("Starting...");

if (!fs.existsSync('./output_cache/')) {
    fs.mkdirSync('./output_cache/');
}
if (!fs.existsSync('./permalinks/')) {
    fs.mkdirSync('./permalinks/');
}
if (!fs.existsSync('./temp/')) {
    fs.mkdirSync('./temp/');
}


//=======================================================================================
// Router initialisation
//=======================================================================================

// app.use('/', require('./routers/ajax.js'));
// app.use('/', require('./routers/public.js'));

if (!fs.existsSync('./analysis/')) {
    fs.mkdirSync('./analysis/');
}

// Initialise randomiser
const randomiser = require('./randomiser/randomiser.js');
console.log("Randomiser initialised\n");

let seed = 100000000000 + randomInt(800000000000);
console.log('=== Analysis ===');

let output = 'Seed;Spheres;' + itemNames.join(';') + '\n';
let startTime = Date.now();

for (let i = 0; i < numSeeds; ++i) {
    console.log(`N = (${i}/${numSeeds}), Seed = ${seed}`);
    output += seed.toString() + ';';

    let run = randomiser.randomise(seed, settings);
    output += run.spheres + ';';

    output += itemNames.map((item) => run.items[item]).join(';') + '\n';
    seed += randomInt(1, seedJump);
}

let endTime = Date.now();
console.log(`Finished in ${Math.ceil((endTime - startTime) / 1000)} seconds`);

fs.writeFileSync(`./analysis/output_${Date.now()}.csv`, output);

// randomiser.randomise(seed, settings, '', (items) => {
//     console.log(Object.keys(items.items));
// })

//=======================================================================================
// Server initialisation
//=======================================================================================

// app.disable('x-powered-by');
// app.set('view engine', 'ejs');
// app.set('views', './views');
// app.use(express.static('public'));

// if (config.get("use-https")) {
//     var key = fs.readFileSync(config.get("ssl-key"), 'utf8');
//     var cert = fs.readFileSync(config.get("ssl-cert"), 'utf8');

//     var server = https.createServer({key: key, cert: cert}, app);
//     server.listen(port);
//     console.log("Server listening for HTTPS on port " + port);
// } else {
//     app.listen(port, () => {
//         console.log("Server listening on port " + port);
//     });
// }