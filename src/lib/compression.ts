import { BinaryView } from "../randomiser/binary_view";

/**
 * Decompresses binary data using compression format 0.
 */
function decompressFormat0(src : BinaryView, srcPos : number) : BinaryView
{
    const dest : number[] = [];
    
    let destPos = 0, bitNum = 0, byte = 0, readCount = 0;
    let bits = src.readHalfword(srcPos);
    srcPos += 2;

    while (true) {
        readCount = 0;

        // Check decompression control patterns
        if ((bits & 0b1) == 1) {
            dest[destPos++] = ((bits >> 1) & 0xFF);
            bits >>= 9;
            bitNum -= 9;
        } else if ((bits & 3) == 0) {
            readCount = 2;
            bits >>= 2;
            bitNum -= 2;
        } else if ((bits & 7) == 2) {
            readCount = 3;
            bits >>= 3;
            bitNum -= 3;
        } else if ((bits & 0xF) == 6) {
            readCount = 4;
            bits >>= 4;
            bitNum -= 4;
        } else if ((bits & 0x1F) == 0xE) {
            readCount = 5;
            bits >>= 5;
            bitNum -= 5;
        } else if ((bits & 0x7F) == 0x1E) {
            readCount = 6;
            bits >>= 6;
            bitNum -= 6;
        } else if ((bits & 0x7F) == 0x5E) {
            readCount = 7;
            bits >>= 7;
            bitNum -= 7;
        } else if ((bits & 0x3F) == 0x3E) {
            readCount = 7 + ((bits >> 6) & 3);
            bits >>= 8;
            bitNum -= 8;
            if (readCount == 7) {
                readCount = 10 + (bits & 0x7F);
                bits >>= 7;
                bitNum -= 7;
                if (readCount == 10) {
                    return new BinaryView(dest);
                }
            } 
        }

        // Replenish the reading bits
        if (bitNum < 0) {
            bitNum += 16;
            bits += (src.readHalfword(srcPos) << bitNum);
            srcPos += 2;
        }

        // Read compressed data
        if (readCount != 0) {
            let offset = 0;

            if ((bits & 1) == 0) {
                bits >>= 1;
                --bitNum;

                offset = ((destPos - 33) >>> 0);
                byte = Math.min(0xC, Math.ceil(Math.log2(offset)));

                offset = ((32 + (bits & ((1 << byte) - 1))) >>> 0);
                bits >>= byte;
                bitNum -= byte;
            } else {
                offset = (((bits >> 1) & 31) >>> 0);
                bits >>= 6;
                bitNum -= 6
            }

            if (bitNum < 0) {
                bitNum += 16;
                bits += (src.readHalfword(srcPos) << bitNum);
                srcPos += 2;
            }

            while (readCount-- > 0) {
                dest[destPos] = dest[destPos - offset - 1];
                ++destPos;
            }
        }
    }
}

/**
 * Decompresses binary data using compression format 1.
 */
function decompressFormat1(src : BinaryView, srcPos : number) : BinaryView
{
    const dest : number[] = [];
    let destPos = 0, readCount = 0, offset = 0, flags = 0, flagMask = 0;

    while (true) {
        flags = src.readByteUnsafe(srcPos++);
        flagMask = 0x80;
        while (flagMask > 0) {
            if ((flags & flagMask) == 0) {
                dest[destPos++] = src.readByteUnsafe(srcPos++);
            } else {
                readCount = src.readByteUnsafe(srcPos++);
                offset = src.readByteUnsafe(srcPos++) | ((readCount & 0xF0) << 4);
                readCount &= 0xF;

                if (readCount == 0) {
                    if (offset == 0) {
                        return new BinaryView(dest);
                    }
                    readCount = src.readByteUnsafe(srcPos++) + 16;
                }

                while (readCount-- >= 0) {
                    dest[destPos] = dest[destPos - offset];
                    ++destPos;
                }
            }

            flagMask >>= 1;
        }
    }
}

/**
 * Decompresses binary data. Automatically selects the correct decompression algorithm based on the first byte at `srcPos`.
 * @param src The full binary data containing the compressed data block
 * @param srcPos The position of the start of the compressed data block
 * @param suppressLog If set to `true`, this will prevent log messages from being emitted
 */
export function decompress(src : BinaryView, srcPos : number, suppressLog : boolean = false) : BinaryView 
{
    const format = src.readByte(srcPos++);
    switch (format) {
        case 0:
            return decompressFormat0(src, srcPos);
        case 1:
            return decompressFormat1(src, srcPos);
        default:
            if (!suppressLog) {
                console.warn(`Decompression of format C-${format} is not yet supported!`);
            }
            return new BinaryView();
    }
}

