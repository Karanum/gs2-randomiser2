import { Dirent, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import { cwd } from "node:process";
import { getFileDependencies, preprocessFile, regexIncludeMacro } from "$lib/assembly/preprocessor";
import { hash } from "node:crypto";
import type { ParseLineResult, Script } from "$lib/assembly/types";
import { printResolutionErrors } from "$lib/assembly/errors";
import { build } from "$lib/assembly/assembler";


const scriptExtensions = ['asm', 'inc'];
const rootScriptExtensions = ['asm'];

const readPath = join(cwd(), 'src/assembly/src');
const writePath = join(cwd(), 'src/assembly/out');
const cachePath = join(cwd(), 'src/assembly/.cache');

const validScripts : Record<string, Script> = {};
const scriptQueue : Script[] = [];


async function collectFiles(path : string) 
{
    return readdir(path, { withFileTypes: true });
}

function processScriptFile(relPath : string, dirent : Dirent<string>) : Script
{
    const contents = readFileSync(join(readPath, relPath, dirent.name), 'utf-8');
    const scriptHash = hash('sha256', contents);
    const dependencies = getFileDependencies(contents);

    return { relPath, dirent, contents, hash: scriptHash, dependencies };
}

async function gatherValidScripts()
{
    const fileQueue : [string, Dirent<string>][] = (await collectFiles(readPath)).map(f => ['', f]);

    while (fileQueue.length > 0) {
        const [relPath, file] = fileQueue.shift()!;

        // If the file is a symlink, ignore it to avoid escaping the script directory
        if (file.isSymbolicLink()) continue;

        // If the file is a directory, add all of its contents to the file queue
        if (file.isDirectory()) {
            const innerFiles = (await collectFiles(join(file.parentPath, file.name)))
                .map<[string, Dirent<string>]>(f => [ join(relPath, file.name), f ]);
            fileQueue.push(...innerFiles);
            continue;
        }

        // If the file does not have a valid extension, it is skipped
        const ext = file.name.split('.').pop()!;
        if (!scriptExtensions.includes(ext.toLowerCase())) continue;

        // Process the script file, and if it is a valid root-level script, add it to the build queue
        const script = processScriptFile(relPath, file);
        validScripts[join(relPath, file.name)] = script;
        if (rootScriptExtensions.includes(ext.toLowerCase())) {
            scriptQueue.push(script);
        }
    }
}

function toOutputPath(relPath : string, script : string) : string
{
    const scriptName = script.slice(0, script.lastIndexOf('.'));
    return join(writePath, relPath, scriptName + '.bin');
}

function toCachePath(relPath : string, script : string) : string
{
    const scriptName = script.slice(0, script.lastIndexOf('.'));
    return join(cachePath, relPath, scriptName + '.json');
}

function shouldBuild(script : Script, cycleGuard : Set<string> = new Set()) : boolean
{
    const scriptCachePath = toCachePath(script.relPath, script.dirent.name);

    // Guard against cyclical script dependencies
    if (cycleGuard.has(scriptCachePath)) {
        console.error('[ERROR] Cyclical dependency detected containing script file ' + join(script.relPath, script.dirent.name) + '!');
        return false;
    }
    cycleGuard.add(scriptCachePath);

    // If the script has no cache file, it must be new
    if (!existsSync(scriptCachePath)) {
        return true;
    }

    // Check against the file hash
    const scriptCache = JSON.parse(readFileSync(scriptCachePath, 'utf-8'));
    if (script.hash !== scriptCache.hash) {
        return true;
    }

    // If the script itself is unchanged, recursively check its dependencies
    for (let i = 0; i < script.dependencies.length; ++i) {
        const depPath = relative(readPath, join(script.dirent.parentPath, script.dependencies[i]));
        const depScript = validScripts[depPath];
        if (depScript === undefined) { continue; }

        if (shouldBuild(depScript, new Set(cycleGuard))) {
            return true;
        }
    }

    // If none of the conditions are met, don't build this script
    return false;
}

function resolveDependencies(script : Script) : ParseLineResult[]
{
    const lines = preprocessFile(script.contents, join(script.relPath, script.dirent.name));

    for (let i = lines.length - 1; i >= 0; --i) {
        const line = lines[i];
        line.line.matchAll(regexIncludeMacro).forEach(match => {
            // Try to resolve dependency to a valid script file
            const depPath = relative(readPath, join(script.dirent.parentPath, match[1]));
            const depScript = validScripts[depPath];
            if (depScript === undefined) {
                line.error.push(`Could not resolve "${depPath}" to a valid Assembly script file!`);
                return;
            }

            // Recursively process the dependency and splice the result into the current script
            lines.splice(i + 1, 0, ...resolveDependencies(depScript));
        });
    }

    return lines;
}


(async () => {
    const fullRebuild = (process.argv[2] == 'rebuild');

    // Gather all valid script files and determine which scripts need to be built
    await gatherValidScripts();
    const changedScripts = fullRebuild ? scriptQueue : scriptQueue.filter(script => shouldBuild(script));

    // When doing a full rebuild, completely clear the out and cache directories
    if (fullRebuild) {
        rmSync(writePath, { recursive: true, force: true });
        rmSync(cachePath, { recursive: true, force: true });
        mkdirSync(writePath, { recursive: true });
        mkdirSync(cachePath, { recursive: true });
    }

    // Attempt to build all queued scripts
    let successes = 0;
    changedScripts.forEach(script => {
        console.log('> Building script: ', join(script.relPath, script.dirent.name));

        // Ensure that the required output directories exist
        const buildDir = join(writePath, script.relPath);
        const cacheDir = join(cachePath, script.relPath);
        if (!existsSync(buildDir)) mkdirSync(buildDir, { recursive: true });
        if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

        // Resolve dependencies, and display any errors that arise
        const resolvedContents = resolveDependencies(script);
        const errorLines = resolvedContents.filter(line => line.error.length > 0);
        if (errorLines.length > 0) {
            printResolutionErrors(join(script.relPath, script.dirent.name), errorLines);
            return;
        }

        // Attempt to build the file
        const parseResult = build(resolvedContents);
        if (parseResult !== undefined) {
            const metadata = { hash: script.hash, exports: parseResult.exports };
            writeFileSync(toOutputPath(script.relPath, script.dirent.name), parseResult.data);
            writeFileSync(toCachePath(script.relPath, script.dirent.name), JSON.stringify(metadata), { encoding: 'utf-8' });
            ++successes;
        }
    });

    // Update cached hashes for non-root scripts if there were no build errors
    // There ought to be a better way to do this, but this latest rewrite was already convoluted enough...
    if (changedScripts.length == successes) {
        Object.keys(validScripts).forEach(scriptName => {
            const ext = scriptName.split('.').pop()!;
            if (!rootScriptExtensions.includes(ext)) {
                const script = validScripts[scriptName];
                const metadata = { hash: script.hash };
                const cacheDir = join(cachePath, script.relPath);
                if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
                writeFileSync(toCachePath(script.relPath, script.dirent.name), JSON.stringify(metadata), { encoding: 'utf-8' });
            }
        });
    }

    // Report results
    console.log(`> Finished building ${changedScripts.length} files with ${changedScripts.length - successes} failures!`);
})();