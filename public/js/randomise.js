$(document).ready(() => {
    var params = new URLSearchParams(window.location.search);
    var seed = params.get('seed');
    var settings = params.get('settings');

    $("#span-seed").html(seed|| "(Error)");
    $("#span-settings").html(settings || "(Error)");

    if (seed == undefined || settings == undefined) {
        console.error("URL query parameters are incomplete, please go to the previous page and try again.");
        window.location.href = '/';
        return;
    }

    $.get("/randomise_ajax", { seed: seed, settings: settings })
        .done((data) => {
            //console.log("AJAX success: " + JSON.stringify(data));
        })
        .fail((error) => {
            console.log("AJAX error: " + error);
        });
});