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
let ft: number[];
let ts: number[];
let w: number;
let h: number;
let kickPeak = 0;

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
}

declare var Path2D: any;

function tick(skqw) {
    w = skqw.dimensions.width;
    h = skqw.dimensions.height;
    ft = skqw.sample.ft;
    ts = skqw.sample.ts;

    let baseScale = w / (ORIGINAL_WIDTH + 600);
    let volume = 0;
    // just the high frequencies
    let volumeHigh = 0;
    let kickVol = 0;
    for (let i = 0; i < ft.length; i ++) {
        volume += ft[i];
        if (ft.length / 2 < i) {
            volumeHigh += ft[i];
        }
        if (i < 6) {
            kickVol += ft[i];
        }
    }
    // arbitrary adjustment.
    volume *= VOLUME_GAIN;
    kickVol = kickVol / 6 * VOLUME_GAIN;

    // center the path
    let imageWidth = ORIGINAL_WIDTH * baseScale;
    let imageHeight = ORIGINAL_HEIGHT * baseScale;
    let offsetX = (w - imageWidth) / 2;
    let offsetY = (h - imageHeight) / 2;

    let volumeScale = Math.log10(10 + volume);
    let widthDelta = imageWidth * volumeScale - imageWidth;
    let heightDelta = imageHeight * volumeScale - imageHeight;

    let compositeOp = 'source-over';
    if (800 < volume) {
        compositeOp = 'source-over';
    } else if (200 < volume) {
        // allow some random "source-over" to prevent the screen going white.
        if (0.2 < Math.random()) {
            compositeOp = 'color-dodge';
        } else {
            compositeOp = 'destination-in';
        }
    } else if (180 < volume) {
        compositeOp = 'overlay';
    }
    ctx.globalCompositeOperation = compositeOp;

    kickCircle(w, h, volume, kickVol);
    trebleSquare(w, h, volume, volumeHigh);

    let bgBrightness = 170 < volume ? 10 : 0;
    let bgAlpha = 170 < volume ? 0.7 : 1 / (volumeScale * 10);
    ctx.fillStyle = `hsla(${165 + volumeScale}, ${bgBrightness}%, ${bgBrightness}%, ${bgAlpha})`;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `hsla(${160 + volume * 0.5}, 50%, 50%, ${0.2 + Math.min(volume / 100, 0.8)})`;

    ctx.save();

    ctx.setTransform(volumeScale, 0, 0, volumeScale, offsetX - widthDelta / 2, offsetY - heightDelta / 2);

    ctx.lineWidth = baseScale;

    SVG_PATHS.forEach(path => {
        let svgPath = path.reduce((str: string, item: any, i: number) => {
            if (typeof item === 'string') {
                return str + item;
            } else {
                let sign = Math.sin(ft[i]);
                let skew = Math.pow(ft[i], 1.3) * sign;
                return str + `${item[0] * baseScale + skew},${item[1] * baseScale + skew} `;
            }
        }, '');

        let newPath = new Path2D(svgPath);

        ctx.fillStyle = `hsla(${240 - volume / 2}, 50%, ${50 + Math.min(volume / 6, 40)}%, ${Math.min(volumeHigh / 500, 0.2)})`;
        ctx.fill(newPath);

        // the TS lib does not know about Path2D.
        (<any> ctx).stroke(newPath);

    });

    ctx.restore();

}

function kickCircle(w, h, volume, kickVol) {
    const DEC = 0.05;
    const mean = volume / ft.length;

    if (50 < volume && mean * 5 < kickVol) {
        kickPeak = kickVol;
        ctx.beginPath();
        ctx.fillStyle = `hsla(0, 0%, 100%, ${Math.log2(1 + kickPeak) / 300})`;
        ctx.strokeStyle = `hsla(0, 0%, 100%, 0.2)`;
        ctx.arc(w / 2, h / 2, Math.log2((1 + kickPeak * 1000)) * w / 50 , 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    if (DEC < kickPeak) {
        kickPeak -= DEC;
    }
}

function trebleSquare(w, h, volume, volumeHigh) {
    if (100 < volume && volume / 6 < volumeHigh) {
        const volLog = Math.log2(1 + volumeHigh);
        const length = volLog * w / 10;

        ctx.beginPath();
        ctx.fillStyle = `hsla(165, 50%, 80%, ${volLog / 300})`;
        ctx.strokeStyle = `hsla(0, 0%, 100%, 0.15)`;
        ctx.rect(w / 2 - length / 2, h / 2 - length / 2, length, length);
        ctx.fill();
        ctx.stroke();
    }
}

export const defaultVis = {
    name: 'SKQW',
    init: init,
    tick: tick
};