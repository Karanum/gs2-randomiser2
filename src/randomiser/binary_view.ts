import { clamp } from "$lib/util";

export class BinaryView
{
    protected data : Uint8Array;

    constructor (from? : ArrayLike<number>)
    {
        this.data = (from == undefined ? new Uint8Array(0) : Uint8Array.from(from));
    }

    /**
     * Returns the length (in bytes) of the binary data.
     */
    get length () : number
    {
        return this.data.length;
    }

    /**
     * Increases the length of the view, padding the end with zeroes.
     * @param amount The amount of bytes to add.
     */
    expand (amount : number) : void
    {
        if (amount <= 0) return;

        const newData = new Uint8Array(this.data.length + amount);
        newData.set(this.data, 0);
        this.data = newData;
    }

    /**
     * Returns a copy of this view.
     */
    clone () : BinaryView
    {
        return new BinaryView(this.data);
    }

    /**
     * Returns a copy of the raw binary data in this view.
     */
    getData () : Uint8Array
    {
        return Uint8Array.from(this.data);
    }

    /**
     * Reads a single byte from the binary data.
     * @param address The address to read from
     * @returns The byte at the specified address, or `0` if the address is outside the view
     */
    readByte (address : number) : number 
    {
        if (address < 0 || address >= this.data.length) return 0;
        return this.data[address];
    }

    /**
     * Reads a single byte from the binary data. Does not check whether `address` falls within the bounds of the view.
     * @param address The address to read from
     * @returns The byte at the specified address
     */
    readByteUnsafe (address : number) : number
    {
        return this.data[address];
    }

    /**
     * Reads a 16-bit halfword from the binary data.
     * @param address The address to start reading from
     * @returns The halfword at the specified address, or `0` if the address is outside the view
     */
    readHalfword (address : number) : number 
    {
        return this.readByte(address) + (this.readByte(address + 1) << 8);
    }

    /**
     * Reads a 16-bit halfword from the binary data. Does not check whether `address` falls within the bounds of the view.
     * @param address The address to start reading from
     * @returns The halfword at the specified address
     */
    readHalfwordUnsafe (address : number) : number
    {
        return this.data[address] + (this.data[address + 1] << 8);
    }

    /**
     * Reads a 24-bit number from the binary data.
     * @param address The address to start reading from
     * @returns The number at the specified address, or `0` if the address is outside the view
     */
    read24bit (address : number) : number
    {
        return this.readByte(address) + (this.readHalfword(address + 1) << 8);
    }

    /**
     * Reads a 32-bit word from the binary data.
     * @param address The address to start reading from
     * @returns The word at the specified address, or `0` if the address is outside the view
     */
    readWord (address : number) : number 
    {
        return this.readHalfword(address) + (this.readHalfword(address + 2) << 16);
    }

    /**
     * Returns a subsection of binary data.
     * @param address The address to start reading from
     * @param size The number of bytes to read
     * @returns A `BinaryView` with the specified size, padded with `0` if the read data is (partially) outside this view
     */
    readBlock (address : number, size : number) : BinaryView
    {
        const newView = new BinaryView();
        if (address >= 0 && address + size < this.data.length) {
            newView.data = this.data.slice(address, address + size);
            return newView;
        }

        const offset = -1 * Math.min(0, address);
        const buffer = new Uint8Array(size);
        buffer.fill(0);
        buffer.set(this.data.slice(address, Math.min(size, this.data.length - offset)), offset);
        newView.data = buffer;
        return newView;
    }

    /**
     * Writes a single byte to the binary data. Data will not be written to addresses outside the view.
     * @param address The address to write to
     * @param data The data to write, automatically reduced to the correct size if greater
     */
    writeByte (address : number, data : number) : void
    {
        if (address < 0 || address >= this.data.length) return;
        this.data[address] = (data & 0xFF);
    }

    /**
     * Writes a 16-bit halfword to the binary data. Data will not be written to addresses outside the view.
     * @param address The address to start writing to
     * @param data The data to write, automatically reduced to the correct size if greater
     */
    writeHalfword (address : number, data : number) : void
    {
        this.writeByte(address, data);
        this.writeByte(address + 1, data >> 8);
    }

