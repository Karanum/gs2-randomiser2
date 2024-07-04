const fs = require("fs");
const defaultValues = {
    "use-https": false,
    "ssl-key": "",
    "ssl-cert": "",
    "port": 3000,
    "production": false
};

var config;

function get(key) {
    if (!(key in config))
        return defaultValues[key];
    return config[key];
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