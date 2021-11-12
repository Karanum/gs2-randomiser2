// JavaScript UPS patcher by Snootiful, edited by Karanum

class UPSPatcher {
    explAddresses = [];
    explValues = [];
    sourceLength = 0;
    targetLength = 0;

    explodePatch(patchFile) {
        this.explAddresses = [];
        this.explValues = [];

        let patch = patchFile;
        let patchLength = patch.length;

        let targetOffset = 0;
        let patchOffset = 4;

        let [sourceLength, offsetA] = this.decode(patch, patchOffset);
        let [targetLength, offsetB] = this.decode(patch, patchOffset + offsetA);
        this.sourceLength = sourceLength;
        this.targetLength = targetLength;
        patchOffset += offsetA + offsetB;

        while (patchOffset < patchLength - 12) {
            let [length, newOffset] = this.decode(patch, patchOffset);
            patchOffset += newOffset;
            targetOffset += length;
            this.explAddresses.push(targetOffset);
            let values = [];

            while (true) {
                let patchXOR = this.readByte(patch, patchOffset++);
                ++targetOffset;
                if (patchXOR === 0) {
                    break;
                }
                else
                    values.push(patchXOR);
            }
            this.explValues.push(values);
        }
    }

    /*implodePatch() {

    }*/

    findInsertionIndex(address) {
        for (let i = 0; i < this.explAddresses.length; ++i) {
            if (this.explAddresses[i] > address)
                return i;
        }
        return this.explAddresses.length;
    }

    add(startAddress, values) {
        let index = this.findInsertionIndex(startAddress);
        this.explAddresses.splice(index, 0, startAddress);
        this.explValues.splice(index, 0, values);
    }

    remove(address) {
        for (let i = 0; i < this.explAddresses.length; ++i) {
            if (this.explAddresses[i] == address) {
                this.explAddresses.splice(i, 1);
                this.explValues.splice(i, 1);
                return;
            }
        }
    }

    patchRom(targetRom) {
        let source, target;
        if (targetRom instanceof Uint8Array) {
            target = targetRom;
            source = targetRom;
        }
        else
            throw `targetRom must be a Uint8Array or null, was '${targetRom.constructor.name}'`;

        if (this.targetLength > this.sourceLength) {
            let oldTarget = target;
            target = new Uint8Array(this.targetLength);
            target.set(oldTarget);
        }

        for (let i = 0; i < this.explAddresses.length; ++i) {
            let addr = this.explAddresses[i];
            let values = this.explValues[i];
            for (let j = 0; j < values.length; ++j) {
                this.writeByte(values[j] ^ this.readByte(source, addr), target, addr);
                ++addr;
            }
        }

        return target;
    }

    /**
     * Writes the provided byte to the provided Uint8Array at the provided offset.
     * @param {Byte} byte Byte to write
     * @param {Uint8Array} to The Uint8Array to write to
     * @param {number} offset Index of the Uint8Array to write to
     */
    writeByte(byte, to, offset) {
        if (offset < to.length)
            to[offset] = byte;
    }

    /**
     * Decodes an encoded number from the provided data at the provided offset.
     * @param {Uint8Array} data
     * @param {number} dataOffset
     * @returns {[number, number]} 
     */
    decode(data, dataOffset) {
        let [offset, shift] = [0, 1];

        let newDataOffset = dataOffset;
        while (true) {
            let byte = this.readByte(data, newDataOffset++);
            offset += (byte & 127) * shift;
            if (byte & 128)
                break;
            else {
                shift <<= 7;
                offset += shift;
            }
        }
        return [offset, newDataOffset - dataOffset];
    }

    /**
     * Safely reads a byte from the provided Uint8Array at the provided offset.
     * 
     * When the offset is out of bounds, this function will return 0.
     * @param {Uint8Array} from The Uint8Array to read from
     * @param {number} offset Index of the Uint8Array to read from
     * @returns {Byte}
     */
    readByte(from, offset) {
        return (offset < from.length) ? from[offset] : 0;
    }
}

/** @typedef {number} Byte */
/** @typedef {number} Checksum */
