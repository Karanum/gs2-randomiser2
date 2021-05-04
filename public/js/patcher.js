// JavaScript UPS patcher by Snootiful

class UPSPatcher {
    /** @type {Uint8Array} */ source;

    /**
     * @param {Uint8Array} source Source ROM
     */
    constructor(source) {
        this.source = source;
    }

    /**
     * Patches the target ROM using the provided patch file.
     * 
     * If targetRom is null, the source is used instead.
     * @param {Uint8Array} patchFile 
     * @param {Uint8Array | null} targetRom 
     */
    patchRom(patchFile, targetRom) {
        /** @type {number} */     let sourceLength;
        /** @type {number} */     let sourceOffset;
        /** @type {Uint8Array} */ let patch;
        /** @type {number} */     let patchLength;
        /** @type {number} */     let patchOffset;
        /** @type {Uint8Array} */ let target;
        /** @type {number} */     let targetLength;
        /** @type {number} */     let targetOffset;

        if (!(patchFile instanceof Uint8Array))
            throw `patchFile must be a Uint8Array, was '${patchFile.constructor.name}'`;
        patch = patchFile;
        patchLength = patch.length;

        if (targetRom === null || targetRom === undefined)
            target = this.source;
        else if (targetRom instanceof Uint8Array)
            target = targetRom;
        else
            throw `targetRom must be a Uint8Array or null, was '${targetRom.constructor.name}'`;

        sourceOffset = 0;
        targetOffset = 0;
        patchOffset = 4;

        let offsetA, offsetB;
        [sourceLength, offsetA] = this.decode(patch, patchOffset);
        [targetLength, offsetB] = this.decode(patch, patchOffset + offsetA);
        patchOffset += offsetA + offsetB;

        if (targetLength > sourceLength) {
            let oldTarget = target;
            target = new Uint8Array(targetLength);
            target.set(oldTarget);
        }

        while (patchOffset < patchLength - 12) {
            let [length, newOffset] = this.decode(patch, patchOffset);
            patchOffset += newOffset;
            sourceOffset += length;
            targetOffset += length;
            while (true) {
                let patchXOR = this.readByte(patch, patchOffset++);
                this.writeByte(patchXOR ^ this.readByte(this.source, sourceOffset++), target, targetOffset++);
                if (patchXOR === 0)
                    break;
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
