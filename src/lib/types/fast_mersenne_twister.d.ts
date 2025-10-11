declare module "fast-mersenne-twister" {
    export function MersenneTwister(seed : number|number[]): {
        genrand_int32: () => number,
        genrand_int31: () => number,
        genrand_real1: () => number,
        genrand_real2: () => number,
        genrand_real3: () => number,
        genrand_res53: () => bigint,

        randomNumber: () => number,
        random31Bit: () => number,
        randomInclusive: () => number,
        random: () => number,
        randomExclusive: () => number,
        random53Bit: () => bitint
    };
}
