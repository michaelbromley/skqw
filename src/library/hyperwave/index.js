/**
 * Author: Michael Bromley
 */
const {createCanvas, getSample, getDimensions} = require('skqw-core');
 
 
let ctx;
let params = {
    smoothing: {
        value: 5,
        type: 'range',
        label: 'Smoothing',
        min: 1,
        max: 10
    },
    hue: {
        value: 174,
        type: 'range',
        label: 'Hue',
        min: 0,
        max: 359
    },
    spread: {
        value: 15,
        type: 'range',
        label: 'Spread',
        min: 0,
        max: 100,
        step: 5
    },
};
let minDimension = 0;
let acc = 0;
let counter = 0;
let ctxBuffer;

function init() {
    ctx = createCanvas().getContext('2d');
    ctxBuffer = document.createElement('canvas').getContext('2d');
    resize();
}

function tick() {
    const { width, height } = getDimensions();
    const { ft, ts } = getSample();

    let volume = 0;
    for (let i = 0; i < ft.length; i ++) {
        volume += ft[i];
    }
    let delta = volume - acc;
    acc += delta / 50;

    ctxBuffer.save();
    ctxBuffer.clearRect(-width / 2, -height / 2, width, height);
    ctxBuffer.globalAlpha = 0.99;
    ctxBuffer.scale(0.99, 0.99);
    ctxBuffer.drawImage(ctx.canvas, -width / 2, -height / 2);
    ctx.clearRect(-width / 2, -height / 2, width, height);
    ctx.drawImage(ctxBuffer.canvas, -width / 2, -height / 2);
    ctxBuffer.restore();

    ctx.fillStyle = `hsla(0, 0%, 0%, 0.01)`;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    pattern(acc, ft);
    counter ++;
}

function pattern(volume, ts) {
    let b = Math.sin(counter / 1000) * 5 + 10 + Math.log2(volume / 500 + 0.5);
    const f = x => 6 * Math.cos(x);
    const g = x => Math.sin(b * x) + Math.sin(volume / 10);
    const radius = minDimension / 8;
    const increment = 1 / (params.smoothing.value * 5);

    for (let a = 0, i = 0; a <= Math.PI * 2; a += Math.PI /  (2 + (volume / 100)), i++) {
        const h = params.hue.value + i * params.spread.value;
        ctx.beginPath();
        ctx.strokeStyle = `hsla(${h}, 50%, 50%, 0.3)`;
        for (let t = 0; t <= 6.29; t += increment) {
            let x = (f(t) * Math.cos(a) - g(t) * Math.sin(a)) * radius;
            let y = (f(t) * Math.sin(a) + g(t) * Math.cos(a)) * radius;
            if (t === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();
    }
}

function resize() {
    if (ctx) {
        let {width, height} = getDimensions();
        ctx.lineCap = 'round';
        ctxBuffer.canvas.width = width;
        ctxBuffer.canvas.height = height;
        ctxBuffer.translate(width/2, height/2);
        ctx.lineWidth = width / 600;
        ctx.translate(width/2, height/2);
        minDimension = Math.min(width, height);
    }
}

module.exports = {
    name: 'Hyperwave',
    init,
    tick,
    resize,
    params
};