    /**
     * Writes a 24-bit number to the binary data. Data will not be written to addresses outside the view.
     * @param address The address to start writing to
     * @param data The data to write, automatically reduced to the correct size if greater
     */
    write24bit (address : number, data : number) : void
    {
        this.writeByte(address, data);
        this.writeHalfword(address + 1, data >> 8);
    }

    /**
     * Writes a 32-bit word to the binary data. Data will not be written to addresses outside the view.
     * @param address The address to start writing to
     * @param data The data to write
     */
    writeWord (address : number, data : number) : void
    {
        this.writeHalfword(address, data);
        this.writeHalfword(address + 2, data >> 16);
    }

    /**
     * Writes an arbitrary number of bytes to the binary data. Data will not be written to addresses outside the view.
     * @param address The address to start writing to
     * @param data The `Uint8Array` of bytes to write
     */
    writeBlock (address : number, data : Uint8Array) : void
    {
        if (address >= 0 && address + data.length <= this.data.length) {
            return this.data.set(data, address);
        }
        
        const offset = -1 * Math.min(0, address);
        const writeableLength = Math.min(data.length - offset, this.data.length - address - offset);
        const buffer = data.slice(offset, offset + writeableLength);
        this.data.set(buffer, address + offset);
    }

    /**
     * Writes a standard `bl` jump instruction to the binary data. Writes 4 bytes.
     * Will fail if the destination address is too far from the source address.
     * Data will not be written to addresses outside the view.
     * @param address The address to write the instruction to
     * @param baseOffset The base offset of this `BinaryView` (e.g. `0x08000000` for ROM, `0x02008000` for map code)
     * @param jumpTo The address to jump to
     */
    writeLinkedJump (address : number, baseOffset : number, jumpTo : number) : void
    {
        const srcAddr = baseOffset + address + 4;
        if (jumpTo < srcAddr - 0x3FFFFE || jumpTo > srcAddr + 0x3FFFFC) {
            const srcStr = (srcAddr - 4).toString(16).toUpperCase();
            const destStr = jumpTo.toString(16).toUpperCase();
            console.warn(`BL operation from 0x${srcStr} to 0x${destStr} is too far!`);
            return;
        }

        const offset = (jumpTo - srcAddr - 4) >> 1;
        const upper = (offset >> 11) & 0x7FF;
        const lower = offset & 0x7FF;

        this.writeHalfword(address, 0xF0 + upper);
        this.writeHalfword(address + 2, 0xF8 + lower);
    }

    /**
     * Writes a standard long jump construction (`ldr` + `bx` + pointer) to the binary data.
     * This will write 8 bytes when word-aligned, otherwise it will write 10 bytes.
     * Data will not be written to addresses outside the view.
     * @param address The address to start writing to
     * @param jumpTo The address to jump to
     * @param register The register to use for storing the pointer (defaults to r4)
     */
    writeLongJump (address : number, jumpTo : number, register : number = 4) : void
    {
        const aligned = (address % 4 == 0);
        register = clamp(register, 0, 7);

        this.writeHalfword(address, 0x4800 + (register << 8) + (aligned ? 0 : 1));
        this.writeHalfword(address + 2, 0x4700 + (register << 3));
        if (aligned) {
            this.writeWord(address + 4, jumpTo);
        } else {
            this.writeHalfword(address + 4, 0);
            this.writeWord(address + 6, jumpTo);
        }
    }

    /**
     * Returns the length of the matching pattern within the binary data starting from `address1` and `address2`.
     * Returns `0` if the bytes at these starting addresses do not match. Maximum returned length is `271`.
     * @param address1 First position to start from
     * @param address2 Second position to start from
     */
    getPatternLength (address1 : number, address2 : number) : number
    {
        let length = 0;
        while (length < 0x10F) {
            if (address1 + length >= this.data.length || address2 + length >= this.data.length) break;
            if (this.data[address1 + length] != this.data[address2 + length]) break;
            ++length;
        }
        return length;
    }
}