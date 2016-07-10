/**
 * An example of the most basic kind of 2D visualization, to illustrate the expected format & API of a
 * skqw visualization plugin.
 */
let ctx;
let params = {
    hue: {
        value: 120,
        type: 'range',
        label: 'hue',
        min: 0,
        max: 360
    },
    showLines: {
        value: true,
        type: 'boolean',
        label: 'Show time series'
    }
};
let highs = [];
const DECAY = 20;

/**
 * The exported value must be an object with the following required properties:
 * - name: the name of this visualization
 * - author: the author's name
 * - init: a function that will be called when the vis is started, and performs
 *         any set-ups that are required by the vis. Typically it would minimally
 *         make a call to skqw.createCanvas().
 * - tick: a function that performs the actual animation. This function will be called
 *         by skqw from a requestAnimationFrame(), and therefore has access to a timestamp.
 *
 * Optional properties:
 * - params: exposes any user-configurable parameters for the vis.
 */
module.exports = {
    name: 'A Basic Visualization',
    author: 'Michael Bromley',
    init: init,
    tick: tick,
    params: params
};

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
    ctx.lineCap = 'round';
}

function tick(skqw) {
    let w = skqw.dimensions().width;
    let h = skqw.dimensions().height;
    let ft = skqw.sample().ft;
    let ts = skqw.sample().ts;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, w, h);
    drawBars(w, h, ft);
    if (params.showLines.value === true) {
        drawWave(w, h, ts);
    }
}

function drawWave(w, h, ts) {
    let length = ts.length,
        width = w / length;

    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsla(${params.hue.value + 30}, 80%, 50%, 0.5)`;
    ctx.lineWidth = h / 150;


    for(let i = 0; i < ts.length; i++) {
        let val = ts[i];
        let x = i * width;
        let y = h / 2 + val * 250;

        if (i === 0) {
            ctx.beginPath(x, y);
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
}

function drawBars(w, h, ft) {
    let length = ft.length;
    let width = w / length;

    for(let i = 0; i < ft.length; i++) {
        let val = ft[i];
        let x = i * width;
        let height = val * 250;
        if (!highs[i] || highs[i] < height) {
            highs[i] = height;
        } else {
            highs[i] -= DECAY;
        }
        let y = h - highs[i];
        let saturation = Math.log2(highs[i]) * 15 - 100;
        ctx.fillStyle = `hsla(${params.hue.value + saturation}, 50%, 50%, 0.8)`;

        ctx.fillRect(x, y, width - 2, highs[i]);
    }
}
