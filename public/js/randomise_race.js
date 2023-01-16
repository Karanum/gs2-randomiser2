function setupAjaxRequest(seed, settings) {
    var req = new XMLHttpRequest();
    req.open('GET', `/create_perma_ajax?seed=${seed}&settings=${settings}`, true);
    req.setRequestHeader('X-Requested-With', "XMLHttpRequest");
    req.responseType = 'arraybuffer';

    req.onload = (e) => {
        response = req.response;

        var decoder = new TextDecoder();
        var linkId = decoder.decode(response.slice(0, 12));
        var permalink = "https://gs2randomiser.com/permalink/" + linkId;
        var log = response.slice(12);

        var blob = new Blob([log], { type: 'plain/text' });
        $("#btn-log").attr('href', URL.createObjectURL(blob));
        $("#btn-log").attr('download', `spoiler_${linkId}.log`);
        $("#btn-log").prop('disabled', false);

        $("#span-seed").text(seed);
        $("#span-link").html(`<a href="${permalink}">${permalink}</a>`);

        $("#div-spinner").addClass("d-none");
        $("#div-info").removeClass("d-none");

        showSpoilerLog(decoder.decode(log));
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

    setupAjaxRequest(seed, settings);
});