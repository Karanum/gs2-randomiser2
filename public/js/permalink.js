var romData, upsData;
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

function setupAjaxRequest(id, log) {
    var req = new XMLHttpRequest();
    req.open('GET', `/fetch_perma_ajax?id=${id}`, true);
    req.setRequestHeader('X-Requested-With', "XMLHttpRequest");
    req.responseType = 'arraybuffer';

    req.onload = (e) => {
        upsData = req.response;
        patcher.explodePatch(new Uint8Array(upsData));

        $("#div-spinner").addClass("d-none");

        if (romData) {
            $("#btn-patch").prop('disabled', false);
            romTooltip.dispose();
        }
    };

    req.send();
}

function prepSpoilerLog() {
    $(".card-body .nav-tabs").append('<li class="nav-item"><a class="nav-link active" data-bs-target="#tab-spheres">Progression</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-indra">Indra</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-osenia">Osenia</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-gondowan">Gondowan</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-angara">Angara/Tundaria</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-eastsea">Eastern Sea</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-westsea">Western Sea</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-prox">N. Reaches</a></li>')
        .append('<li class="nav-item"><a class="nav-link" data-bs-target="#tab-search">Search</a></li>');
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
    var romTooltip = new bootstrap.Tooltip($("#btn-patch").parent()[0]);

    var id = document.location.pathname.slice(11);
    setupAjaxRequest(id, true);

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
        downloadAnchor.download = `gs2r_${id}.gba`;
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
                $("#err-rom").html("The selected ROM appears to be invalid. Please select another ROM file.");
            }
            romData = data;

            if (upsData) {
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