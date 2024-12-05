function parseAPFile(buffer) {
    let arr = new Uint8Array(buffer);

    // Version check
    let version = arr[0];
    if (version != 1) {
        return;
    }

    // Extract static header fields
    let seed = arr.slice(1, 17);
    let settings = arr.slice(17, 33);
    let pos = 33;

    // Extract user name
    let userName = '';
    while (pos < arr.length) {
        let byte = arr[pos++];
        if (byte == 0xA || byte == 0x0) break;
        userName += String.fromCharCode(byte);
    }

    // Extract item data
    let itemMap = {};
    let valid = false;
    while (pos < arr.length - 3) {
        let location = arr[pos++] + (arr[pos++] << 8);
        let item = arr[pos++] + (arr[pos++] << 8);
        if (location == 0xFFFF && item == 0xFFFF) {
            valid = true;
            break;
        }
        itemMap['0x' + location.toString('16')] = item;
    }
    if (!valid) return {};

    // Extract djinni data
    let djinniMap = {};
    while (pos < arr.length - 1) {
        let location = arr[pos++];
        let djinni = arr[pos++];
        if (location == 0xFF && djinni == 0xFF) break;
        djinniMap['0x' + location.toString('16')] = djinni;
    }

    // Get character level scaling
    let startingLevels = [0, 0, 0, 0, 0, 0, 0, 0];
    while (pos < arr.length - 1) {
        let char = arr[pos++];
        let level = arr[pos++];
        if (char == 0xFF) break;
        if (char >= 8) continue;
        startingLevels[char] = level;
    }

    return {seed, settings, userName, itemMap, djinniMap, startingLevels};
}

module.exports = {parseAPFile};