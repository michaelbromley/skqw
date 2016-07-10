const Polygon = require('./polygon');
const Star = require('./star');

const BG_DECAY = 200;
let lastTimestamp;
let bgValue = 0;
let tiles = [];
let stars = [];
let canvas;
let ctx;
let volume;
let params = {
    sensitivity: {
        value: 30,
        type: 'range',
        label: 'Sensitivity'
    },
    depth: {
        value: 2,
        type: 'range',
        label: 'Depth',
        max: 4,
        min: 0.1,
        step: 0.01
    }
};

function init(skqw) {

    // foreground hexagons layer
    canvas = skqw.createCanvas();
    ctx = canvas.getContext("2d");

    makeStarArray();
    skqw.onResize(resizeHandler);
    setTimeout(() => resizeHandler(skqw));
}

function tick(skqw, timestamp) {
    let framesElapsed = getFrames(timestamp);
    let {width, height} = skqw.dimensions();
    let {ft, ts} = skqw.sample();

    volume = Array.prototype.reduce.call(ft, function(a, b) {
        return a + b;
    }, 0);
    volume = Math.abs(volume) * params.sensitivity.value;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    drawBg(width, height);

    stars.forEach(star => star.drawStar(volume, framesElapsed));

    rotateForeground();
    tiles.forEach(tile => tile.render(ft, volume, tiles.length, params));
    tiles.forEach(tile => {
        if (tile.highlight > 0) {
            tile.drawHighlight(volume, params);
        }
    });
}


/**
 * Create an array of Polygon objects, arranged into a grid x, y, with the y axis at 60 degrees to the x, rather than
 * the usual 90.
 */
function makePolygonArray(tileSize, ctx) {
    tiles = [];
    let i = 0; // unique number for each tile
    tiles.push(new Polygon(6, 0, 0, tileSize, ctx, i)); // the centre tile
    i++;
    for (let layer = 1; layer < 7; layer++) {
        tiles.push(new Polygon(6, 0, layer, tileSize, ctx, i)); i++;
        tiles.push(new Polygon(6, 0, -layer, tileSize, ctx, i)); i++;
        for(let x = 1; x < layer; x++) {
            tiles.push(new Polygon(6, x, -layer, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(6, -x, layer, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(6, x, layer-x, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(6, -x, -layer+x, tileSize, ctx, i)); i++;
        }
        for(let y = -layer; y <= 0; y++) {
            tiles.push(new Polygon(6, layer, y, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(6, -layer, -y, tileSize, ctx, i)); i++;
        }
    }
}

function makeStarArray() {
    var x, y, starSize;
    stars = [];
    var limit = canvas.width / 15; // how many stars?
    for (var i = 0; i < limit; i ++) {
        x = (Math.random() - 0.5) * canvas.width;
        y = (Math.random() - 0.5) * canvas.height;
        starSize = (Math.random()+0.1)*3;
        stars.push(new Star(x, y, starSize, ctx));
    }
}


function drawBg(w, h) {
    if (bgValue < volume) {
        bgValue = volume;
    } else if (BG_DECAY + 1 <= bgValue) {
        bgValue -= BG_DECAY;
    }
    ctx.beginPath();
    // create radial gradient
    const radius = bgValue / 2500 * w;
    const fillAlpha = 1 - Math.min(bgValue / 6000, 0.9);
    let grd = ctx.createRadialGradient(0, 0, Math.max(w * 4 - radius, 0), 0, 0, 0);
    grd.addColorStop(1, `rgba(0,0,0, ${fillAlpha})`);
    grd.addColorStop(0, `hsla(${Math.log2(bgValue) - 30}, 50%, 50%, ${fillAlpha})`);

    ctx.fillStyle = grd;
    ctx.fillRect(-w / 2, -h /2, w, h);
}

function resizeHandler(skqw) {
    if (canvas) {
        let {width, height} = skqw.dimensions();
        // resize the foreground canvas
        ctx.translate(width/2, height/2);
        // resize the bg canvas

        /* sfCtx.translate(fgCanvas.width/2,fgCanvas.height/2);*/

        let tileSize = width > height ? width / 25 : height / 25;

        drawBg(width, height);
        makePolygonArray(tileSize, ctx);
        makeStarArray()
    }
}

function rotateForeground() {
    tiles.forEach(function(tile) {
        tile.rotateVertices(volume);
    });
}

/**
 * Calculate the number of frames passed since the last tick, based on 60fps.
 * @param timestamp
 * @returns {number}
 */
function getFrames(timestamp) {
    if (!lastTimestamp) {
        lastTimestamp = timestamp;
        return 1;
    } else {
        let frames = 16.6666 / (timestamp - lastTimestamp);
        lastTimestamp = timestamp;
        return frames;
    }
}


module.exports = {
    name: 'The Resistance',
    author: 'Michael Bromley',
    init: init,
    tick: tick,
    params: params
};
