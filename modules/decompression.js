function decompress(src, srcPos, destPos) {
    var dest = [];
    var start = srcPos;

    var bits = 0;
    var readCount, byte;
    //var z = BigInt(0xFEDCBA9876543210);

    var format = src[srcPos++];
    if (format == 0 || format == 2) {
        var bitnum = 0;
        /*if ((srcPos & 1) == 1) {
            bits = src[srcPos++];
            bitnum = 8;
        }*/
        bits += (src[srcPos++] << bitnum) + (src[srcPos++] << (8 + bitnum));

        while (true) {
            readCount = 0;
            if ((bits & 1) == 1) {
                bits >>= 1;
                --bitnum;
                if (format == 0) {
                    dest[destPos++] = (bits & 0xFF);
                    bits >>= 8;
                    bitnum -= 8;
                } else {
                    console.log("NOT SUPPORTING C2 YET");
                }
            } else if ((bits & 3) == 0) {
                readCount = 2;
                bits >>= 2;
                bitnum -= 2;
            } else if ((bits & 7) == 2) {
                readCount = 3;
                bits >>= 3;
                bitnum -= 3;
            } else if ((bits & 0xF) == 6) {
                readCount = 4;
                bits >>= 4;
                bitnum -= 4;
            } else if ((bits & 0x1F) == 0xE) {
                readCount = 5;
                bits >>= 5;
                bitnum -= 5;
            } else if ((bits & 0x7F) == 0x1E) {
                readCount = 6;
                bits >>= 7;
                bitnum -= 7;
            } else if ((bits & 0x7F) == 0x5E) {
                readCount = 7;
                bits >>= 7;
                bitnum -= 7;
            } else if ((bits & 0x3F) == 0x3E) {
                readCount = 7 + ((bits >> 6) & 3);
                bits >>= 8;
                bitnum -= 8;
                if (readCount == 7) {
                    readCount = 10 + (bits & 127);
                    bits >>= 7;
                    bitnum -= 7;
                    if (readCount == 10) return dest;
                }
            }

            if (bitnum < 0) {
                bitnum += 16;
                bits += (src[srcPos++] << bitnum) + (src[srcPos++] << (8 + bitnum));
            }

            if (readCount != 0) {
                var offset = 0;
                if ((bits & 1) == 0) {
                    bits >>= 1;
                    --bitnum;
                    offset = ((destPos - 33) >>> 0);
                    byte = 12;
                    while (offset < (1 << (byte - 1))) {
                        --byte;
                    }
                    offset = ((32 + (bits & ((1 << byte) - 1))) >>> 0);
                    bits >>= byte;
                    bitnum -= byte;
                } else {
                    bits >>= 1;
                    --bitnum;
                    offset = ((bits & 31) >>> 0);
                    bits >>= 5;
                    bitnum -= 5;
                }

                if (bitnum < 0) {
                    bitnum += 16;
                    bits += (src[srcPos++] << bitnum) + (src[srcPos++] << (8 + bitnum));
                }

                while (readCount-- > 0) {
                    dest[destPos] = dest[destPos - offset - 1];
                    ++destPos;
                }
            }
        }
    } else {
        console.log("NOT SUPPORTING C1 YET");
    }
}

function getPatternLength(src, srcPos, patternPos) {
    var i = 0;
    while (src[srcPos + i] == src[patternPos + i] && srcPos < src.length) ++i;
    return i;
}

function compressC0(dest, destPos, src) {
    var srcPos = 0;
    var bits, bitcount = 0;
    
    dest[destPos++] = 0;
    while (srcPos < src.length) {
        var byte = src[srcPos];
        var readCount = 0, offset = 0;
        for (var i = 0; i < srcPos; ++i) {
            var patternLen = getPatternLength(src, srcPos, (srcPos - 1 - i));
            if (patternLen > 1 && patternLen > readCount) {
                readCount = patternLen;
                offset = i;
            }
        }

        if (readCount == 0) {
            bits <<= 9;
            bitcount += 9;
            bits |= (byte << 1) + 1;
        } else {
            // help.
        }

        while (bitcount >= 8) {
            dest[destPos++] = (bits & 0xFF);
            bits >>= 8;
            bitCount -= 8;
        }
        ++srcPos;
    }
}

module.exports = {decompress, compressC0};