/**
 * Compresses binary data using compression format 1.
 * @param src The uncompressed binary data
 */
export function compressFormat1(src : BinaryView) : BinaryView
{
    const dest : number[] = new Array(src.length);
    const srcLen = src.length;
    const lookbackTable : number[][] = [];

    // Initialising all local variables beforehand to (hopefully) reduce GC overhead
    let destPos = 0, srcPos = 0;
    let lookbackLength = 0, lookbackOffset = 0, patternLength = 0;
    let flagPos = 0, flagMask = 0;
    let hword = 0, entry = undefined;

    while (true) {
        flagPos = destPos++;
        dest[flagPos] = 0;
        flagMask = 0x80;

        while (flagMask != 0) {
            // If the end of the data is reached, wrap up and return
            if (srcPos >= srcLen) {
                dest[flagPos] |= flagMask;
                dest[destPos++] = 0;
                dest[destPos++] = 0;
                return new BinaryView(dest.slice(0, destPos));
            }

            // Perform lookback for repeating patterns
            lookbackLength = 0;
            lookbackOffset = 0;
            hword = src.readHalfwordUnsafe(srcPos);
            entry = lookbackTable[hword];
            if (entry) {
                for (let i = entry.length - 1; i >= 0; --i) {
                    if (srcPos - entry[i] > 0xFFF) break;

                    patternLength = src.getPatternLength(srcPos, entry[i]);
                    if (patternLength > lookbackLength) {
                        lookbackLength = patternLength;
                        lookbackOffset = srcPos - entry[i];
                    }
                }

                entry.push(srcPos);
            } else {
                lookbackTable[hword] = [srcPos];
            }

            // Write compressed data
            if (lookbackLength < 2) {
                dest[destPos++] = src.readByteUnsafe(srcPos++);
            } else {
                dest[flagPos] |= flagMask;
                if (lookbackLength <= 16) {
                    dest[destPos++] = ((lookbackOffset >> 8) << 4) | (lookbackLength - 1);
                    dest[destPos++] = lookbackOffset & 0xFF;
                } else {
                    dest[destPos++] = (lookbackOffset >> 8) << 4;
                    dest[destPos++] = lookbackOffset & 0xFF;
                    dest[destPos++] = lookbackLength - 17;
                }

                // Update the lookback table with the bytes that are being skipped over
                while (--lookbackLength > 0) {
                    hword = src.readHalfwordUnsafe(++srcPos);
                    entry = lookbackTable[hword];
                    if (entry) {
                        entry.push(srcPos);
                    } else {
                        lookbackTable[hword] = [srcPos];
                    }
                }
                ++srcPos;
            }

            flagMask = (flagMask >> 1);
        }
    }
}

/**
 * Converts BL calls for storage by altering the provided data in place.
 * Should be called before compression if the data consists of ARM/THUMB opcodes.
 * @param src The binary data to process
 */
export function compressBranchLinks(src : BinaryView)
{
    let srcPos = 0;
    while (srcPos < src.length - 3) {
        const opcode = src.readWord(srcPos);
        if ((opcode & 0xF800F800) != 0xF800F000) {
            srcPos += 2;
            continue;
        }

        let jump = (((opcode & 0x7FF) << 11) | ((opcode >> 16) & 0x7FF)) << 1;
        jump += srcPos;

        src.writeHalfword(srcPos, 0xF000 | ((jump >> 12) & 0x7FF));
        src.writeHalfword(srcPos + 2, 0xF800 | (jump >> 1));
        srcPos += 4;
    }
}

/**
 * Restores converted BL calls by altering the provided data in place.
 * Should be called after decompression if the data consists of ARM/THUMB opcodes.
 * @param src The binary data to process
 */
export function decompressBranchLinks(src : BinaryView)
{
    let srcPos = 0;
    while (srcPos < src.length - 3) {
        const opcode = src.readWord(srcPos);
        if ((opcode & 0xF800F800) != 0xF800F000) {
            srcPos += 2;
            continue;
        }

        let jump = (((opcode & 0x7FF) << 11) | ((opcode >> 16) & 0x7FF)) << 1;
        jump -= srcPos;

        src.writeHalfword(srcPos, 0xF000 | ((jump >> 12) & 0x7FF));
        src.writeHalfword(srcPos + 2, 0xF800 | (jump >> 1));
        srcPos += 4;
    }
}