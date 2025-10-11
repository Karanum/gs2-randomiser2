import { MersenneTwister } from 'fast-mersenne-twister';

/**
 * Pseudo-random number generator helper class.
 */
export class PRNG
{
    private mersenne;

    constructor (seed : number|number[])
    {
        this.mersenne = MersenneTwister(seed);
    }

    randomFraction () : number 
    {
        return this.mersenne.random();
    }

    randomInt (max: number) : number 
    {
        return Math.floor(this.mersenne.random() * max);
    }

    randomBetween (min: number, max: number) : number 
    {
        return this.mersenne.random() * (max - min) + min;
    }

    randomArrayElement<T> (array : Array<T>, splice : boolean = false) : T
    {
        if (splice) {
            return array.splice(this.randomInt(array.length), 1)[0];
        }
        return array[this.randomInt(array.length)];
    }

    randomWeighted (weights : number[], totalWeight : number|undefined = undefined) : number
    {
        if (totalWeight == undefined) {
            totalWeight = weights.reduce((acc, item) => acc + item, 0);
        }

        let targetWeight = this.randomFraction() * totalWeight;
        let result = 0;

        for (let i = 0; i < weights.length && targetWeight > 0; ++i) {
            result = i;
            targetWeight -= weights[i];
        }
        return result;
    }
}