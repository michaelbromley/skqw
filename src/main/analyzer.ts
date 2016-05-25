import {Subject} from 'rxjs';
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
        let ft = fourierTransform(ts);
        this.normalize(ft);
        this.sample$.next({ft, ts});
    }

    private normalize(ft: number[]): void {
        var control = this.mean(ft);
        for (var i = 0; i < ft.length; i++) {
            var delta = control - ft[i];
            var factor = Math.max(delta * 300, 1);
            ft[i] += ft[i] * factor * 100;

            /*let factor = (control / ft[i]);
             ft[i] = ft[i] * 10 + ft[i] * factor * 10;*/
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
