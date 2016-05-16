import {Subject} from 'rxjs';
const coreAudio = require('node-core-audio');
const FFT = require('fft');
const BUFFER_SIZE = 128;
const engine: any = coreAudio.createNewAudioEngine();
engine.setOptions({
    framesPerBuffer: BUFFER_SIZE,
    inputDevice: 1,
    interleaved: false
});

/**
 * { ft: fourier transform array, ts: time series array }
 */ 
export interface ISample {
    ft: Float32Array;
    ts: Float32Array;
}

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
    private fft = new FFT.complex( BUFFER_SIZE / 2, false );
    private fftBuffer = new Float32Array(BUFFER_SIZE);
    private fpsFilter: number = 50;
    private now: number;
    private lastUpdate: number;

    constructor() {
        engine.addAudioCallback(this.processAudio.bind(this));
        this.lastUpdate = +new Date() * 1;
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

    /**
     * Apply a Fast Fourier Transform (fft) to the time series data provided
     * by the core-audio module
     */
    private sendSample() {
        let ts = new Float32Array(this.inputBuffer[0]);
        this.fft.simple(this.fftBuffer, ts, 'complex');
        let ft = this.fftBuffer.slice(0, BUFFER_SIZE / 2);

        this.sample$.next({ ft, ts });
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
