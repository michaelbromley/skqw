const { ExponentialSmoother } = require('skqw-utils');
const { createCanvas, getSample, getDimensions } = require('skqw-core');

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
    waveHeight: {
        value: 3,
        type: 'range',
        label: 'Wave Height',
        min: 1,
        max: 10
    },
};

const smoothFt = new ExponentialSmoother(0.3);
const smoothTs = new ExponentialSmoother(0.8);
const smoothVol = new ExponentialSmoother(0.1);

function init() {
    ctx = createCanvas().getContext('2d');

}

function tick(skqw) {
    const { width, height } = getDimensions();
    const { ft, ts } = getSample();

    ctx.globalCompositeOperation = 'source-over';
    drawBg(width, height, ft);

    ctx.globalCompositeOperation = 'screen';
    drawBars(width, height, ft);
    ctx.globalCompositeOperation = 'source-over';
    drawWave(width, height, ts);
}

function drawBg(w, h, ft) {
    let vol = smoothVol.sumAndProcess(ft);
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, `hsla(${params.hue.value + 50}, 50%, 5%, 0.3)`);
    gradient.addColorStop(1, `hsla(${params.hue.value + 50}, 100%, ${Math.log10(vol / 2 + 2) * 10}%, 0.8)`);
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
    let bins = smoothTs.process(ts);

    for(let i = 0; i < bins.length; i++) {
        const val = bins[i] * params.waveHeight.value * h / 800;
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

    let bins = smoothFt.process(ft);

    for(let i = 0; i < bins.length; i++) {
        const val = bins[i];
        const x = i * barWidth;
        const height = Math.log10(val + 1) * h;

        const y = h - height;
        const saturation = Math.log2(1 + height) * 40;
        ctx.fillStyle = `hsla(${params.hue.value + saturation}, 50%, 50%, 0.8)`;

        ctx.fillRect(x, y, barWidth - 1, height);
    }
}

module.exports = {
    name: 'Bars',
    init,
    tick,
    params
};
