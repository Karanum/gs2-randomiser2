const fs = require('fs');

const forestAddr = 0x5F914;
const offsetTableAddr = 0x60A4C;
const textDataAddr = 0xA9F54;
const compileAddr = 0xFB0000;
const entries = 12461;

var compressionDict = {};
var lines = [];

function readTreeData(rom) {
    var nodes = [];
    var treeOffsetAddr = offsetTableAddr;
    for (var ti = 0; ti < 256; ++ti) {
        var treeOffset = rom[treeOffsetAddr] + (rom[treeOffsetAddr + 1] << 8);
        treeOffsetAddr += 2;

        var treeAddr = forestAddr + treeOffset;
        var queue = [];

        var node = {'path': ''};
        nodes.push(node);
        queue.push(node);

        var offset = 0.5;
        var shift = 0;
        for (var i = 0; i < 64; ++i) {
            var byte = rom[treeAddr + i];
            for (var j = 0; j < 8; ++j) {
                node = queue.pop();
                if (byte & 1) {
                    offset += 0.5;
                    shift += 12;
                    var charAddr = treeAddr - 3 * Math.floor(offset);
                    var char = rom[charAddr] + (rom[charAddr + 1] << 8) + (rom[charAddr + 2] << 16);
                    char = char >> (shift % 24);

                    node['char'] = char & 0xFFF;
                } else {
                    var leftChild = {'path': '0' + node['path']}, rightChild = {'path': '1' + node['path']};
                    node['left'] = leftChild;
                    node['right'] = rightChild;
                    queue.push(rightChild, leftChild);
                }
                byte = byte >> 1;

                if (queue.length == 0) break;
            }

            if (queue.length == 0) break;
        }
    }
    return nodes;
}

function getTextPointers(rom) {
    var pointers = [];
    for (var i = 0; i <= (entries >> 8); ++i) {
        var addr = textDataAddr + (i * 8);
        var pointer = rom[addr] + (rom[addr + 1] << 8) + (rom[addr + 2] << 16);
        var lenAddr = rom[addr + 4] + (rom[addr + 5] << 8) + (rom[addr + 6] << 16);
        pointers.push(pointer);

        var j = 0;
        while (j < Math.min(0xFF, entries - i)) {
            var byteLen = rom[lenAddr + j];
            pointer += byteLen;
            if (byteLen != 0xFF) {
                pointers.push(pointer);
                ++j;
            }
        }
    }
    return pointers;
}

function decompressLine(rom, nodes, addr) {
    var prev = 0, data = 1, char = 1;
    var line = '\0';

    while(char != 0) {
        var node = nodes[prev];
        while (!node.hasOwnProperty('char')) {
            if (data == 1) {
                data = 0x100 | rom[addr++];
            } else {
                node = (data & 1) ? node['right'] : node['left'];
                data = data >> 1;
            }
        }

        prev = node['char'];
        var char = prev & 0xFF;
        line += String.fromCharCode(char);
    }

    return line;
}

function compressLine(line) {
    var byteStr = '';
    var prev = line[0];
    for (var i = 1; i < line.length; ++i) {
        var char = line.charAt(i);
        byteStr = compressionDict[prev][char] + byteStr;
        prev = char;
    }

    var bytes = [];
    while (byteStr.length > 8) {
        var byte = byteStr.substr(byteStr.length - 8);
        byteStr = byteStr.substr(0, byteStr.length - 8);
        bytes.push(parseInt(byte, 2));
    }
    if (byteStr.length > 0) bytes.push(parseInt(byteStr, 2));
    return bytes;
}

function flattenNode(node) {
    var array = [node];
    if (node.hasOwnProperty('left')) array = array.concat(flattenNode(node['left']));
    if (node.hasOwnProperty('right')) array = array.concat(flattenNode(node['right']));
    return array;
}

function makeCompressionDict(nodes) {
    compressionDict = {};
    nodes.forEach((tree, i) => {
        var char = String.fromCharCode(i);
        compressionDict[char] = {};

        flattenNode(tree).forEach((node) => {
            if (node.hasOwnProperty('char')) {
                var nextChar = String.fromCharCode(node['char']);
                compressionDict[char][nextChar] = node['path'];
            }
        });
    });
}

function applyCutsceneSkipText(instance) {
    if (instance == undefined) return;
    writeLine(instance, 0x1B67, "Fight Briggs?\x1E");
    writeLine(instance, 0x2ACD, "Fight Agatio and Karst?\x1E");
}

function readLine(instance, index) {
    if (instance == undefined) instance = lines;
    return instance[index].slice(0);
}

function readLinePretty(instance, index) {
    var line = readLine(instance, index);
    return line.replace(/[^a-zA-Z0-9?:;,\\&\\'\\-\\(\\) ]/gi, '');
}

function writeLine(instance, index, line) {
    if (instance == undefined) instance = lines;
    if (!line.startsWith('\0'))
        line = '\0' + line;
    if (!line.endsWith('\0'))
        line = line + '\0';
    instance[index] = line;
}

function writeUint32(rom, addr, value) {
    for (var i = 0; i < 4; ++i) {
        rom[addr++] = value & 0xFF;
        value = (value >> 8);
    }
}

function writeToRom(instance, rom) {
    var lineLengths = [];
    var compressedData = [];
    for (var i = 0; i <= (entries >> 8); ++i) {
        lineLengths.push([]);
        compressedData.push([]);
    }

    instance.forEach((line, i) => {
        var bytes = compressLine(line);
        compressedData[i >> 8] = compressedData[i >> 8].concat(bytes);

        var len = bytes.length;
        while (len > 0) {
            lineLengths[i >> 8].push(len & 0xFF);
            len = (len >> 8);
        }
    });

    var addr = compileAddr;
    compressedData.forEach((data, i) => {
        var pointer = 0x08000000 + addr;
        writeUint32(rom, textDataAddr + (i * 8), pointer);
        data.forEach((byte, bi) => rom[addr + bi] = byte);
        addr += data.length;
    });

    var lastLineLength = lineLengths.pop();
    lineLengths.forEach((data, i) => {
        var pointer = 0x08000000 + addr;
        writeUint32(rom, textDataAddr + 4 + (i * 8), pointer);
        data.pop();
        data.forEach((byte, bi) => rom[addr + bi] = byte);
        addr += data.length;
    });

    var pointer = 0x08000000 + addr;
    writeUint32(rom, textDataAddr + 4 + (lineLengths.length * 8), pointer);
    lastLineLength.forEach((byte, bi) => rom[addr + bi] = byte);

    return rom;
}

function initialise(rom) {
    var nodes = readTreeData(rom);
    var textPointers = getTextPointers(rom);

    lines = [];
    for (var i = 0; i < entries; ++i) {
        lines.push(decompressLine(rom, nodes, textPointers[i]));
    }

    makeCompressionDict(nodes);
}

function clone() {
    return JSON.parse(JSON.stringify(lines));
}

module.exports = {applyCutsceneSkipText, initialise, clone, readLine, readLinePretty, writeLine, writeToRom};