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
let volHigh = 0;
const VOL_DECAY = 2;
const DECAY = 20;

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
    setTimeout(() => {
        ctx.lineCap = 'round';
    });
}

function tick(skqw) {
    const { width, height } = skqw.dimensions;
    const { ft, ts } = skqw.sample;

    ctx.globalCompositeOperation = 'source-over';
    drawBg(width, height, ft);

    ctx.globalCompositeOperation = 'screen';
    drawBars(width, height, ft);
    if (params.showLines.value === true) {
        ctx.globalCompositeOperation = 'source-over';
        drawWave(width, height, ts);
    }
}

function add(a, b) {
    return a + b;
}

function drawBg(w, h, ft) {
    const vol = ft.reduce(add, 0);
    const delta = vol - volHigh;
    if (volHigh < vol) {
        volHigh += delta / 20;
    }
    if (VOL_DECAY < volHigh) {
        volHigh -= VOL_DECAY;
    }
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `hsla(${params.hue.value + 50}, 50%, 5%, 0.3)`);
    gradient.addColorStop(1, `hsla(${params.hue.value + 50}, 100%, ${Math.log10(volHigh / 2 + 2) * 10}%, 0.8)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
}

function drawWave(w, h, ts) {
    const length = ts.length;
    const interval = w / length;

    ctx.lineCap = 'round';
    ctx.strokeStyle = `hsla(${params.hue.value + 40}, 100%, 60%, 0.7)`;
    ctx.lineWidth = h / 250;

    let p1;
    let p2;
    let mid;

    for(let i = 0; i < ts.length; i++) {
        const val = ts[i];
        p1 = linePoint(i, interval, val, h);
        p2 = linePoint(i + 1, interval, val, h);
        if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
        } else {
            mid = midPoint(p1, p2);
            ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
        }
    }
    ctx.stroke();
}

function linePoint(i, interval, val, height) {
    return {
        x: i * interval,
        y: height / 2 + val * 100
    };
}

function midPoint(p1, p2) {
    return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
    };
}


function drawBars(w, h, ft) {
    const length = ft.length;
    const barWidth = w / length;

    for(let i = 0; i < ft.length; i++) {
        const val = ft[i];
        const x = i * barWidth;
        const height = Math.log10(val + 1) * h;
        if (!highs[i] || highs[i] < height) {
            highs[i] = height;
        } else {
            highs[i] -= DECAY;
        }
        const y = h - highs[i];
        const saturation = Math.log2(1 + highs[i]) * 40;
        ctx.fillStyle = `hsla(${params.hue.value + saturation}, 50%, 50%, 0.8)`;

        ctx.fillRect(x, y, barWidth - 1, highs[i]);
    }
}

function paramChange(skqw, change) {
    params[change.paramKey].value = change.newValue;
}

module.exports = {
    name: 'Bars',
    init,
    tick,
    paramChange,
    params
};
