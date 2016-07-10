/**
 * An example of the most basic kind of 2D visualization, to illustrate the expected format & API of a
 * skqw visualization plugin.
 */
let ctx;
let ctx2;
let canvas2;
let params = {};
const DELAY = 10;
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
}

function tick(skqw) {
    let w = skqw.dimensions().width;
    let h = skqw.dimensions().height;
    buffer.unshift(skqw.sample().ts);
    if (DELAY * 2 + 2 < buffer.length) {
        buffer.pop();
    }

    ctx.globalCompositeOperation = 'lighten';
    ctx.lineCap = 'round';

    // draw red
    ctx.strokeStyle = 'rgba(255, 0, 0, 1)';
    drawCircle(w, h, buffer[0]);

    // draw green
    ctx.strokeStyle = 'rgba(0, 255, 0, 1)';
    drawCircle(w, h, buffer[DELAY + 1]);

    // draw blue
    ctx.strokeStyle = 'rgba(0, 0, 255, 1)';
    drawCircle(w, h, buffer[DELAY * 2 + 1]);

    const imageData = ctx.getImageData(-w / 2, -h / 2, w, h);

    // ctx2.translate(w / 2, h / 2);
    ctx2.putImageData(imageData, 0 , 0);

    // clear frame
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fillRect(-w / 2, -h / 2, w, h);

    let scale = 1.01;
    ctx.drawImage(canvas2, -w * scale, -h * scale, w * scale, h * scale);
}

function drawCircle(w, h, ts) {
    if (!ts) {
        return;
    }
    const r = h / 2 * 0.7;
    const length = ts.length;
    ctx.beginPath();
    for(var i = 0; i < length; i++) {
        let adjustedR = r + ts[i] * 100;
        const x = adjustedR * Math.cos(2 * Math.PI * i / length);
        const y = adjustedR * Math.sin(2 * Math.PI * i / length);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function resizeHandler(skqw) {
    if (ctx) {
        let {width, height} = skqw.dimensions();
        ctx.lineWidth = width / 400;
        ctx.translate(width/2, height/2);

        canvas2.width = skqw.dimensions().width;
        canvas2.height = skqw.dimensions().height;
    }
}