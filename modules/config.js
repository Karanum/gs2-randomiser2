const fs = require("fs");
const defaultValues = {
    "use-https": false,
    "ssl-key": "",
    "ssl-cert": "",
    "http-port": 3000,
    "https-port": 3001
};

var config;

function get(key) {
    return config[key] || defaultValues[key];
}

function initialise() {
    if (!fs.existsSync("./config.json")) {
        fs.writeFileSync("./config.json", JSON.stringify(defaultValues, null, '\t'));
        config = JSON.parse(JSON.stringify(defaultValues));
    } else {
        config = require("../config.json");
    }
}

initialise();

module.exports = {get};