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
function validateLanguage(req, _, next) {
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
        if (lang == undefined) {
            req.mwLang = req.acceptsLanguages("en", "de", "fr", "es") || "en";
            return next();
        }
    }

    // If a URL language is specified, check if it is valid, otherwise default to "en"
    if (lang == 'es' || lang == 'de' || lang == 'fr') {
        req.mwLang = lang;
        return next();
    }
    req.mwLang = 'en';
    return next();
}

//==================================================
// Endpoints
//==================================================

router.get(['/', '/index.html', '/:lang/index.html'], validateLanguage, (req, res) => {
    res.render('index.ejs', {version: nodePackage.version, lang: locales[req.mwLang]});
});
router.get(['/changelog.html', '/:lang/changelog.html'], validateLanguage, (req, res) => {
    res.render('changelog.ejs', {lang: locales[req.mwLang]});
});
//router.get(['/custom.html', '/:lang/custom.html'], validateLanguage, (req, res) => {
//    const lang = validateLanguage(req.params.lang);
//    res.render('custom.ejs', {lang: locales[req.mwLang]});
//});
router.get(['/help.html', '/:lang/help.html'], validateLanguage, (req, res) => {
    res.render('help.ejs', {lang: locales[req.mwLang]});
});
router.get(['/randomise.html', '/:lang/randomise.html'], validateLanguage, (req, res) => {
    res.render('randomise.ejs', {lang: locales[req.mwLang]});
});
router.get(['/randomise_race.html', '/:lang/randomise_race.html'], validateLanguage, (req, res) => {
    res.render('randomise_race.ejs', {lang: locales[req.mwLang]});
});
router.get(['/tips.html', '/:lang/tips.html'], validateLanguage, (req, res) => {
    res.render('tips.ejs', {lang: locales[req.mwLang]});
});

router.get(['/permalink/:id', '/:lang/permalink/:id'], validateLanguage, (req, res) => {
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
            res.render('permalink.ejs', {settings: meta.settings, version: meta.version, time: meta.time, lang: locales[req.mwLang]});
        }
    });
});

module.exports = router;