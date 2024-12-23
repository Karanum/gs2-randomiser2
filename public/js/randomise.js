var romData, upsData, logData;
var patcher = new UPSPatcher();

function saveCachedSetting(elem) {
    if (elem.type == "checkbox") {
        localStorage.setItem(elem.id, elem.checked);
    } else {
        localStorage.setItem(elem.id, elem.value);
    }
}

function loadCachedSetting(elem) {
    var val = localStorage.getItem(elem.id);
    if (val == null) return;

    if (elem.type == "checkbox") {
        $(elem).prop('checked', (val == "true"));
    } else {
        $(elem).val(val);
    }
}

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
        patcher.explodePatch(new Uint8Array(upsData));

        $("#div-spinner").addClass("d-none");

        if (romData) {
            $("#btn-patch").prop('disabled', false);
            var romTooltip = new bootstrap.Tooltip($("#btn-patch").parent()[0]);
            if (romTooltip) romTooltip.dispose();
        }
        if (log) setupLogAjaxRequest(seed, settings);
    };

    req.send();
}

function prepSpoilerLog() {
    $(".card-body .nav-link").attr('data-bs-toggle', 'tab');
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

    if (seed == undefined || settings == undefined) {
        console.error("URL query parameters are incomplete, please go to the previous page and try again.");
        window.location.href = '/';
        return;
    }

    $("#card-toggle").on('show.bs.collapse', () => {
        $("#caret-log").addClass("rot-180");
    }).on('hide.bs.collapse', () => {
        $("#caret-log").removeClass("rot-180");
    });
    prepSpoilerLog();

    var romTooltip = new bootstrap.Tooltip($("#btn-patch").parent()[0]);

    setupAjaxRequest(seed, settings, true);

    $("#btn-patch").on('click', () => {
        if (!romData || !upsData) return;

        if ($("#inp-qol-autorun").prop('checked')) {
            patcher.enableAutoRunPatch();
        } else {
            patcher.disableAutoRunPatch();
        }

        var romCopy = new Uint8Array(romData);
        romCopy = patcher.patchRom(romCopy);

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
            $("#err-megaroms").addClass('d-none');

            romData = undefined;

            var data = new Uint8Array(e.target.result);
            if (data.length < 0x1000000) {
                $("#err-rom").removeClass('d-none');
                return;
            }

            var fingerprint = data[1128] + (data[1129] << 8) + (data[1130] << 16) + (data[1131] << 24);
            if (fingerprint == 0x8f9ee50) {
                $("#err-megaroms").removeClass('d-none');
            } else if (fingerprint != 0x801319d) {
                $("#err-rom").removeClass('d-none');
            } else {
                romData = data;
            }

            if (romData && upsData) {
                $("#btn-patch").prop('disabled', false);
                romTooltip.dispose();
            }
        });

        reader.readAsArrayBuffer(files[0]);
    });

    $(".cache-setting").each((_, elem) => {
        loadCachedSetting(elem);
    }).on('change', (e) => {
        saveCachedSetting(e.target);
    });
});