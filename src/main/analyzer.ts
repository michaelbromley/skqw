import {Subject} from 'rxjs/Subject';
import {ISample} from '../common/models';
const coreAudio = require('node-core-audio');
const fourierTransform = require('fourier-transform');
const engine: any = coreAudio.createNewAudioEngine();
const BUFFER_SIZE = 256;
const DEFAULT_OPTIONS = {
    framesPerBuffer: BUFFER_SIZE,
    inputDevice: 0,
    interleaved: false,
    sampleRate: 8000
};
engine.setOptions(DEFAULT_OPTIONS);
engine.setSampleRate(60);

/**
 * Low-level interface to the hardware sound device using node-core-audio.
 * Supplies a stream of ISample object which can then be passed to a
 * visualization script for rendering to canvas.
 */
export class Analyzer {
    sample$ = new Subject<ISample>();
    fps: number = 0;

    private isActive: boolean = false;
    private inputBuffer: number[][];
    private fpsFilter: number = 50;
    private now: number;
    private lastUpdate: number;
    private devices: { [id: number]: string } = {};
    private gain: number = 100;
    private normalizationEnabled: boolean = true;

    constructor() {
        engine.addAudioCallback(this.processAudio.bind(this));
        this.lastUpdate = +new Date() * 1;

        let numDevices = engine.getNumDevices();
        for (let i = 0; i < numDevices; i ++) {
            let name = engine.getDeviceName(i).trim();
            if (name && name !== '') {
                this.devices[i] = name;
            }
        }
    }

    /**
     * Set the options of the audio engine.
     */
    setOptions(options) {
        let merged = Object.assign({}, DEFAULT_OPTIONS, options);
        try {
            engine.setOptions(merged);
        } catch (ex) {
            // log it?
        }
    }

    setGain(val: number) {
        this.gain = val;
    }

    /**
     * Set the sample rate of the audio sampler
     */
    setSampleRate(frequencyInHerz: number) {
        engine.setSampleRate(+frequencyInHerz);
    }

    toggleNormalization(val: boolean) {
        this.normalizationEnabled = val;
    }

    /**
     * Start processing audio
     */
    start() {
        this.isActive = true;
    }

    /**
     * Stop processing audio
     */
    stop() {
        this.isActive = false;
    }

    listAudioDevices(): any {
        return this.devices;
    }

    /**
     * Apply a Fast Fourier Transform (fft) to the time series data provided
     * by the core-audio module
     */
    private sendSample() {
        let ts = this.normalizeTs(this.inputBuffer[0]);
        let ft = fourierTransform(ts);
        this.normalize(ft);
        this.sample$.next({ft, ts});
    }

    private normalizeTs(ts: number[]): number[] {
        for (let i = 0; i < ts.length; i++) {
            ts[i] = ts[i] / 100 * this.gain;
        }
        return ts;
    }

    /**
     * Normalize the fourier transform array by reducing the peaks in proportion to
     * how far beyond the mean they are.
     */
    private normalize(ft: number[]): void {
        let mean = this.mean(ft);

        for (let i = 0; i < ft.length; i++) {
            let normalization = 0;
            if (this.normalizationEnabled) {
                let multiples = ft[i] / mean;
                if (7 < multiples) {
                    normalization = ft[i] / 1.4;
                } else if (6 < multiples) {
                    normalization = ft[i] / 1.8;
                } else if (5 < multiples) {
                    normalization = ft[i] / 2;
                } else if (4 < multiples) {
                    normalization = ft[i] / 3;
                } else if (3 < multiples) {
                    normalization = ft[i] / 4;
                } else if (2 < multiples) {
                    normalization = ft[i] / 5;
                } else if (1 < multiples) { 
                    normalization = ft[i] / 7;
                }
            }
            ft[i] = (ft[i] - normalization) * this.gain;
        }
    }
  
    private mean(arr: number[]): number {
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
        return sum / arr.length;
    }

    private processAudio(_inputBuffer) {
        if (!this.isActive) {
            return;
        }

        this.inputBuffer = _inputBuffer;
        this.sendSample();
        this.updateFPS();
    }

    /**
     * Update the fps value, which can be used for performance analysis.
     */
    private updateFPS() {
        let thisFrameFPS = 1000 / ((this.now = +new Date * 1) - this.lastUpdate);
        if (this.now != this.lastUpdate) {
            this.fps += (thisFrameFPS - this.fps) / this.fpsFilter;
            this.lastUpdate = this.now;
        }
    }
}
