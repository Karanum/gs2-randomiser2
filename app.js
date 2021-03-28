const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

const versionSuffix = "0_1";

console.log("Starting...");
const randomiser = require('./randomiser/randomiser.js');
console.log("Randomiser initialised\n");

if (!fs.existsSync('./output_cache/')) {
    fs.mkdirSync('./output_cache/');
}

function parseSettings(str) {
    var array = new Uint8Array(8);
    str = str.padEnd(array.length * 2, '0');

    for (var i = 0; i < array.length; ++i) {
        var byte = str.slice(0, 2);
        array[i] = parseInt(byte, 16);
        str = str.slice(2);
    }

    return array;
}

app.get('/randomise_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    var seed = req.query.seed;
    var settings = req.query.settings;
    var filename = `./output_cache/${seed}-${settings}-${versionSuffix}`;

    fs.readFile(filename + ".ups", (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            var patch = randomiser.randomise(seed, parseSettings(settings), filename + ".log");
            fs.writeFile(filename + ".ups", patch, (err) => { 
                if (err) console.log(err); 
            });
            res.send(Buffer.from(patch));
        }
    });
});

app.get('/spoiler_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    var seed = req.query.seed;
    var settings = req.query.settings;
    var filename = `./output_cache/${seed}-${settings}-${versionSuffix}`;

    fs.readFile(filename + ".log", (err, data) => {
        if (err) {
            res.type('application/json');
            res.send({error: "Spoiler log not found"});
        } else {
            res.send(data);
        }
    });
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log("Server listening on port " + port);
});