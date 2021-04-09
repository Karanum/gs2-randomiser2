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

function getPresetTooltip(val) {
    switch (Number(val)) {
        case 0: return "Key Items and Djinn shuffled, starting with healing Psynergy and Revive.";
        case 1: return "Most items and Djinn shuffled, with additional shuffling in equipment, class Psynergy and character stats.";
        case 2: return "All items and Djinn shuffled, with superboss tablets being in the item pool. Everything else except AoEs is also shuffled.";
        case 3: return "As close to vanilla as it gets, minus the innate changes applied by the randomiser.";
        case 4: return "A mix of Intermediate and Hard with the Lemurian Ship unlocked from the start. Starting levels are increased to compensate.";
        case 5: return "The same as Easy, but with basic skips required.";
        case 6: return "The same as Intermediate, but with basic skips required.";
        case 7: return "The same as Hard, but with all skips required.";
        case 8: return "Everything is turned on. Good luck.";
    }
    return "?"
}

function getPreset(val) {
    switch (Number(val)) {
        case 0: return [102, 16, 137, 0, 7, 3, 14, 17];
        case 1: return [175, 156, 201, 80, 79, 3, 8, 17];
        case 2: return [159, 255, 239, 170, 151, 3, 8, 17];
        case 3: return [0, 0, 0, 0, 0, 0, 0, 17];
        case 4: return [159, 172, 200, 144, 79, 131, 72, 17];
        case 5: return [102, 16, 137, 0, 7, 34, 14, 17];
        case 6: return [175, 156, 201, 80, 79, 34, 8, 17];
        case 7: return [159, 255, 239, 170, 151, 50, 8, 17];
        case 8: return [207, 255, 255, 175, 151, 186, 72, 17];
    }
    return undefined;
}

function applySettings(arr) {
    if (arr.length != 8) {
        console.error("Settings array is not the correct length.");
        return;
    }
    var arr = arr.slice(0);

    loadValue(loadValue(loadCheckedState(arr[0], ['class-stats', 'no-learning', 'show-items', 'gs1-items']), 
        'omit', 2), 'item-shuffle', 2);
    loadCheckedState(arr[1], ['psynergy-power', 'equip-curse', 'equip-effect',
        'equip-unleash', 'equip-sort', 'equip-stats', 'equip-cost', 'equip-shuffle']);
    loadCheckedState(arr[2], ['summon-sort', 'summon-power', 'summon-cost',
        'djinn-scale', 'djinn-aoe', 'djinn-power', 'djinn-stats', 'djinn-shuffle']);
    loadValue(loadValue(loadCheckedState(arr[3], ['enemypsy-aoe', 'enemypsy-power', 'psynergy-aoe', 'psynergy-cost']),
        'char-element', 2), 'char-stats', 2);
    loadValue(loadValue(loadCheckedState(arr[4], ['qol-fastship', 'qol-tickets', 'qol-cutscenes']),
        'class-levels', 2), 'class-psynergy', 3);
    loadValue(loadCheckedState(arr[5], ['free-retreat', 'free-avoid', 'boss-logic',
        'skips-maze', 'skips-adv', 'skips-basic']), 'ship', 2);
    loadValue(loadCheckedState(arr[6], ['start-reveal', 'start-revive', 'start-heal', 'qol-hints', 'qol-autorun']),
        'start-levels', 3);
    loadValue(loadValue(arr[7], 'scale-coins', 4), 'scale-exp', 4);
}

function getSettingsArray() {
    var arr = new Uint8Array(8);

    arr[0] = appendCheckedState(appendValue(appendValue(0, 'item-shuffle', 2), 'omit', 2),
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
        ['skips-basic', 'skips-adv', 'skips-maze', 'boss-logic', 'free-avoid', 'free-retreat']);
    arr[6] = appendCheckedState(appendValue(0, 'start-levels', 3),
        ['qol-autorun', 'qol-hints', 'start-heal', 'start-revive', 'start-reveal']);
    arr[7] = appendValue(appendValue(0, 'scale-exp', 4), 'scale-coins', 4);

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
        var log = $("#inp-spoiler").prop('checked') ? 1 : 0;
        window.location.href = `/randomise.html?settings=${getSettingsString()}&seed=${seed}&spoiler=${log}`;
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

    $("#inp-preset").on('change', () => {
        var val = $("#inp-preset").val();
        $("#p-preset").html(getPresetTooltip(val));
    });

    $("#btn-preset").on('click', () => {
        var val = $("#inp-preset").val();
        var preset = getPreset(val);
        if (preset != undefined)
            applySettings(preset);
    })

    $("#tooltip-1").attr('title', "Chest and tablet sprites are replaced by the icon of the item inside.");
    $("#tooltip-2").attr('title', "Prevents utility Psynergy (Growth, Frost, etc.) from being learned by classes.");
    $("#tooltip-3").attr('title', "Makes it more likely to find weaker equipment early on.");
    $("#tooltip-4").attr('title', "Adjusts Djinni battle difficulty based on number of owned Djinn.");
    $("#tooltip-5").attr('title', "Makes it more likely to find summons with less Djinn cost early on.");
    $("#tooltip-6").attr('title', "Move clips and basic door warps (mostly from NoS&Q) may be required. Disables 0 PP Retreat setting.");
    $("#tooltip-7").attr('title', "Advanced retreat glitches may be required. Disables 0 PP Retreat setting.");
    $("#tooltip-8").attr('title', "Removes logical Djinn requirements, so you may need to fight bosses early.");
    $("#tooltip-9").attr('title', "Ensures that Cure, Ply, Aura, or Wish is learned from the start.");
    $("#tooltip-10").attr('title', "Note: this prevents the use of Retreat glitches.");
    $("#tooltip-11").attr('title', "Only increases the starting level of characters that start off lower.");

    var tooltipHolders = $(".tooltip-container");
    tooltipHolders.each((i) => new bootstrap.Tooltip(tooltipHolders[i]));

});