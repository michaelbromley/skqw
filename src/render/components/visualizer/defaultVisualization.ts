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

let ctx: CanvasRenderingContext2D;
let ft: number[];
let ts: number[];
let w: number;
let h: number;

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
}

declare var Path2D: any;

function tick(skqw) {
    w = skqw.dimensions().width;
    h = skqw.dimensions().height;
    ft = skqw.sample().ft;
    ts = skqw.sample().ts;

    let baseScale = w / (ORIGINAL_WIDTH + 600);
    let volume = 0;
    for (let i = 0; i < ft.length; i ++) {
        volume += ft[i];
    }

    // center the path
    let imageWidth = ORIGINAL_WIDTH * baseScale;
    let imageHeight = ORIGINAL_HEIGHT * baseScale;
    let offsetX = (w - imageWidth) / 2;
    let offsetY = (h - imageHeight) / 2;

    let volumeScale = Math.log10(10 + volume);
    let widthDelta = imageWidth * volumeScale - imageWidth;
    let heightDelta = imageHeight * volumeScale - imageHeight;

    ctx.fillStyle = `rgba(0, 0, 0, ${1 / (volumeScale * 5)})`;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = `hsla(${160 + volume * 2}, 50%, 50%, ${0.2 + Math.min(volume / 100, 0.8)})`;

    ctx.save();
 
    ctx.translate(offsetX - widthDelta / 2, offsetY - heightDelta / 2);
    ctx.scale(volumeScale, volumeScale);

    ctx.lineWidth = baseScale;

    SVG_PATHS.forEach(path => {
        let svgPath = path.reduce((str: string, item: any) => {
            if (typeof item === 'string') {
                return str + item;
            } else {
                return str + `${item[0] * baseScale},${item[1] * baseScale} `;
            }
        }, '');

        let newPath = new Path2D(svgPath);

        // the TS lib does not know about Path2D.
        (<any> ctx).stroke(newPath);
    });

    ctx.restore();
}

export const defaultVis = {
    name: 'Default Visualization',
    author: 'Michael Bromley',
    init: init,
    tick: tick
};