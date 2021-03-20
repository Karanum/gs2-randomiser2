var romData, upsData, logData;

function setupAjaxRequest(seed, settings) {
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
    };

    req.send();
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

    var romTooltip = new bootstrap.Tooltip($("#btn-patch").parent()[0], {animation: false});

    setupAjaxRequest(seed, settings);

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