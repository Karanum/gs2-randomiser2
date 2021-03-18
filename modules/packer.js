const { crc32 } = require('crc');

const checksumSubtract = 4294967296;

/**
 * 
 * @param {Uint8Array} source
 * @param {Uint8Array} target 
 */
let generatePatch = (source, target) => {
    if (!(target instanceof Uint8Array))
        throw `target must be a Uint8Array, was '${target.constructor.name}'`;

    let sourceLength = source.length;
    let targetLength = target.length;
    let outputLength = Math.max(sourceLength, targetLength);
    let relative = 0;
    let offset = 0;
    let sourceOffset = 0;
    let targetOffset = 0;
    /** @type {number[]} */
    let patch = [];
    writeArray([85, 80, 83, 49], patch, 0);
    writeArray(encode(sourceLength), patch, patch.length);
    writeArray(encode(targetLength), patch, patch.length);

    while (offset < outputLength) {
        let sourceByte = readByte(source, sourceOffset++);
        let targetByte = readByte(target, targetOffset++);
        if (sourceByte == targetByte) {
            ++offset;
            continue;
        }

        writeArray(encode(offset++ - relative), patch, patch.length);
        patch[patch.length] = sourceByte ^ targetByte;
        while (true) {
            if (offset >= outputLength) {
                patch[patch.length] = 0;
                break;
            } else {
                sourceByte = readByte(source, sourceOffset++);
                targetByte = readByte(target, targetOffset++);
                ++offset;
                patch[patch.length] = sourceByte ^ targetByte;
            }

            if (sourceByte == targetByte)
                break;
        }

        relative = offset;
    }

    /** @type {Checksum} */
    let sourceChecksum = crc32(source) - checksumSubtract;
    /** @type {Checksum} */
    let targetChecksum = crc32(target) - checksumSubtract;
    for (let i = 0; i <= 3; ++i)
        patch[patch.length] = (sourceChecksum >> i * 8) & 255;
    for (let i = 0; i <= 3; ++i)
        patch[patch.length] = (targetChecksum >> i * 8) & 255;

    /** @type {Checksum} */
    let patchChecksum = crc32(patch) - checksumSubtract;
    for (let i = 0; i <= 3; ++i)
        patch[patch.length] = (patchChecksum >> i * 8) & 255;
    
    return Uint8Array.from(patch);
};

/**
 * Safely reads a byte from the provided Uint8Array at the provided offset.
 * 
 * When the offset is out of bounds, this function will return 0.
 * @param {Uint8Array} from The Uint8Array to read from
 * @param {number} offset Index of the Uint8Array to read from
 * @returns {Byte}
 */
let readByte = (from, offset) => {
    return (offset < from.length) ? from[offset] : 0;
};

/**
 * Writes the provided byte array to the provided array at the provided offset.
 * @param {Byte[]} from Byte array to read from
 * @param {number[]} to The number array to write to
 * @param {number} offset Index of the array to write to
 * @param {boolean} allowLonger Allow writing past the current length of the array
 */
let writeArray = (from, to, offset, allowLonger = true) => {
    for (let n = 0; n < from.length; ++n) {
        if ((offset + n) < to.length || allowLonger)
            to[offset + n] = from[n];
    }
};

/**
 * Encodes a number (offset) to UPS1 format
 * @param {number} offset Number (offset) to encode
 * @returns {number[]} UPS1 formatted number (offset) as number array
 */
let encode = (offset) => {
    /** @type{number[]} */
    let output = [];
    while (true) {
        let x = offset & 127;
        offset >>= 7;
        if (offset == 0) {
            output[output.length] = 128 | x;
            break;
        } else {
            output[output.length] = x;
            --offset;
        }
    }
    return output;
};


module.exports = {
    generatePatch
};

/** @typedef {number} Byte */
/** @typedef {number} Checksum */
