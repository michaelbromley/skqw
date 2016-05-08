'use strict';

const coreAudio = require('node-core-audio');
const FFT = require('fft');
const BUFFER_SIZE = 128;

const engine = coreAudio.createNewAudioEngine();
let inputBuffer;
let fft = new FFT.complex( BUFFER_SIZE / 2, false );
let fftBuffer = new Float32Array(BUFFER_SIZE);

// debug - calculate frequency of audiocallback calls
var fpsFilter = 50;
var fps = 0, now, lastUpdate = (new Date)*1;

engine.setOptions({
    framesPerBuffer: BUFFER_SIZE,
    inputDevice: 1,
    interleaved: false
});
engine.addAudioCallback(processAudio);

/**
 * Apply a Fast Fourier Transform (fft) to the time series data provided
 * by the core-audio module
 *
 * { ft: fourier transform array, ts: time series array }
 *
 * @param {Array} _inputBuffer
 */
function processAudio(_inputBuffer) {

    if (!inputBuffer) {
        setTimeout(sendSample, 20);
    }

    inputBuffer = _inputBuffer;

    var thisFrameFPS = 1000 / ((now=new Date*1) - lastUpdate);
    if (now!=lastUpdate){
        fps += (thisFrameFPS - fps) / fpsFilter;
        lastUpdate = now;
    }
    if (now % 10 === 0) {
        console.log('socket frequency: ' + fps);
    }
}

function sendSample() {
    var ts = new Float32Array(inputBuffer[0]), ft;
    fft.simple(fftBuffer, ts, 'complex');
    ft = fftBuffer.slice(0, BUFFER_SIZE / 2);

    console.log('sample', { ft, ts } );

    setTimeout(sendSample, 100);
}

module.exports = {
    foo: 'bar'
};
