const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const config = require('./modules/config.js');

const locales = {
    "en": require('./lang/en_GB.json'),
    "de": require('./lang/de_DE.json'),
    "fr": require('./lang/fr_FR.json'),
    "es": require('./lang/es_ES.json')
};

const port = config.get("port");
const app = express();

const allowedPermaChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const nodePackage = require('./package.json');
const versionSuffix = nodePackage.version.replace(/\./g, '_');

// App initialisation
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

/**
 * Parses the encoded randomiser settings sent by the client
 * @param {string} str 
 * @returns {number[]}
 */
function parseSettings(str) {
    var array = new Uint8Array(11);
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

/**
 * Returns the site language to display based on client preferences
 * @param {Request} req ExpressJS Request object
 * @returns {string} A valid language identifier
 */
function validateLanguage(req) {
    // First check whether a language is specified in the URL
    var lang = req.params.lang;
    if (lang == undefined) {
        // Check the cookie for a previously set language
        var cookie = req.headers.cookie;
        if (cookie != undefined) {
            var cookies = cookie.split(';');
            for (var i = 0; i < cookies.length; ++i) {
                var crumbs = cookies[i].trim().split('=');
                if (crumbs.length >= 2 && crumbs[0] == "lang") {
                    lang = crumbs[1];
                    break;
                }
            }
        }

        // If no language cookie exists, check the Accepts-Languages header
        // Default to "en" if none of the languages are valid
        if (lang == undefined)
            return req.acceptsLanguages("en", "de", "fr", "es") || "en";
    }

    // If a URL language is specified, check if it is valid, otherwise default to "en"
    if (lang == 'es' || lang == 'de' || lang == 'fr')
        return lang;
    return 'en';
}

//=======================================================================================
// AJAX requests (randomisation, spoiler log)
//=======================================================================================

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
                    var version = nodePackage.version;
                    if (!config.get("production"))
                        version += ' (dev-env)';

                    var meta = `settings=${settings}\nversion=v${version}\ntime=${new Date().getTime()}`;
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

//=======================================================================================
// HTTP routing
//=======================================================================================

app.get(['/', '/index.html', '/:lang/index.html'], (req, res) => {
    const lang = validateLanguage(req);
    res.render('index.ejs', {version: nodePackage.version, lang: locales[lang]});
});
app.get(['/changelog.html', '/:lang/changelog.html'], (req, res) => {
    const lang = validateLanguage(req);
    res.render('changelog.ejs', {lang: locales[lang]});
});
//app.get(['/custom.html', '/:lang/custom.html'], (req, res) => {
//    const lang = validateLanguage(req.params.lang);
//    res.render('custom.ejs', {lang: locales[lang]});
//});
app.get(['/help.html', '/:lang/help.html'], (req, res) => {
    const lang = validateLanguage(req);
    res.render('help.ejs', {lang: locales[lang]});
});
app.get(['/randomise.html', '/:lang/randomise.html'], (req, res) => {
    const lang = validateLanguage(req);
    res.render('randomise.ejs', {lang: locales[lang]});
});
app.get(['/randomise_race.html', '/:lang/randomise_race.html'], (req, res) => {
    const lang = validateLanguage(req);
    res.render('randomise_race.ejs', {lang: locales[lang]});
});
app.get(['/tips.html', '/:lang/tips.html'], (req, res) => {
    const lang = validateLanguage(req);
    res.render('tips.ejs', {lang: locales[lang]});
});

app.get(['/permalink/:id', '/:lang/permalink/:id'], (req, res) => {
    const id = req.params.id;
    const lang = validateLanguage(req);
    fs.readFile(`./permalinks/${id}.meta`, (err, data) => {
        if (err) {
            res.redirect('/');
        } else {
            var meta = {};
            data.toString().split('\n').forEach((line) => {
                var keyval = line.split('=');
                meta[keyval[0]] = keyval[1];
            });
            res.render('permalink.ejs', {settings: meta.settings, version: meta.version, time: meta.time, lang: locales[lang]});
        }
    });
});

//=======================================================================================
// Server initialisation
//=======================================================================================

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));

if (config.get("use-https")) {
    var key = fs.readFileSync(config.get("ssl-key"), 'utf8');
    var cert = fs.readFileSync(config.get("ssl-cert"), 'utf8');

    var server = https.createServer({key: key, cert: cert}, app);
    server.listen(port);
    console.log("Server listening for HTTPS on port " + port);
} else {
    app.listen(port, () => {
        console.log("Server listening on port " + port);
    });
}