const express = require('express');
const fs = require('fs');
const https = require('https');
const config = require('./util/config.js');

const port = config.get("port");
const app = express();

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

app.use('/', require('./routers/ajax.js'));
app.use('/', require('./routers/public.js'));

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