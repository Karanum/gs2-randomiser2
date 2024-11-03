const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const nodePackage = require('./../package.json');
const config = require('./../util/config.js');

const router = express.Router();

const archipelago = require('./../modules/archipelago.js');

const versionSuffix = nodePackage.version.replace(/\./g, '_');
const allowedPermaChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";


// Initialise randomiser
const randomiser = require('./../randomiser/randomiser.js');
console.log("Randomiser initialised\n");


/**
 * Parses the encoded randomiser settings sent by the client
 * @param {string} str 
 * @returns {number[]}
 */
function parseSettings(str) {
    var array = new Uint8Array(12);
    str = str.padEnd(array.length * 2, '0');

    for (var i = 0; i < array.length; ++i) {
        var byte = str.slice(0, 2);
        array[i] = parseInt(byte, 16);
        str = str.slice(2);
    }

    return array;
}

/**
 * Creates a random permalink filename
 * @returns {string}
 */
function generatePermalink() {
    while (true) {
        var link = "";
        while (link.length < 12) {
            var i = Math.floor(Math.random() * allowedPermaChars.length);
            link += allowedPermaChars[i];
        }
        
        if (!fs.existsSync(`./permalinks/${link}.meta`))
            return link;
    }
}

//==================================================
// Middleware
//==================================================
function requireValidParams(req, res, next) {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    res.locals.seed = req.query.seed;
    res.locals.settings = req.query.settings;
    if (isNaN(Number(res.locals.seed)) || !res.locals.settings.match(/^[a-f0-9]+$/i)) {
        res.status(403);
        return res.send();
    }

    res.locals.filename = `./output_cache/${res.locals.seed}-${res.locals.settings}-${versionSuffix}`;
    next();
}

//==================================================
// AJAX endpoint for randomising a normal seed
//==================================================
router.get('/randomise_ajax', requireValidParams, (req, res) => {
    fs.readFile(res.locals.filename + ".ups", (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            try {
                randomiser.randomise(res.locals.seed, parseSettings(res.locals.settings), res.locals.filename + ".log", (patch) => {
                    fs.writeFile(res.locals.filename + ".ups", patch, (err) => { 
                        if (err) console.log(err); 
                    });
                    res.send(Buffer.from(patch));
                });
            } catch (error) {
                console.log("=== RANDOMISATION ERROR ===");
                console.log(`Parameters: settings=${res.locals.settings}; seed=${res.locals.seed}`);
                console.log(error);
            }
        }
    });
});

//==================================================
// AJAX endpoint for fetching the spoiler log
//==================================================
router.get('/spoiler_ajax', requireValidParams, (req, res) => {
    fs.readFile(res.locals.filename + ".log", (err, data) => {
        if (err) {
            res.type('application/json');
            res.send({error: "Spoiler log not found"});
        } else {
            res.send(data);
        }
    });
});

//==================================================
// AJAX endpoint for randomising a permalink seed
//==================================================
router.get('/create_perma_ajax', requireValidParams, (req, res) => {
    res.type('application/json');

    var permalink = generatePermalink();
    var logPath = `./temp/${permalink}.log`;

    try {
        randomiser.randomise(res.locals.seed, parseSettings(res.locals.settings), logPath, (patch) => {
            fs.writeFile(`./permalinks/${permalink}.ups`, patch, (err) => { 
                if (err) 
                    console.log(err); 
                else {
                    var version = nodePackage.version;
                    if (!config.get("production"))
                        version += ' (dev-env)';

                    var meta = `settings=${res.locals.settings}\nversion=v${version}\ntime=${new Date().getTime()}`;
                    fs.writeFile(`./permalinks/${permalink}.meta`, meta, (err) => {
                        if (err) 
                            console.log(err);
                        else {
                            fs.readFile(logPath, (err, data) => {
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.send(permalink + data);
                                    fs.unlink(logPath, (err) => {
                                        if (err) console.log(err)
                                    });
                                }
                            });
                        }
                    });
                }
            }); 
        });
    } catch (error) {
        console.log("=== RANDOMISATION ERROR ===");
        console.log(`Parameters: settings=${res.locals.settings}; seed=${res.locals.seed}`);
        console.log(error);
    }
});

//==================================================
// AJAX endpoint for fetching a permalink UPS file
//==================================================
router.get('/fetch_perma_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    fs.readFile(`./permalinks/${req.query.id}.ups`, (err, data) => {
        if (!err) {
            res.send(data);
        }
    });
});

//==================================================
// AJAX endpoint for loading an Archipelago file
//==================================================
router.post('/import_ap_ajax', bodyParser.raw({ type: 'application/octet-stream' }), (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/json');

    if (req.body.length <= 33) {
        return res.send({ success: false, error: 'invalid-header' })
    }

    try {
        const {seed, settings, userName, itemMap, djinniMap} = archipelago.parseAPFile(req.body);
        randomiser.randomiseArchipelago(seed, settings, userName, itemMap, djinniMap, (patch) => {
            res.send({ success: true, patch: Array.from(patch), seed, userName });
        });
    } catch (error) {
        console.log("=== RANDOMISATION ERROR ===");
        console.log(`[ARCHIPELAGO MODE]`);
        console.log(error);
        res.send({ success: false });
    }
});

module.exports = router;