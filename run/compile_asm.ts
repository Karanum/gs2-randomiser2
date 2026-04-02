import { Dirent, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { build } from "../src/lib/assembly/assembler";

async function collectFiles(path : string) {
    return readdir(path, { withFileTypes: true });
}

(async () => {
    const readPath = join(cwd(), 'src/assembly/src');
    const writePath = join(cwd(), 'src/assembly/out');

    let files : [string, Dirent<string>][] = (await collectFiles(readPath)).map(f => ['', f]);
    const validScripts : [string, Dirent<string>][] = [];
    
    // Recursively go over everything in the read directory until all .ASM files have been found
    while (files.length > 0) {
        const file = files.splice(0, 1)[0];

        if (file[1].isDirectory()) {
            // If this script finds a symlink, show a warning and skip it (or risk getting stuck in a recursive loop)
            if (file[1].isSymbolicLink()) {
                console.warn("[WARN] Symbolic links in script directory:", join(file[1].parentPath, file[1].name));
                continue;
            }

            // If this script finds a directory, scan its contents and add them to the queue
            const innerFiles = await collectFiles(join(file[1].parentPath, file[1].name));
            files = files.concat( innerFiles.map(f => [ join(file[0], file[1].name), f ]) );
            continue;
        }

        // If a file does not have the .ASM extension, skip it
        if (!file[1].name.toLowerCase().endsWith('.asm')) continue;

        // Save the file for parsing
        validScripts.push(file);
    }

    let builds = 0;
    let successes = 0;

    // Go over all of the script files and determine if they need to be (re)built
    validScripts.forEach(([relPath, script]) => {
        const buildPath = join(writePath, relPath);
        const outputName = script.name.substring(0, script.name.length - 4) + '.bin';

        if (!existsSync(join(buildPath, outputName))) {
            // If the output file doesn't exist, check if the directory needs to be created
            if (!existsSync(buildPath)) {
                mkdirSync(buildPath, { recursive: true });
            }
        } else {
            // If the output file does exist, check if the script was modified since last rebuild
            const scriptStats = statSync(join(script.parentPath, script.name));
            const outputStats = statSync(join(buildPath, outputName));
            
            if (scriptStats.mtime < outputStats.mtime) return;
        }
        
        // Attempt to build the file
        console.log('> Building file: ', join(relPath, script.name));
        const scriptFile = readFileSync(join(readPath, relPath, script.name), 'utf-8');
        const parseResult = build(scriptFile);
        ++builds;

        if (parseResult != undefined) {
            writeFileSync(join(buildPath, outputName), parseResult);
            ++successes;
        }
    });

    console.log(`> Finished building ${builds} files with ${builds - successes} failures!`);
})();