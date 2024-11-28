const { write32b, write16b, read32b, writeArray } = require("../../util/binary");

const pointerOffset = 0x3D4DC;
const tableReadOffset = 0x54A14;
const tableWriteOffset = 0xFFAA00;
const iconWriteOffset = 0xFFB000;
const mappingOffset = 0x0100311C;

class IconManager {
    #nextId;
    #nextAddr;

    #iconData;
    #iconPointers;
    #iconMappings;
    
    constructor() {
        this.#nextId = 0x104;
        this.#nextAddr = 0x08000000 + iconWriteOffset;

        this.#iconData = [];
        this.#iconPointers = [];
        this.#iconMappings = [];
    }

    insertMapping(itemId, iconId) {
        write16b(this.#iconMappings, this.#iconMappings.length, itemId);
        write16b(this.#iconMappings, this.#iconMappings.length, iconId);
    }

    insertIcon(data) {
        this.#iconData = this.#iconData.concat(data);
        write32b(this.#iconPointers, this.#iconPointers.length, this.#nextAddr);

        this.#nextAddr += data.length;
        return this.#nextId++;
    }

    insertIconWithMapping(data, itemId) {
        let id = this.insertIcon(data);
        this.insertMapping(itemId, id);
    }

    writeToRom(rom) {
        this.#moveIconTable(rom);

        writeArray(rom, iconWriteOffset, this.#iconData);
        writeArray(rom, tableWriteOffset + 0x410, this.#iconPointers);
        writeArray(rom, mappingOffset, this.#iconMappings);

        write32b(rom, pointerOffset, 0x08000000 + tableWriteOffset + this.#nextId * 4);
        write32b(rom, pointerOffset + 4, 0x08000000 + tableWriteOffset);
        write32b(rom, pointerOffset + 0x598, 0x08000000 + tableWriteOffset);
    }

    #moveIconTable(rom) {
        let offset = 0;
        let word = read32b(rom, tableReadOffset);
        while (word != 0xFFFFFFFF) {
            write32b(rom, tableWriteOffset + offset, word);
            offset += 4;
            word = read32b(rom, tableReadOffset + offset);
        }
    }
}

module.exports = {IconManager};