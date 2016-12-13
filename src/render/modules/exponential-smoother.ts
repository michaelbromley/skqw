function sum(a, b) { return a + b }

/**
 * An implementation of an exponential smoothing filter (https://en.wikipedia.org/wiki/Exponential_smoothing)
 * The purpose is to reduce the inherent noise in the audio signal to produce a smoother, more even output.
 */
export class ExponentialSmoother {

    set smoothingFactor(val: any) {
        if (typeof val !== 'number') {
            val = parseFloat(val);
        }
        if (val < 0 || 1 < val) {
            throw new Error(`The smoothingFactor must be a number between 0 and 1. Got ${val}`);
        }
        this.alpha = val;
    }
    private alpha: number;

    private outputArray: number[] = [];
    private outputSum: number = 0;

    constructor(smoothingFactor: number) {
        this.smoothingFactor = smoothingFactor;
    }

    process(input: number[]): number[] {
        let length = input.length;
        if (this.outputArray.length !== length) {
            // initialize the output array to the correct length
            this.outputArray = Array.from({ length }, () => 0);
        }

        for (let i = 0; i < length; i++) {
            let delta = input[i] - this.outputArray[i];
            this.outputArray[i] += delta * this.alpha;
        }

        return this.outputArray;
    }

    sumAndProcess(input: number[]): number {
        let inputSum = input.reduce(sum);
        let delta = inputSum - this.outputSum;
        this.outputSum += delta * this.alpha;
        return this.outputSum;
    }
}
