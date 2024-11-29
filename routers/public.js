const express = require('express');
const fs = require('fs');
const nodePackage = require('./../package.json');

const locales = {
    "en": require('./../lang/en_GB.json'),
    "de": require('./../lang/de_DE.json'),
    "fr": require('./../lang/fr_FR.json'),
    "es": require('./../lang/es_ES.json')
};

const router = express.Router();

/**
 * Sets the site language to display based on client preferences
 * in the ExpressJS Request object
 */
router.use((req, res, next) => {
    // First check whether a language is specified in the URL
    var lang = req.params.lang;
    if (lang == undefined) {
        // Check the cookie for a previously set language
        var cookies = (req.headers.cookie ?? '').split(';');
        for (var i = 0; i < cookies.length; ++i) {
            var crumbs = cookies[i].trim().split('=');
            if (crumbs.length >= 2 && crumbs[0] == "lang") {
                lang = crumbs[1];
                break;
            }
        }

        // If no language cookie exists, check the Accepts-Languages header
        // Default to "en" if none of the languages are valid
        if (lang == undefined) {
            res.locals.lang = locales[req.acceptsLanguages("en", "de", "fr", "es") || "en"];
            return next();
        }
    }

    // If a URL language is specified, check if it is valid, otherwise default to "en"
    if (lang == 'es' || lang == 'de' || lang == 'fr') {
        res.locals.lang = locales[lang];
        return next();
    }
    res.locals.lang = locales['en'];
    return next();
});

//==================================================
// Endpoints
//==================================================

router.get(['/', '/index.html', '/:lang/index.html'], (_, res) => {
    res.render('index.ejs', {version: nodePackage.version});
});

router.get(['/changelog.html', '/:lang/changelog.html'], (_, res) => {
    res.render('changelog.ejs');
});

// router.get(['/custom.html', '/:lang/custom.html'], (_, res) => {
//    res.render('custom.ejs');
// });

router.get(['/help.html', '/:lang/help.html'], (_, res) => {
    res.render('help.ejs');
});

router.get(['/randomise.html', '/:lang/randomise.html'], (_, res) => {
    res.render('randomise.ejs');
});

router.get(['/randomise_race.html', '/:lang/randomise_race.html'], (_, res) => {
    res.render('randomise_race.ejs');
});

router.get(['/tips.html', '/:lang/tips.html'], (_, res) => {
    res.render('tips.ejs');
});

router.get(['/permalink/:id', '/:lang/permalink/:id'], (req, res) => {
    const id = req.params.id;
    fs.readFile(`./permalinks/${id}.meta`, (err, data) => {
        if (err) {
            res.redirect('/');
        } else {
            var meta = {};
            data.toString().split('\n').forEach((line) => {
                var keyval = line.split('=');
                meta[keyval[0]] = keyval[1];
            });
            res.render('permalink.ejs', meta);
        }
    });
});

module.exports = router;