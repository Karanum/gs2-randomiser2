import { styleText } from "node:util";
import type { ParseLineResult } from "./types";

export function printResolutionErrors(scriptName : string, lines : ParseLineResult[]) 
{
    console.log(styleText('red', `Could not build file "${scriptName}" due to resolution error(s):`));
    printErrors(lines);
}

export function printParsingErrors(scriptName : string, lines : ParseLineResult[]) 
{
    console.log(styleText('red', `Could not build file "${scriptName}" due to parsing error(s):`));
    printErrors(lines);
}

export function printAssemblyErrors(scriptName : string, lines : ParseLineResult[]) 
{
    console.log(styleText('red', `Could not build file "${scriptName}" due to assembly error(s):`));
    printErrors(lines);
}

function printErrors(lines : ParseLineResult[])
{
    lines.forEach(line => {
        line.error.forEach(error => {
            console.log(styleText('red', `> Line ${line.lineNumber} in file ${line.source}:`));
            console.log(styleText('red', `    ${error}`));
        });
    });
}