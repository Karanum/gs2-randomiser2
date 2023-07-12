function decompress(src, srcPos, destPos, suppressLog = false) {
    var format = src[srcPos++];
    if (format == 0) {
        return decompressC0(src, srcPos, destPos);
    } else if (format == 1) {
        return decompressC1(src, srcPos, destPos);
    } else if (!suppressLog) {
        console.log("NOT SUPPORTING C-" + format + " YET");
    }
    return [];
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

function decompressC1(src, srcPos, destPos) {
    var dest = [];
    var bits = 0;
    var readCount = 0;

    while (true) {
        bits = src[srcPos++];

        var a = 0x80;
        while (a > 0) {
            if ((bits & a) == 0) {
                dest[destPos++] = src[srcPos++];
            } else {
                readCount = src[srcPos++];
                var offset = src[srcPos++] | ((readCount & 0xF0) << 4);
                readCount = readCount & 15;

                if (readCount == 0) {
                    if (offset == 0)
                        return dest;
                    readCount = src[srcPos++] + 16;
                }

                while (readCount-- >= 0) {
                    dest[destPos] = dest[destPos - offset];
                    ++destPos;
                }
            }

            a = (a >> 1);
        }
    }
}

function compressC0(src, suppressLog = false) {
    if (!suppressLog) {
        console.log("WARNING: Compression for format C-0 may not function correctly!");
    }

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

function compressC1(src) {
    var dest = [];
    var destPos = 0;
    var srcPos = 0;
    var srcLength = src.length;
    var lookbackTable = [];

    while (true) {
        var flagPos = destPos++;
        var flagMask = 0x80;

        dest[flagPos] = 0;

        while (flagMask > 0) {
            if (srcPos >= srcLength) {
                dest[flagPos] |= flagMask;
                dest.push(0);
                dest.push(0);
                return dest;
            }

            // Do lookbacks
            var lookbackLength = 0;
            var lookbackOffset = 0;
            var hword = src[srcPos] + (src[srcPos + 1] << 8);
            if (lookbackTable[hword]) {
                lookbackTable[hword].forEach((pos) => {
                    if (srcPos - pos > 0xFFF) return;

                    var length = 2;
                    while (srcPos + length < srcLength) {
                        if (src[srcPos + length] != src[pos + length] || length >= 0x10F)
                            break;
                        ++length;
                    }
                    
                    if (length >= lookbackLength) {
                        lookbackLength = length;
                        lookbackOffset = srcPos - pos;
                    }
                });
            }

            // Add byte pair to the lookup table
            if (srcPos < srcLength - 1) {
                var hword = src[srcPos] + (src[srcPos + 1] << 8);
                if (!lookbackTable[hword]) {
                    lookbackTable[hword] = [srcPos];
                } else {
                    lookbackTable[hword].push(srcPos);
                }
            }

            // Transpose data into destination array
            if (lookbackLength < 2) {
                dest[destPos++] = src[srcPos++];
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
                
                // Add skipped byte pairs to lookback table
                var targetPos = srcPos + lookbackLength;
                while ((++srcPos) < targetPos) {
                    var hword = src[srcPos] + (src[srcPos + 1] << 8);
                    if (!lookbackTable[hword]) {
                        lookbackTable[hword] = [srcPos];
                    } else {
                        lookbackTable[hword].push(srcPos);
                    }
                }
            }
            flagMask = (flagMask >> 1);
        }
    }
}

module.exports = {decompress, compressC0, compressC1};