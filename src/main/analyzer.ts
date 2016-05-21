import {Subject} from 'rxjs';
import {ISample} from '../common/models';
const coreAudio = require('node-core-audio');
const FFT = require('fft');
const engine: any = coreAudio.createNewAudioEngine();
const BUFFER_SIZE = 128;
const DEFAULT_OPTIONS = {
    framesPerBuffer: BUFFER_SIZE,
    inputDevice: 0,
    interleaved: false
};
engine.setOptions(DEFAULT_OPTIONS);

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
    private devices: { [id: number]: string } = {};

    constructor() {
        engine.addAudioCallback(this.processAudio.bind(this));
        this.lastUpdate = +new Date() * 1;
        
        let numDevices = engine.getNumDevices();
        for (let i = 0; i < numDevices; i ++) {
            this.devices[i] = engine.getDeviceName(i);
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
        let ts = (this.inputBuffer[0]);
        this.fft.simple(this.fftBuffer, ts, 'complex');
        let ft = Array.prototype.slice.call(this.fftBuffer.slice(0, BUFFER_SIZE / 2));

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
