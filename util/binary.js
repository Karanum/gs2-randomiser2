function write8b(buffer, location, data) {
    buffer[location] = (data & 0xFF);
}

function write16b(buffer, location, data) {
    write8b(buffer, location, data);
    write8b(buffer, location + 1, data >> 8);
}

function write32b(buffer, location, data) {
    write8b(buffer, location, data);
    write8b(buffer, location + 1, data >> 8);
    write8b(buffer, location + 2, data >> 16);
    write8b(buffer, location + 3, data >> 24);
}

function writeArray(buffer, location, data) {
    for (let i = 0; i < data.length; ++i) {
        buffer[location + i] = data[i];
    }
}

function read16b(buffer, location) {
    return buffer[location] + (buffer[location + 1] << 8);
}

function read32b(buffer, location) {
    return buffer[location] + (buffer[location + 1] << 8) + (buffer[location + 2] << 16) + (buffer[location + 3] << 24);
}

module.exports = {write8b, write16b, write32b, writeArray, read16b, read32b};