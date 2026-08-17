import type { ParseLineResult } from "./types";

export const regexIncludeMacro = /\.include\s+"([^\"]*)"/ig;


export function getFileDependencies(contents : string) : string[]
{
    const dependencies : string[] = [];
    contents.matchAll(regexIncludeMacro).forEach(match => {
        if (match[1]) dependencies.push(match[1]);
    });
    return dependencies;
}

export function preprocessFile(contents : string, source : string) : ParseLineResult[]
{
    return contents.split('\n')
        .map(line => line.split(/[;@]/)[0].trim())
        .map((line, i) => { return {line, lineNumber: (i + 1), source, error: [], params: [], extraData: 0 }; })
        .filter(obj => obj.line.length > 0);
}