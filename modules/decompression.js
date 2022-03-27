function decompress(src, srcPos, destPos, suppressLog = false) {
    var dest = [];
    //var start = srcPos;

    var bits = 0;
    var readCount, byte;
    //var z = BigInt(0xFEDCBA9876543210);

    var format = src[srcPos++];
    if (format == 0) {
        return decompressC0(src, srcPos, destPos);
    } else if (!suppressLog) {
        console.log("NOT SUPPORTING C-" + format + " YET");
    }
}

function getPatternLength(src, srcPos, patternPos) {
    var i = 0;
    while (src[srcPos + i] == src[patternPos + i] && srcPos < src.length) ++i;
    return i;
}

function decompressC0(src, srcPos, destPos) {
    var dest = [];
    var bitNum = 0;
    var bits = src[srcPos++] + (src[srcPos++] << 8);
    var byte = 0;

    while (true) {
        var readCount = 0;
        if ((bits & 1) == 1) {
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
            bits >>= 7;
            bitNum -= 7;
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
                if (readCount == 10) return dest;
            }
        }

        if (bitNum < 0) {
            bitNum += 16;
            bits += (src[srcPos++] << bitNum) + (src[srcPos++] << (8 + bitNum));
        }

        if (readCount != 0) {
            var offset = 0;
            if ((bits & 1) == 0) {
                bits >>= 1;
                --bitNum;

                offset = ((destPos - 33) >>> 0);
                byte = 12;
                while (offset < (1 << (byte - 1)))
                    --byte;

                offset = ((32 + (bits & ((1 << byte) - 1))) >>> 0);
                bits >>= byte;
                bitNum -= byte;
            } else {
                offset = (((bits >> 1) & 31) >>> 0);
                bits >>= 6;
                bitNum -= 6;
            }

            if (bitNum < 0) {
                bitNum += 16;
                bits += (src[srcPos++] << bitNum) + (src[srcPos++] << (8 + bitNum)); 
            }

            while (readCount-- > 0) {
                dest[destPos] = dest[destPos - offset - 1];
                ++destPos;
            }
        }
    }
}

function compressC0(src) {
    var dest = [];
    var srcPos = 0;
    var bits = 0, bitCount = 0;
    
    dest.push(0);
    while (srcPos < src.length) {
        var byte = src[srcPos];
        var readCount = 0, offset = 0;
        for (var i = 0; i < srcPos; ++i) {
            var patternLen = getPatternLength(src, srcPos, (srcPos - 1 - i));
            var comprLength;
            if (patternLen > 1 && patternLen > readCount) {
                readCount = patternLen;
                offset = i;
            }
        }

        if (readCount == 0) {
            bits += ((byte << 1) + 1) << bitCount;
            bitCount += 9;
            ++srcPos;
        } else {
            //console.log("Back-referencing at position " + dest.length + " (" + bitCount + ")");
            //console.log("  > SrcPos = " + srcPos);
            //console.log("  > Offset = " + offset);
            //console.log("  > Length = " + readCount);

            if (readCount < 6) {
                bits += ((1 << (readCount - 1)) - 2) << bitCount;
                bitCount += readCount;
            } else if (readCount < 8) {
                bits += (((readCount - 1) << 6) + 0x1E) << bitCount;
                bitCount += 7;
            } else if (readCount < 11) {
                bits += (((readCount - 7) << 6) + 0x3E) << bitCount;
                bitCount += 8;
            } else {
                bits += (((readCount - 10) << 8) + 0x3E) << bitCount;
                bitCount += 15;
            }

            if (offset < 32) {
                bits += ((offset << 1) + 1) << bitCount;
                bitCount += 6;
            } else {
                var offsetLength = 6;
                var pos = ((srcPos - 33) >> 6);
                while (pos > 0) {
                    pos >>= 1;
                    ++offsetLength;
                }
                //console.log("  > Offset Length = " + offsetLength);
                bits += ((offset - 32) << 1) << bitCount;
                bitCount += (offsetLength + 1);
            }
            srcPos += readCount;
        }

        while (bitCount >= 8) {
            dest.push(bits & 0xFF);
            bits >>= 8;
            bitCount -= 8;
        }
    }

    bits += 0x3E << bitCount;
    bitCount += 15;

    while (bitCount > 0) {
        dest.push(bits & 0xFF);
        bits >>= 8;
        bitCount -= 8;
    }

    return dest;
}

module.exports = {decompress, compressC0};