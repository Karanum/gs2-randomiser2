import { readFileSync } from "node:fs";

const exportsCache : Record<string, Record<string, number>> = {};


/**
 * Returns the compiled binary of an assembly script file.
 * Returns an empty `Buffer` if the file could not be opened.
 * @param script The path of the script without file extension, relative to the assembly output folder
 */
export function getAssemblyScript(script : string) {
    try {
        const scriptFile = readFileSync('../assembly/out/' + script + '.bin');
        return scriptFile;
    } catch (err) {
        console.error(err);
        return new Uint8Array() as Buffer<ArrayBuffer>;
    }
}

/**
 * Returns an address pointer exported by one of the assembly script files
 * using the `.export` custom macro. Will return 0 if either the script or
 * the label name do not exist in the exports file.
 * @param script The path of the script without file extension, relative to the assembly output folder
 * @param name The name of the exported label
 */
export function getAssemblyExport(script : string, name : string) : number {
    const cachedExports = exportsCache[script];
    if (cachedExports !== undefined) {
        return cachedExports[name] ?? 0;
    }

    // Fetch from file if not cached yet
    try {
        const cacheFile = JSON.parse(readFileSync('../assembly/.cache/' + script + '.json', 'utf-8'));
        if (cacheFile.exports === undefined) {
            return 0;
        }

        exportsCache[script] = cacheFile.exports;
        return cacheFile.exports[name] ?? 0;
    } catch (err) {
        console.error(err);
        return 0;
    }
}