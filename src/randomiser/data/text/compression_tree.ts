import type { BinaryView } from "../../binary_view";

/**
 * Single node within a Huffmann compression tree.
 */
export class Node
{
    public path : string;
    public data? : number;
    public children : [Node, Node] | undefined;
    public depth : number;

    constructor (path : string, depth: number)
    {
        this.path = path;
        this.depth = depth;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : Node
    {
        const cloned = new Node(this.path, this.depth);
        if (this.data) cloned.data = this.data;
        if (this.children) cloned.children = [this.children[0].clone(), this.children[1].clone()];
        return cloned;
    }

    /**
     * Creates left and right children nodes for this node. Any current data on this node will be 
     * moved to the left child. If `insertData` is provided, it will be set on the right child.
     * Has no effect if the node already has children nodes.
     * @returns An array containing the left and right children nodes respectively
     */
    branch (insertData? : number) : [Node, Node]
    {
        if (!this.children) {
            this.children = [
                new Node('0' + this.path, this.depth + 1),
                new Node('1' + this.path, this.depth + 1)
            ]

            this.children[0].data = this.data;
            if (insertData) this.children[1].data = insertData;
            this.data = undefined;
        }
        return [this.children[0], this.children[1]];
    }
}

/**
 * A Huffman compression tree, mapping a single text character to any consecutive characters.
 */
export class Tree
{
    public id : number;
    public root : Node;

    readonly compressionDict : Map<number, string> = new Map<number, string>();
    private deepestNode : Node;

    constructor (id : number) {
        this.id = id;

        this.root = new Node('', 0);
        this.deepestNode = this.root;
    }

    /**
     * Returns a deep copy of this object.
     */
    clone () : Tree
    {
        const cloned = new Tree(this.id);
        cloned.root = this.root.clone();
        for (const [char, path] of this.compressionDict) {
            cloned.compressionDict.set(char, path);
        }   

        let deepestPath = Number('0b0' + this.deepestNode.path);
        cloned.deepestNode = cloned.root;
        while (cloned.deepestNode.children) {
            cloned.deepestNode = (deepestPath & 1) == 1 ? cloned.deepestNode.children[1] : cloned.deepestNode.children[0];
        }

        return cloned;
    }

    inject (char : number) : void
    {
        if (this.compressionDict.has(char)) return;
        while (this.deepestNode.children) {
            this.deepestNode = this.deepestNode.children[1];
        }

        const [left, right] = this.deepestNode.branch(char);
        if (left.data != undefined) this.compressionDict.set(left.data, left.path);
        this.compressionDict.set(char, right.path);
        this.deepestNode = right;
    }

    /**
     * Returns a binary representation of this object.
     * @returns A tuple containing both the byte array and the internal offset for the tree pointer
     */
    toBinary () : [Uint8Array, number]
    {
        let byteStr : string = '';
        const treeBytes : number[] = [];
        const charBytes : number[] = [];
        const nodeQueue : (Node|undefined)[] = [this.root];
        const characters : number[] = [];

        // Compile the tree structure into bytes
        while (nodeQueue.length > 0) {
            const node = nodeQueue.pop() as Node;
            if (node == undefined) throw new Error("Invalid compression tree: non-leaf node does not have children!");
            
            if (node.data != undefined) {
                byteStr = '1' + byteStr;
                characters.push(node.data);
            } else {
                byteStr = '0' + byteStr;
                nodeQueue.push(node.children?.[1], node.children?.[0]);
            }

            if (byteStr.length == 8) {
                treeBytes.push(parseInt(byteStr, 2));
                byteStr = '';
            }
        }
        if (byteStr.length != 0) treeBytes.push(parseInt(byteStr, 2));

        // Create the lookup list for leaf values
        for (let i = 0; i < characters.length - 1; i += 2) {
            const charPair = (characters[i] << 12) + characters[i + 1];
            charBytes.push((charPair >> 16) & 0xFF, (charPair >> 8) & 0xFF, charPair & 0xFF);
        }
        if (characters.length % 2 == 1) {
            const lastChar = characters[characters.length - 1] << 4;
            charBytes.push((lastChar >> 8) & 0xFF, lastChar & 0xFF);
        }

        // Inverts the lookup list bytes to little-endian and combines it with the tree bytes
        return [new Uint8Array(charBytes.reverse().concat(treeBytes)), charBytes.length];
    }

    /**
     * Creates a new compression tree from ROM data.
     * @param id The text character that this compression tree is for
     * @param rom The ROM data
     * @param address The memory address of the start of the tree
     */
    static loadFromBinary(id : number, rom : BinaryView, address : number) : Tree
    {
        const tree = new Tree(id);
        const queue : Node[] = [tree.root];
        const leaves : Node[] = [];

        tree.deepestNode = queue[0];
        
        let readAddress : number = address;

        while (queue.length > 0) {
            let readByte : number = rom.readByte(readAddress++);

            for (let i = 0; i < 8 && queue.length > 0; ++i) {
                let node : Node = queue.pop() as Node;

                if ((readByte & 1) == 1) {
                    // Mark the current node as a leaf
                    leaves.push(node);
                    if (node.depth > tree.deepestNode.depth) tree.deepestNode = node;
                } else {
                    // Create child nodes and add them to the queue
                    const [left, right] = node.branch();
                    queue.push(right, left);
                }

                readByte >>= 1;
            }
        }

        // Map each of the leaves in the tree to a text character
        readAddress = address;
        let buffer : number[] = [];

        while (leaves.length > 0) {
            if (buffer.length == 0) {
                readAddress -= 3;
                const chunk = rom.read24bit(readAddress);
                buffer.push(chunk & 0xFFF);
                buffer.push(chunk >> 12);
            }

            const node = leaves.splice(0, 1)[0];
            node.data = buffer.pop();
            tree.compressionDict.set(node.data as number, node.path);
        }

        return tree;
    }
}