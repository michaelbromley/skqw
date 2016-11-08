const {createCanvas, getSample, getDimensions} = require('skqw-core');

const SVG_PATHS = [
    ['m', [415.33604,13.13485], [0,159.60405], [90.71168,-159.46391], 'z'],
    ['m', [494.55651,43.24509], [16.00134,-29.56405], [76.56504,0], [-33.48324,57.99467], [-58.62437,101.54039], 'z'],
    ['m', [287.49653,164.556], [87.60014,-151.7279], [-76.17157,0], [-11.11771,19.25643], 'z'],
    ['m', [380.35367,140.61696], [-27.97241,48.44964], [28.6867,0], 'z'],
    ['m', [153.49653,164.556], [87.60014,-151.7279], [-87.60014,0], 'z'],
    ['M', [153.85367,173.4846], [206.1348,82.931], [254.15677,173.4846], 'Z'],
    ['m', [44.212271,121.6329], [-34.83732,-60.34], [27.97259,-48.44995], [68.760019,0], 'z'],
    ['m', [288.21081,173.4846], [92.2588,-159.79695], [0,103.0112], [-32.83221,56.86705], 'z'],
    ['m', [82.708141,64.02978], [34.837329,60.34], [-27.972589,48.44992], [-68.76002,0], 'z'],
];
const ORIGINAL_WIDTH = 600;
const ORIGINAL_HEIGHT = 200;
const VOLUME_GAIN = 1.8;

let ctx: CanvasRenderingContext2D;
let ctxBuffer: CanvasRenderingContext2D;
let acc: number = 0;

function init() {
    const { width, height } = getDimensions();
    ctx = createCanvas().getContext('2d');
    ctxBuffer = document.createElement('canvas').getContext('2d');
    ctxBuffer.canvas.width = width;
    ctxBuffer.canvas.height = height;
}

declare var Path2D: any;

function tick() {
    const { width, height } = getDimensions();
    const { ft }  = getSample();

    let baseScale = width / (ORIGINAL_WIDTH + 600);
    let volume = 0;
    for (let i = 0; i < ft.length; i ++) {
        volume += ft[i];
    }
    // arbitrary adjustment.
    volume *= VOLUME_GAIN;
    const delta = volume - acc;
    acc += delta / 10;

    // center the path
    let imageWidth = ORIGINAL_WIDTH * baseScale;
    let imageHeight = ORIGINAL_HEIGHT * baseScale;
    let offsetX = (width - imageWidth) / 2;
    let offsetY = (height - imageHeight) / 2;

    let volumeScale = Math.log10(10 + acc) * 0.8;
    let widthDelta = imageWidth * volumeScale - imageWidth;
    let heightDelta = imageHeight * volumeScale - imageHeight;

    const zoom = 1.005;
    ctxBuffer.save();
    ctxBuffer.clearRect(0, 0, width, height);
    ctxBuffer.globalAlpha = Math.min(0.95 + acc / 100, 0.99);
    ctxBuffer.transform(1, 0, 0, 1, 0, -height * (zoom - 1) / 2 + (1.5 + acc / 10));
    ctxBuffer.drawImage(ctx.canvas, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(ctxBuffer.canvas, 0, 0);
    ctxBuffer.restore();

    let bgAlpha = 1 / (volumeScale * 10);
    ctx.fillStyle = `hsla(0, 0%, 0%, ${bgAlpha})`;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = `hsla(${160 + volume * 0.5}, 50%, 50%, ${0.2 + Math.min(volume / 100, 0.8)})`;

    ctx.save();

    ctx.setTransform(volumeScale, 0, 0, volumeScale, offsetX - widthDelta / 2, offsetY - heightDelta / 2 - acc / 5);

    ctx.lineWidth = baseScale;

    drawPath(ft, baseScale);

    ctx.restore();
}

function drawPath(ft, baseScale) {
    SVG_PATHS.forEach(path => {
        let svgPath = path.reduce((str: string, item: any, i: number) => {
            if (typeof item === 'string') {
                return str + item;
            } else {
                let sign = Math.sin(ft[i] / 30);
                let skew = Math.pow(ft[i], 1.5) * sign;
                return str + `${item[0] * baseScale + skew}, ${item[1] * baseScale + skew} `;
            }
        }, '');

        let newPath = new Path2D(svgPath);

        ctx.fillStyle = `hsla(${240 - acc / 2}, 50%, ${50 + Math.min(acc / 6, 40)}%, ${Math.min(acc / 500, 0.2)})`;
        ctx.fill(newPath);

        // the TS lib does not know about Path2D.
        (<any> ctx).stroke(newPath);
    });
}

function resize() {
    const { width, height } = getDimensions();
    ctxBuffer.canvas.width = width;
    ctxBuffer.canvas.height = height;
}

export const defaultVis = {
    name: 'SKQW',
    init,
    tick,
    resize
};
