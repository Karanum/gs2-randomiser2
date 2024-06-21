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

function getPresetTooltip(val) {
    return $("#preset-desc-" + val).text();
}

function applySettings(arr) {
    if (arr.length != 12) {
        console.error("Settings array is not the correct length.");
        return;
    }
    Object.keys(randomiserSettings).forEach((key) => {
        let elem = $(`#inp-${key}`);
        if (!elem) {
            return;
        }

        let entry = randomiserSettings[key];
        let value = (arr[entry[0]] >> entry[1]) & ((1 << entry[2]) - 1);

        if (elem.hasClass('form-check-input')) {
            elem.prop('checked', (value > 0));
        } else {
            for (let i = 3; i < entry.length; ++i) {
                let fragment = entry[i];
                let fragValue = (arr[fragment[0]] >> fragment[1]) & ((1 << fragment[2]) - 1);
                value += (fragValue << fragment[3]);
            }
            elem.val(value);
        }
    });
}

function getSettingsArray() {
    var arr = new Uint8Array(12).fill(0);
    Object.keys(randomiserSettings).forEach((key) => {
        let elem = $(`#inp-${key}`);
        if (!elem) {
            return;
        }

        let entry = randomiserSettings[key];
        if (elem.hasClass('form-check-input')) {
            if (elem.prop('checked')) {
                arr[entry[0]] |= (1 << entry[1]);
            }
        } else {
            let value = elem.val();
            arr[entry[0]] |= (value & ((1 << entry[2]) - 1)) << entry[1];
            for (let i = 3; i < entry.length; ++i) {
                let fragment = entry[i];
                arr[fragment[0]] |= ((value >> fragment[3]) & ((1 << fragment[2]) - 1)) << fragment[1];
            }
        }
    });
    return arr;
}

function getSettingsString() {
    var result = '';
    getSettingsArray().forEach((byte) => { result += byte.toString(16).padStart(2, '0'); });
    return result;
}

function randomiseSeed() {
    var seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    $("#inp-seed").val(seed);
}

$(document).ready(() => {
    randomiseSeed();
    $("#btn-seed").on('click', randomiseSeed);

    $("#inp-seed").on('change', () => {
        var seed = Number($("#inp-seed").val());
        if (seed == '' || isNaN(seed) || seed > Number.MAX_SAFE_INTEGER)
            randomiseSeed();
        else   
            $("#inp-seed").val(seed);
    });

    $("#btn-submit").on('click', () => {
        var seed = $("#inp-seed").val();
        window.location.href = `./randomise.html?settings=${getSettingsString()}&seed=${seed}`;
    });

    $("#btn-submit-race").on('click', () => {
        var seed = $("#inp-seed").val();
        window.location.href = `./randomise_race.html?settings=${getSettingsString()}&seed=${seed}`;
    });

    $("#inp-scale-exp").on('change', () => {
        var val = $("#inp-scale-exp").val();
        val = Math.max(Math.min(val, 15), 1);
        $("#inp-scale-exp").val(val);
    });

    $("#inp-scale-coins").on('change', () => {
        var val = $("#inp-scale-coins").val();
        val = Math.max(Math.min(val, 15), 1);
        $("#inp-scale-coins").val(val);
    });

    $("#inp-start-levels").on('change', () => {
        var val = $("#inp-start-levels").val();
        val = Math.max(Math.min(val, 99), 5);
        $("#inp-start-levels").val(val);
    });

    $("#inp-preset").on('change', () => {
        var val = $("#inp-preset").val();
        $("#p-preset").html(getPresetTooltip(val));
    });

    $("#btn-preset").on('click', () => {
        var val = $("#inp-preset").val();
        var preset = randomiserPresets[Number(val)];
        if (preset != undefined) {
            applySettings(preset);
            $(".cache-setting").each((_, elem) => saveCachedSetting(elem));
        }
    });

    var tooltipHolders = $(".tooltip-container");
    tooltipHolders.each((i) => new bootstrap.Tooltip(tooltipHolders[i]));

    var val = $("#inp-preset").val();
    $("#p-preset").html(getPresetTooltip(val));

    $(".cache-setting").each((_, elem) => loadCachedSetting(elem))
        .on('change', (e) => saveCachedSetting(e.target));
});