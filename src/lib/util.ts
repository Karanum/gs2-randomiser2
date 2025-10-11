/**
 * Clamps a value between a minimum and maximum.
 * @returns The clamped value, or `NaN` if `min > max`
 */
export function clamp(val : number, min : number, max : number) : number {
    if (min > max) return NaN;
    if (val <= min) return min;
    if (val >= max) return max;
    return val;
}

/**
 * Times the execution of a callback function and prints the result.
 * @param func The function to time
 * @param preMessage A message to display before running the callback function, does not include an automatic newline
 * @returns The return value of the callback function
 */
export function timeFunction<T>(func : () => T, preMessage : string) : T {
    process.stdout.write(preMessage);

    const start = Date.now();
    const result = func();

    const elapsed = Date.now() - start;
    process.stdout.write(` Done! (${elapsed} ms)\n`);
    return result;
}
