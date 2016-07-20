/**
 * An example of the most basic kind of 2D visualization, to illustrate the expected format & API of a
 * skqw visualization plugin.
 */
let ctx;
let ctx2;
let canvas2;
let params = {
    sensitivity: {
        value: 50,
        type: 'range',
        label: 'Sensitivity',
        min: 1,
        max: 100
    },
};
let colorOffset = 0;
const DELAY = 1;
const buffer = [];


module.exports = {
    name: 'Circle',
    author: 'Michael Bromley',
    init: init,
    tick: tick,
    params: params
};

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
    ctx2 = document.createElement('canvas').getContext('2d');
    canvas2 = ctx2.canvas;

    skqw.onResize(resizeHandler);
    setTimeout(() => resizeHandler(skqw));
    ctx.lineCap = 'round';
}

function tick(skqw) {
    const w = skqw.dimensions().width;
    const h = skqw.dimensions().height;
    const ft = skqw.sample().ft;
    buffer.unshift(skqw.sample().ts);
    if (DELAY * 2 + 2 < buffer.length) {
        buffer.pop();
    }
    let volume = 0;
    for (let i = 0; i < ft.length; i ++) {
        volume += ft[i];
    }
    let saturation = Math.min(90, volume / 2);
    let overlayOpacity = (100 - saturation) / 400;

    // clear frame
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
    ctx.fillRect(-w / 2, -h / 2, w, h);

    ctx.globalCompositeOperation = 'lighten';

    drawBars(h, ft, volume);

    ctx.strokeStyle = `hsla(${volume / 3 + colorOffset}, ${saturation}%, 50%, 1)`;
    drawCircle(h, buffer[0], volume);

    ctx.strokeStyle = `hsla(${volume / 2 + colorOffset}, ${saturation}%, 50%, 1)`;
    drawCircle(h, buffer[DELAY + 1], volume);

    ctx.strokeStyle = `hsla(${volume + colorOffset}, ${saturation}%, 50%, 1)`;
    drawCircle(h, buffer[DELAY * 2 + 1], volume);
    colorOffset += 0.1;
}

function drawCircle(h, ts, volume) {
    if (!ts) {
        return;
    }
    const r = h / 2 * 0.7;
    const length = ts.length;
    let p1 = circlePoint(ts, length - 2, r, volume);
    let p2 = circlePoint(ts, length - 1, r, volume);
    let mid = midPoint(p1, p2);
    const start = midPoint(p1, p2);;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);

    for(var i = 2; i < length; i++) {
        mid = midPoint(p1, p2);
        ctx.quadraticCurveTo(p1.x, p1.y, mid.x, mid.y);
        p1 = circlePoint(ts, i, r, volume);
        p2 = circlePoint(ts, (i + 1), r, volume);
    }
    ctx.quadraticCurveTo(p1.x, p2.y, start.x, start.y);
    ctx.stroke();
}

function circlePoint(ts, i, r, volume) {
    const length = ts.length;
    const radialOffset = Math.PI / 2;
    const adjustedR = r + ts[i] * params.sensitivity.value + volume / 2;
    const x = adjustedR * Math.cos(2 * Math.PI * i / length + radialOffset);
    const y = adjustedR * Math.sin(2 * Math.PI * i / length + radialOffset);
    return { x, y };
}

function midPoint(p1, p2) {
    return {
        x: p1.x + (p2.x - p1.x) / 2,
        y: p1.y + (p2.y - p1.y) / 2
    };
}

function drawBars(h, ft, volume) {
    if (!ft) {
        return;
    }
    const r = h / 2 * 0.8;
    ctx.strokeStyle = `hsla(${volume / 2 + colorOffset + 180}, 50%, 50%, ${Math.min(volume / 2000, 0.1)})`;
    const length = ft.length;
    for(var i = 0; i < length; i++) {
        const adjustedR = r + ft[i] * params.sensitivity.value + volume;
        const delta = adjustedR - r;
        let p1 = barPoint(length, i, r - delta * 0.2);
        let p2 = barPoint(length, i, r + delta * 0.8);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}

function barPoint(length, i, r) {
    i -= Math.round(colorOffset / 2);
    const x = r * Math.cos(2 * Math.PI * i / length);
    const y = r * Math.sin(2 * Math.PI * i / length);
    return { x, y };
}

function resizeHandler(skqw) {
    if (ctx) {
        let {width, height} = skqw.dimensions();
        ctx.lineWidth = width / 600;
        ctx.translate(width/2, height/2);

        canvas2.width = skqw.dimensions().width;
        canvas2.height = skqw.dimensions().height;
    }
}