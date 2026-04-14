import { BinaryView } from "../randomiser/binary_view";

function decompressC0(src : BinaryView, srcPos : number) : BinaryView
{
    //TODO: Implement
    return new BinaryView();
}

function decompressC1(src : BinaryView, srcPos : number) : BinaryView
{
    //TODO: Implement
    return new BinaryView();
}

export function decompress(src : BinaryView, srcPos : number, suppressLog : boolean = false) : BinaryView 
{
    const format = src.readByte(srcPos++);
    switch (format) {
        case 0:
            return decompressC0(src, srcPos);
        case 1:
            return decompressC1(src, srcPos);
        default:
            if (!suppressLog) {
                console.warn(`Decompression of format C-${format} is not yet supported!`);
            }
            return new BinaryView();
    }
}