export class BinaryView
{
    protected data : Uint8Array;

    constructor (from? : ArrayLike<number>)
    {
        this.data = (from == undefined ? new Uint8Array() : Uint8Array.from(from));
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
     * Returns a copy of the full binary data.
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
     * Reads a 16-bit halfword from the binary data.
     * @param address The address to start reading from
     * @returns The halfword at the specified address, or `0` if the address is outside the view
     */
    readHalfword (address : number) : number 
    {
        return this.readByte(address) + (this.readByte(address + 1) << 8);
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
}