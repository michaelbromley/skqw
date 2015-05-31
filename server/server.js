var coreAudio = require('node-core-audio'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    FFT = require('fft'),
    BUFFER_SIZE = 256,

    engine = coreAudio.createNewAudioEngine(),
    inputBuffer,
    fft = new FFT.complex( BUFFER_SIZE / 2, false ),
    fftBuffer = new Float32Array(BUFFER_SIZE);

// debug - calculate frequency of audiocallback calls
var fpsFilter = 50;
var fps = 0, now, lastUpdate = (new Date)*1;

engine.setOptions({
    framesPerBuffer: BUFFER_SIZE,
    inputDevice: 1,
    interleaved: false
});
engine.addAudioCallback(processAudio);

app.use('/lib', express.static('lib'));
app.use('/node_modules', express.static('node_modules'));
app.use('/visualizations', express.static('visualizations'));
app.use('/client', express.static('client'));
app.get('/', injectVisScripts);
io.on('connection', function(socket){});
http.listen(3000);

/**
 * Inject any scripts from the visualizations folder into the client index.html file
 * and then serves the modified file.
 */
function injectVisScripts(req, res) {
    var html = fs.readFileSync(__dirname + '/../client/index.html', 'utf8');
    var $ = cheerio.load(html),
        appendToBody = appendToElement($('body'));

    glob(__dirname + '/../visualizations/**/*.js', function(err, files) {
        files.forEach(appendToBody);
        res.send($.html());
    });
}

/**
 * Returns a function that appends script element with a normalized path based on `file` to the
 * specified element.
 *
 * @param {Element} element
 * @returns {Function}
 */
function appendToElement(element) {
    return function (file) {
        var src = path.normalize(file).replace(path.normalize(__dirname + '/../visualizations'), '');
        element.append('<script src="visualizations/' + src + '">');
    }
}

/**
 * Apply a Fast Fourier Transform (fft) to the time series data provided
 * by the core-audio module, and send this data through a web socket
 * to any listening clients in the format:
 *
 * { ft: fourier transform array, ts: time series array }
 *
 * @param {Array} inputBuffer
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

    io.emit('sample', {ft: ft, ts: ts} );

    setTimeout(sendSample, 20);
}