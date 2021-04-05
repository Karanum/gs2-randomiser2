var romData, upsData, logData;

function setupLogAjaxRequest(seed, settings) {
    var req = new XMLHttpRequest();
    req.open('GET', `/spoiler_ajax?seed=${seed}&settings=${settings}`, true);
    req.setRequestHeader('X-Requested-With', "XMLHttpRequest");

    req.onload = (e) => {
        logData = req.response;

        var blob = new Blob([logData], { type: 'plain/text' });
        $("#btn-log").attr('href', URL.createObjectURL(blob));
        $("#btn-log").attr('download', `spoiler_${seed}.log`);
        $("#btn-log").prop('disabled', false);

        showSpoilerLog(logData);
    };

    req.send();
}

function setupAjaxRequest(seed, settings, log) {
    var req = new XMLHttpRequest();
    req.open('GET', `/randomise_ajax?seed=${seed}&settings=${settings}`, true);
    req.setRequestHeader('X-Requested-With', "XMLHttpRequest");
    req.responseType = 'arraybuffer';

    req.onload = (e) => {
        upsData = req.response;

        var blob = new Blob([upsData], { type: 'application/octet-stream' });
        $("#btn-ups").attr('href', URL.createObjectURL(blob));
        $("#btn-ups").attr('download', `gs2r_${seed}.ups`);
        $("#btn-ups").prop('disabled', false);
        $("#div-spinner").addClass("d-none");

        if (romData) {
            $("#btn-patch").prop('disabled', false);
            romTooltip.dispose();
        }
        if (log) setupLogAjaxRequest(seed, settings);
    };

    req.send();
}

function prepSpoilerLog() {
    $(".nav-tabs").append('<li class="nav-item"><a class="nav-link active" data-bs-target="#tab-spheres">Progression</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-indra">Indra</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-osenia">Osenia</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-gondowan">Gondowan</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-angara">Angara/Tundaria</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-eastsea">Eastern Sea</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-westsea">Western Sea</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-prox">N. Reaches</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-search">Search</a></li>');
    $(".nav-link").attr('data-bs-toggle', 'tab');
    $(".tab-content").append('<div class="tab-pane fade show active" id="tab-spheres"></div>')
        .append('<div class="tab-pane fade" id="tab-indra"></div>')
        .append('<div class="tab-pane fade" id="tab-osenia"></div>')
        .append('<div class="tab-pane fade" id="tab-gondowan"></div>')
        .append('<div class="tab-pane fade" id="tab-angara"></div>')
        .append('<div class="tab-pane fade" id="tab-eastsea"></div>')
        .append('<div class="tab-pane fade" id="tab-westsea"></div>')
        .append('<div class="tab-pane fade" id="tab-prox"></div>')
        .append('<div class="tab-pane fade" id="tab-search"></div>');
    $("#tab-search").append('<div class="my-3"><input type="text" class="form-control" id="inp-search" placeholder="Search..."/></div>');
    $(".tab-pane").append('<table class="table table-striped"><thead></thead><tbody></tbody></table>');
    $("thead").append('<tr><th scope="col">Location</th><th scope="col">Vanilla</th><th scope="col">Randomised</th></tr>');

    $("#inp-search").on('input', (e) => {
        searchSpoilerLog(e.target.value);
    });
}

$(document).ready(() => {
    var params = new URLSearchParams(window.location.search);
    var seed = params.get('seed');
    var settings = params.get('settings');
    var spoiler = Number(params.get('spoiler')) || false;

    if (seed == undefined || settings == undefined) {
        console.error("URL query parameters are incomplete, please go to the previous page and try again.");
        window.location.href = '/';
        return;
    }

    if (!spoiler) {
        $("#btn-log, #div-log").addClass('d-none');
    } else {
        $("#card-toggle").on('show.bs.collapse', () => {
            $("#caret-log").addClass("rot-180");
        }).on('hide.bs.collapse', () => {
            $("#caret-log").removeClass("rot-180");
        });
        prepSpoilerLog();
    }

    var romTooltip = new bootstrap.Tooltip($("#btn-patch").parent()[0]);

    setupAjaxRequest(seed, settings, spoiler);

    $("#btn-patch").on('click', () => {
        if (!romData || !upsData) return;

        var romCopy = new Uint8Array(romData);
        var patcher = new UPSPatcher(romCopy);
        romCopy = patcher.patchRom(new Uint8Array(upsData), romCopy);

        var blob = new Blob([romCopy], { type: 'application/octet-stream' });

        var downloadAnchor = document.createElement('a');
        downloadAnchor.href = URL.createObjectURL(blob);
        downloadAnchor.download = `gs2r_${seed}.gba`;
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    $("#inp-rom").on('change', () => {
        var files = $("#inp-rom")[0].files;
        if (files.length == 0) return;

        var reader = new FileReader();

        reader.onload = ((e) => {
            $("#err-rom").addClass('d-none');

            var data = new Uint8Array(e.target.result);
            if (data.length < 0x1000000) {
                $("#err-rom").removeClass('d-none');
                $("#err-rom").html("The selected ROM appears to be invalid. Please select another ROM file.");
                return;
            }

            var fingerprint = data[1128] + (data[1129] << 8) + (data[1130] << 16) + (data[1131] << 24);
            if (fingerprint != 0x801319d && fingerprint != 0x8f9ee50) {
                $("#err-rom").removeClass('d-none');
                if (fingerprint == 0x8f9ee50) {
                    $("#err-rom").html("MegaROMs fingerprint found. Please note that this version of the ROM may result in issues.");
                } else {
                    $("#err-rom").html("The selected ROM appears to be invalid. Please select another ROM file.");
                    return;
                }
            }
            romData = data;

            if (upsData) {
                $("#btn-patch").prop('disabled', false);
                romTooltip.dispose();
            }
        });

        reader.readAsArrayBuffer(files[0]);
    });
});