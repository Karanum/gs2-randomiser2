import { TextDefinition } from "$lib/definitions";
import type { RomData } from "../../rom";
import { Tree } from "./compression_tree";

export class TextManager 
{
    private data : string[];
    private trees : Tree[];

    constructor ()
    {
        this.data = [];
        this.trees = [];
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : TextManager
    {
        const cloned = new TextManager();
        cloned.data = [...this.data];
        cloned.trees = this.trees.map(node => node.clone());
        return cloned;
    }

    /**
     * Returns a string from this data manager.
     * @param id The id of the string to fetch
     * @returns A string, or `undefined` if no string with this id exists
     */
    get (id : number) : string|undefined 
    {
        return this.data[id];
    }

    /**
     * Sets a string in this data manager.
     * @param id The id of the string to set
     * @param text The string itself, does not need to end with a \x00 character
     */
    set (id : number, text : string)
    {
        this.data[id] = text;

        // Expand compression trees with any new character combinations
        const paddedText = text + '\0';
        let tree = this.trees[0];
        for (let i = 0; i < paddedText.length; ++i) {
            const char = paddedText.charCodeAt(i);
            if (!tree.compressionDict.has(char)) tree.inject(char);
            tree = this.trees[char];
        }
    }

    /**
     * Compresses a line of text using the compression trees.
     * @param line The string to compress
     * @returns A `Uint8Array` with the compressed string
     */
    private compress(line : string) : Uint8Array 
    {
        const byteArr : number[] = [];
        let tree = this.trees[0];
        let byteStr = '';

        // Build a string of compressed bits
        for (let i = 0; i < line.length; ++i) {
            const char = line.charCodeAt(i);
            byteStr = tree.compressionDict.get(char) + byteStr;
            tree = this.trees[char];
        }
        byteStr = tree.compressionDict.get(0) + byteStr;

        // Break down the byte string into a byte array
        while (byteStr.length > 8) {
            const byte = byteStr.substring(byteStr.length - 8);
            byteStr = byteStr.substring(0, byteStr.length - 8);
            byteArr.push(parseInt(byte, 2));
        }
        if (byteStr.length > 0) byteArr.push(parseInt(byteStr, 2));

        return new Uint8Array(byteArr);
    }

    /**
     * Decompresses a line of text using the compression trees.
     * @param block The block of binary data representing the compressed string
     * @returns The decompressed string
     */
    private decompress(block : Uint8Array) : string
    {
        let previousChar = 0;
        let data = 0;
        let byte = 0;
        let bits = 0;
        let line = '';

        while (true) {
            let node = this.trees[previousChar].root;
            while (node.children && node.data == undefined) {
                if (bits == 0) {
                    data = block[byte++];
                    bits = 8;
                }

                node = (data & 1) == 1 ? node.children[1] : node.children[0];
                data >>= 1;
                --bits;
            }

            if (node.data == undefined) {
                console.warn(`[WARNING] Leaf node without data found in compression tree ${previousChar} (path: ${node.path})`);
                break;
            }

            if (node.data == 0) break;
            line += String.fromCharCode(node.data);
            previousChar = node.data;
        }

        return line;
    }

    writeToRom (rom : RomData) : void
    {
        const writeAddress = TextDefinition.ADDRESS_WRITE;
        const treeOffsetAddress = TextDefinition.ADDRESS_TREE_OFFSETS;
        const textAddress = TextDefinition.ADDRESS;

        const compressedData : Uint8Array[] = this.data.map(this.compress, this);
        const treeData : Uint8Array[] = [];

        // Update the compression tree pointer
        let addr = writeAddress;
        rom.writeWord(TextDefinition.ADDRESS_TREE_POINTER, writeAddress);

        // Write the modified compression trees
        for (let i = 0; i < 256; ++i) {
            const [tree, offset] = this.trees[i].toBinary();
            rom.writeBlock(addr, tree);
            rom.writeHalfword(treeOffsetAddress + i * 2, addr - writeAddress + offset);
            addr += tree.length;
        }

        // Write the compressed text lines and update the text pointers accordingly
        for (let i = 0; i <= (compressedData.length >> 8); ++i) {

        }

        //TODO: Implement
    }

    static loadFromRom (rom : RomData) : TextManager
    {
        const instance = new TextManager();
        const treeAddress = TextDefinition.ADDRESS_TREES;
        const treeOffsetAddress = TextDefinition.ADDRESS_TREE_OFFSETS;
        const textAddress = TextDefinition.ADDRESS;

        // Load compression trees
        for (let i = 0; i < 256; ++i) {
            // Skip loading trees that have been confirmed to be invalid, and point to an empty tree instead
            if (i == 244) {
                instance.trees[i] = Tree.loadFromBinary(i, rom, 0x67914);
                continue;
            }
            
            let offset = rom.readHalfword(treeOffsetAddress + i * 2);
            instance.trees[i] = Tree.loadFromBinary(i, rom, treeAddress + offset);
        }

        // Load text lines
        for (let i = 0; true; ++i) {
            if (rom.readByte(textAddress + 8 * i + 3) != 0x8) break;
            let textPointer = rom.read24bit(textAddress + 8 * i);
            const sizePointer = rom.read24bit(textAddress + 8 * i + 4);
            
            for (let j = 0; j < 256; ++j) {
                const size = rom.readByte(sizePointer + j);
                if (size == 0x00) break;

                instance.data[i * 256 + j] = instance.decompress(rom.readBlock(textPointer, size).getData());
                textPointer += size;
            }
        }

        // Change display for the vague "Increases Criticals" description line
        instance.set(4226, "Crit/Unleash Rate");

        return instance;
    }
}