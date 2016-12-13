import {getSample} from './skqw-core';
import {ExponentialSmoother} from './exponential-smoother';

function sum(a, b) { return a + b }

// Let's assume that the maximum BPM we can detect is 180.
// So we can set a minimum interval in milliseconds.
const MIN_INTERVAL = 60 / 180 * 1000;

/**
 * Does what it says on the tin. Experimental and a rather naive implementation at the moment.
 */
export class BeatDetector {

    peak: number = 0;
    lastBeatTimestamp: number;
    intervalBuffer = [];
    valueBuffer = [];
    bufferSize = 30;
    smoothedKick = new ExponentialSmoother(0.1);

    constructor(private decay: number = 0.5, private threshold: number = 0.1) {}

    /**
     * Checks for the presence of a beat, and returns a 1 or a 0.
     * 1 = beat
     * 0 = no beat
     */
    checkForBeat(timestamp: number): number {
        if (typeof timestamp !== 'number') {
            throw new Error(`timestamp argument must be a number, got [${typeof timestamp}]`);
        }
        // Since analyzer.js uses a sample rate of 8000, and the sample size is 256, we have 128 bin in our FFT.
        // So to calculate the frequency represented by a bin i, we use 8000 / 128 * i.
        // We will focus on bins 2 and 3 only, which should cover 62.5 to 187.5 hz.
        let ft = getSample().ft;
        let beatVal = 0;

        let currentVal = this.smoothedKick.sumAndProcess([ft[1], ft[2]]);
        let mean = this.meanValue() || 0.5;
        let normalizedCurrentValue = currentVal / mean;
        let normalizedPeak = this.peak / mean;
        let normalizedDelta = normalizedCurrentValue - normalizedPeak;
        if (this.threshold < normalizedDelta) {
            this.peak = currentVal;
            let interval: number;
            if (!this.lastBeatTimestamp) {
                interval = 0;
            } else {
                interval = timestamp - this.lastBeatTimestamp;
            }
            if (interval === 0 || MIN_INTERVAL < interval) {
                beatVal = 1;
                this.lastBeatTimestamp = timestamp;
                this.intervalBuffer.push(interval);
                if (this.bufferSize <= this.intervalBuffer.length) {
                    this.intervalBuffer.shift();
                }
                this.valueBuffer.push(currentVal);
                if (this.bufferSize <= this.valueBuffer.length) {
                    this.valueBuffer.shift();
                }
            }
        }

        if (this.decay < this.peak) {
            this.peak -= this.decay;
        }

        return beatVal;
    }

    /**
     * Not sure what use it is to give the BPM, and currently this is rather inaccurate. A better
     * approach is using a histogram as outlined here: https://github.com/JMPerez/beats-audio-api/
     */
    getBpm(): number {
        if (0 < this.intervalBuffer.length) {
            let meanInterval = this.intervalBuffer.reduce(sum) / this.intervalBuffer.length;
            return 60000 / meanInterval;
        } else {
            return 0;
        }
    }

    private meanValue(): number {
        if (0 < this.valueBuffer.length) {
            return this.valueBuffer.reduce(sum) / this.valueBuffer.length
        } else {
            return 0;
        }
    }

}