function appendCheckedState(num, arr) {
    arr.forEach ((elem) => { num = (num << 1) + $("#inp-" + elem).prop('checked'); });
    return num;
}

function appendValue(num, elem, size) {
    return (num << size) + ($("#inp-" + elem).val() & ((1 << size) - 1));
}

function appendEmptyBit(num, shift = 1) {
    return (num << shift);
}

function loadCheckedState(num, arr) {
    arr.forEach ((elem) => {
        $("#inp-" + elem).prop('checked', num & 0b1);
        num = num >> 1;
    });
    return num;
}

function loadValue(num, elem, size) {
    $("#inp-" + elem).val(num & ((1 << size) - 1));
    return (num >> size);
}

function loadEmptyBit(num, shift = 1) {
    return (num >> shift);
}

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

function getPreset(val) {
    switch (Number(val)) {
        case 0: return [102, 16, 137, 0, 7, 3, 14, 17, 5, 7, 16];
        case 1: return [175, 156, 201, 80, 79, 3, 72, 17, 5, 7, 0];
        case 2: return [159, 255, 239, 170, 151, 3, 72, 17, 5, 7, 0];
        case 3: return [0, 0, 0, 0, 0, 0, 0, 17, 5, 0, 0];
        case 4: return [159, 172, 200, 144, 79, 131, 200, 17, 18, 7, 0];
        case 5: return [207, 255, 255, 175, 151, 142, 216, 17, 133, 135, 0];
        case 6: return [159, 175, 238, 152, 79, 130, 72, 49, 18, 7, 16];
    }
    return undefined;
}

function applySettings(arr) {
    if (arr.length != 11) {
        console.error("Settings array is not the correct length.");
        return;
    }
    var arr = arr.slice(0);

    var shuffle = loadValue(loadCheckedState(arr[0], ['class-stats', 'no-learning', 'show-items', 'gs1-items']), 'omit', 2);
    loadCheckedState(arr[1], ['psynergy-power', 'equip-curse', 'equip-effect',
        'equip-unleash', 'equip-sort', 'equip-stats', 'equip-cost', 'equip-shuffle']);
    loadCheckedState(arr[2], ['summon-sort', 'summon-power', 'summon-cost',
        'djinn-scale', 'djinn-aoe', 'djinn-power', 'djinn-stats', 'djinn-shuffle']);
    loadValue(loadValue(loadCheckedState(arr[3], ['enemypsy-aoe', 'enemypsy-power', 'psynergy-aoe', 'psynergy-cost']),
        'char-element', 2), 'char-stats', 2);
    loadValue(loadValue(loadCheckedState(arr[4], ['qol-fastship', 'qol-tickets', 'qol-cutscenes']),
        'class-levels', 2), 'class-psynergy', 3);
    loadValue(loadCheckedState(arr[5], ['free-retreat', 'free-avoid', 'boss-logic',
        'skips-maze', 'skips-oob-easy', 'skips-basic']), 'ship', 2);
    loadCheckedState(arr[6], ['start-reveal', 'start-revive', 'start-heal', 'qol-hints', 'equip-attack',
        'skips-oob-hard', 'dummy-items', 'adv-equip']);
    loadValue(loadValue(arr[7], 'scale-coins', 4), 'scale-exp', 4);
    loadCheckedState(loadValue(arr[8], 'start-levels', 7), ['equip-defense']);
    loadValue(loadValue(loadCheckedState(loadEmptyBit(arr[9], 2), ['patch-avoid', 'curse-disable']), 
        'sanc-cost', 2), 'enemy-eres', 2);
    loadCheckedState(loadEmptyBit(loadCheckedState(loadEmptyBit(arr[10], 4), ['easy-boss']), 1), ['halve-enc', 'hard-mode']);

    shuffle += (((arr[10] >> 5) & 0b1) << 3);
    $("#inp-item-shuffle").val(shuffle);
}

function getSettingsArray() {
    var arr = new Uint8Array(11);
    var shuffle = $("#inp-item-shuffle").val();

    arr[0] = appendCheckedState(appendValue(shuffle & 0b11, 'omit', 2),
        ['gs1-items', 'show-items', 'no-learning', 'class-stats']);
    arr[1] = appendCheckedState(0, ['equip-shuffle', 'equip-cost', 'equip-stats',
        'equip-sort', 'equip-unleash', 'equip-effect', 'equip-curse', 'psynergy-power']);
    arr[2] = appendCheckedState(0, ['djinn-shuffle', 'djinn-stats', 'djinn-power',
        'djinn-aoe', 'djinn-scale', 'summon-cost', 'summon-power', 'summon-sort']);
    arr[3] = appendCheckedState(appendValue(appendValue(0, 'char-stats', 2), 'char-element', 2),
        ['psynergy-cost', 'psynergy-aoe', 'enemypsy-power', 'enemypsy-aoe']);
    arr[4] = appendCheckedState(appendValue(appendValue(0, 'class-psynergy', 3), 'class-levels', 2),
        ['qol-cutscenes', 'qol-tickets', 'qol-fastship']);
    arr[5] = appendCheckedState(appendValue(0, 'ship', 2),
        ['skips-basic', 'skips-oob-easy', 'skips-maze', 'boss-logic', 'free-avoid', 'free-retreat']);
    arr[6] = appendCheckedState(0, ['adv-equip', 'dummy-items', 'skips-oob-hard', 'equip-attack',
        'qol-hints', 'start-heal', 'start-revive', 'start-reveal']);
    arr[7] = appendValue(appendValue(0, 'scale-exp', 4), 'scale-coins', 4);
    arr[8] = appendValue(appendCheckedState(0, ['equip-defense']), 'start-levels', 7);
    arr[9] = appendEmptyBit(appendCheckedState(appendValue(appendValue(0, 'enemy-eres', 2), 'sanc-cost', 2), 
        ['curse-disable', 'patch-avoid']), 2);
    arr[10] = appendEmptyBit(appendCheckedState(appendEmptyBit(appendCheckedState(0, ['hard-mode', 'halve-enc']), 1), 
        ['easy-boss']), 4);

    arr[10] += (((shuffle >> 3) & 0b1) << 5);
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
        var preset = getPreset(val);
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