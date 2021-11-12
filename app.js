const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const config = require('./modules/config.js');

const port = config.get("port");
const app = express();

const allowedPermaChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const versionSuffix = "1_1_1";
const versionPretty = "v1.1.1";

console.log("Starting...");
const randomiser = require('./randomiser/randomiser.js');
console.log("Randomiser initialised\n");

if (!fs.existsSync('./output_cache/')) {
    fs.mkdirSync('./output_cache/');
}
if (!fs.existsSync('./permalinks/')) {
    fs.mkdirSync('./permalinks/');
}
if (!fs.existsSync('./temp/')) {
    fs.mkdirSync('./temp/');
}

function parseSettings(str) {
    var array = new Uint8Array(10);
    str = str.padEnd(array.length * 2, '0');

    for (var i = 0; i < array.length; ++i) {
        var byte = str.slice(0, 2);
        array[i] = parseInt(byte, 16);
        str = str.slice(2);
    }

    return array;
}

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

app.get('/randomise_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    var seed = req.query.seed;
    var settings = req.query.settings;
    if (isNaN(Number(seed)) || !settings.match(/^[a-f0-9]+$/i)) {
        res.status(403);
        return res.send();
    }

    var filename = `./output_cache/${seed}-${settings}-${versionSuffix}`;

    fs.readFile(filename + ".ups", (err, data) => {
        if (!err) {
            res.send(data);
        } else {
            try {
                randomiser.randomise(seed, parseSettings(settings), filename + ".log", (patch) => {
                    fs.writeFile(filename + ".ups", patch, (err) => { 
                        if (err) console.log(err); 
                    });
                    res.send(Buffer.from(patch));
                });
            } catch (error) {
                console.log("=== RANDOMISATION ERROR ===");
                console.log(`Parameters: settings=${settings}; seed=${seed}`);
                console.log(error);
            }
        }
    });
});

app.get('/spoiler_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    var seed = req.query.seed;
    var settings = req.query.settings;
    if (isNaN(Number(seed)) || !settings.match(/^[a-f0-9]+$/i)) {
        res.status(403);
        return res.send();
    }

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

app.get('/create_perma_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/json');

    var seed = req.query.seed;
    var settings = req.query.settings;
    if (isNaN(Number(seed)) || !settings.match(/^[a-f0-9]+$/i)) {
        res.status(403);
        return res.send();
    }

    var permalink = generatePermalink();
    var logPath = `./temp/${permalink}.log`;

    try {
        randomiser.randomise(seed, parseSettings(settings), logPath, (patch) => {
            fs.writeFile(`./permalinks/${permalink}.ups`, patch, (err) => { 
                if (err) 
                    console.log(err); 
                else {
                    var meta = `seed=${seed}\nsettings=${settings}\nversion=${versionPretty}\ntime=${new Date().getTime()}`;
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
        console.log(`Parameters: settings=${settings}; seed=${seed}`);
        console.log(error);
    }
});

app.get('/fetch_perma_ajax', (req, res) => {
    if (!req.xhr) return res.redirect('/');
    res.type('application/octet-stream');

    fs.readFile(`./permalinks/${req.query.id}.ups`, (err, data) => {
        if (!err) {
            res.send(data);
        }
    });
});

app.get('/permalink/:id', (req, res) => {
    const { id } = req.params;
    fs.readFile(`./permalinks/${id}.meta`, (err, data) => {
        if (err) {
            res.redirect('/');
        } else {
            var meta = {};
            data.toString().split('\n').forEach((line) => {
                var keyval = line.split('=');
                meta[keyval[0]] = keyval[1];
            });
            res.render('permalink.ejs', {settings: meta.settings, version: meta.version, time: meta.time});
        }
    });
});

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

if (config.get("use-https")) {
    var key = fs.readFileSync(config.get("ssl-key"), 'utf8');
    var cert = fs.readFileSync(config.get("ssl-cert"), 'utf8');

    var server = https.createServer({key: key, cert: cert}, app);
    server.listen(port);
    console.log("Server listening on port " + port);
} else {
    app.listen(port, () => {
        console.log("Server listening on port " + port);
    });
}