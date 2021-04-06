const sphereRegex = /^\s+([\w']+(?:\s[\w']+)*)\s+(.+)\s-->\s(.+)$/;
const allItemRegex = /^0x([\d\w]+)\s+([\w']+(?:\s[\w']+)*)\s+(.+)\s-->\s(.+)$/;
const locations = {
    "Air's Rock": "#tab-osenia",
    "Alhafra": "#tab-osenia",
    "Alhafran Cave": "#tab-osenia",
    "Anemos Inner Sanctum": "#tab-westsea",
    "Angara Cavern": "#tab-angara",
    "Ankohl Ruins": "#tab-angara",
    "Apojii Islands": "#tab-eastsea",
    "Aqua Rock": "#tab-eastsea",
    "Atteka Cavern": "#tab-westsea",
    "Atteka Inlet": "#tab-westsea",
    "Champa": "#tab-angara",
    "Contigo": "#tab-westsea",
    "Daila": "#tab-indra",
    "Dehkan Plateau": "#tab-indra",
    "E Tundaria Islet": "#tab-eastsea",
    "Gabomba Statue": "#tab-gondowan",
    "Gabomba Catacombs": "#tab-gondowan",
    "Gaia Rock": "#tab-eastsea",
    "Garoh": "#tab-osenia",
    "Gondowan Cliffs": "#tab-indra",
    "Gondowan Settlement": "#tab-gondowan",
    "Hesperia Settlement": "#tab-westsea",
    "Idejima": "#tab-indra",
    "Indra Cavern": "#tab-indra",
    "Islet Cave": "#tab-eastsea",
    "Izumo": "#tab-eastsea",
    "Jupiter Lighthouse": "#tab-westsea",
    "Kandorean Temple": "#tab-indra",
    "Kibombo": "#tab-gondowan",
    "Kibombo Mountains": "#tab-gondowan",
    "Lemuria": "#tab-eastsea",
    "Lemurian Ship": "#tab-indra",
    "Loho": "#tab-angara",
    "Madra": "#tab-indra",
    "Madra Catacombs": "#tab-indra",
    "Magma Rock": "#tab-gondowan",
    "Mikasalla": "#tab-osenia",
    "N Osenia Islet": "#tab-eastsea",
    "Naribwe": "#tab-gondowan",
    "Osenia Cavern": "#tab-osenia",
    "Osenia Cliffs": "#tab-indra",
    "Prox": "#tab-prox",
    "Mars Lighthouse": "#tab-prox",
    "SE Angara Islet": "#tab-eastsea",
    "Sea of Time Islet": "#tab-eastsea",
    "Shaman Village": "#tab-westsea",
    "Shrine of the Sea God": "#tab-indra",
    "SW Atteka Islet": "#tab-westsea",
    "Taopo Swamp": "#tab-osenia",
    "Treasure Isle": "#tab-eastsea",
    "Tundaria Tower": "#tab-angara",
    "W Indra Islet": "#tab-eastsea",
    "Yallam": "#tab-osenia",
    "Yampi Desert": "#tab-osenia",
    "Yampi Desert Cave": "#tab-osenia"
}

var sphereElem;
var zones = {
    "#tab-indra": [],
    "#tab-osenia": [],
    "#tab-gondowan": [],
    "#tab-angara": [],
    "#tab-eastsea": [],
    "#tab-westsea": [],
    "#tab-prox": []
};
var allItems = [];

function insertSorted(arr, n) {
    for (var i = 0; i < arr.length; ++i) {
        if (n[0] < arr[i][0]) {
            arr.splice(i, 0, n);
            return;
        }
    }
    arr.push(n);
}

function showSpoilerLog(logData) {
    var lines = logData.split('\n');
    var linePos = 0, section = '';

    while (linePos < lines.length) {
        var line = lines[linePos++];
        if (line.startsWith('=')) {
            section = line.substr(11, line.length - 22);
            continue;
        }

        if (section == "Spheres") {
            parseSpheresEntry(line);
        } else if (section == "All Items") {
            parseAllItemsEntry(line);
        }
    }

    for (var zone in zones) {
        if (!zones.hasOwnProperty(zone)) continue;
        var elem = $(zone).find("tbody");
        zones[zone].forEach((e) => {
            elem.append(`<tr><td>${e[0]}</td><td>${e[1]}</td><td>${e[2]}</td></tr>`);
        });
    }
}

function parseSpheresEntry(line) {
    if (line.startsWith("Sphere")) {
        sphereElem.append(`<tr class="table-active"><td colspan="3"><b>${line}</b></td></tr>`)
    } else {
        var lineScan = sphereRegex.exec(line);
        if (lineScan && lineScan.length >= 4) {
            var item1 = lineScan[2], item2 = lineScan[3];
            if (item1 == "???") item1 = "(empty)";
            if (item2 == "???") item2 = "(empty)";
            sphereElem.append(`<tr><td>${lineScan[1]}</td><td>${item1}</td><td>${item2}</td></tr>`);
        }
    }
}

function parseAllItemsEntry(line) {
    var lineScan = allItemRegex.exec(line);
    if (lineScan && lineScan.length >= 5) {
        var loc = lineScan[2];
        var item1 = lineScan[3], item2 = lineScan[4];
        if (item1 == "???") item1 = "(empty)";
        if (item2 == "???") item2 = "(empty)";

        if (loc == "Overworld") {
            if (lineScan[1] == "e5b" || lineScan[1] == "e5c") {
                insertSorted(zones["#tab-eastsea"], [loc, item1, item2]);
            } else {
                insertSorted(zones["#tab-westsea"], [loc, item1, item2]);
            }
        } else {
            insertSorted(zones[locations[loc]], [loc, item1, item2]);
        }
        insertSorted(allItems, [loc, item1, item2, (':' + loc + '::' + item1 + '::' + item2 + ':').toLowerCase()]);
    }
}

function searchSpoilerLog(query) {
    var table = $("#tab-search tbody").html('');

    if (query == '') return;
    var splitQuery = query.toLowerCase().split(' ');

    allItems.forEach((e) => {
        for (var i = 0; i < splitQuery.length; ++i) {
            if (!e[3].includes(splitQuery[i])) return;
        }
        table.append(`<tr><td>${e[0]}</td><td>${e[1]}</td><td>${e[2]}</td></tr>`);
    });
}

$(document).ready(() => {
    sphereElem = $("#tab-spheres tbody");
});