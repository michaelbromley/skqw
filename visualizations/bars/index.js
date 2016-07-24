/**
 * A pretty simple visualization.
 *
 * Author: Michael Bromley
 * Version: 1
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

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
    ctx.lineCap = 'round';
}

function tick(skqw) {
    const { width, height } = skqw.dimensions;
    const { ft, ts } = skqw.sample;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, width, height);
    drawBars(width, height, ft);
    if (params.showLines.value === true) {
        drawWave(width, height, ts);
    }
}

function paramChange(change) {
    params[change.paramKey].value = change.newValue;
}

function drawWave(w, h, ts) {
    const length = ts.length;
    const width = w / length;

    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsla(${params.hue.value + 30}, 80%, 50%, 0.5)`;
    ctx.lineWidth = h / 150;


    for(let i = 0; i < ts.length; i++) {
        const val = ts[i];
        const x = i * width;
        const y = h / 2 + val * 250;

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
    const length = ft.length;
    const width = w / length;

    for(let i = 0; i < ft.length; i++) {
        const val = ft[i];
        const x = i * width;
        const height = val * 250;
        if (!highs[i] || highs[i] < height) {
            highs[i] = height;
        } else {
            highs[i] -= DECAY;
        }
        const y = h - highs[i];
        const saturation = Math.log2(highs[i]) * 15 - 100;
        ctx.fillStyle = `hsla(${params.hue.value + saturation}, 50%, 50%, 0.8)`;

        ctx.fillRect(x, y, width - 2, highs[i]);
    }
}

module.exports = {
    name: 'Bars',
    init,
    tick,
    paramChange,
    params
};
