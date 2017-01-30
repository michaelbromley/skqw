const { ExponentialSmoother } = require('skqw-utils');
const { createCanvas, getSample, getDimensions } = require('skqw-core');

const Polygon = require('./polygon');
const Star = require('./star');

const BG_DECAY = 200;
let lastTimestamp;
let bgValue = 0;
let smoother = new ExponentialSmoother(0.3);
let vol = 0;
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
    },
    hue: {
        value: 0,
        type: 'range',
        label: 'Hue',
        max: 359,
        min: 0
    },
    invert: {
        value: false,
        type: 'boolean',
        label: 'Invert'
    },
    vertices: {
        value: 6,
        type: 'range',
        label: 'Vertices',
        max: 12,
        min: 3,
        step: 1
    }
};

function init() {
    // foreground hexagons layer
    canvas = createCanvas();
    ctx = canvas.getContext("2d");

    makeStarArray();
    resize();
}

function tick(timestamp) {
    let framesElapsed = getFrames(timestamp);
    let {width, height} = getDimensions();
    let {ft, ts} = getSample();

    vol = smoother.sumAndProcess(ft);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    drawBg(width, height);

    stars.forEach(star => star.drawStar(vol, framesElapsed));

    rotateForeground();
    tiles.forEach(tile => tile.render(ft, vol, tiles.length, params, vol));
    tiles.forEach(tile => {
        if (tile.highlight > 0) {
            tile.drawHighlight(volume, params, vol);
        }
    });
}


/**
 * Create an array of Polygon objects, arranged into a grid x, y, with the y axis at 60 degrees to the x, rather than
 * the usual 90.
 */
function makePolygonArray(tileSize, ctx) {
    tiles = [];
    let vertices = params.vertices.value;
    let i = 0; // unique number for each tile
    tiles.push(new Polygon(vertices, 0, 0, tileSize, ctx, i)); // the centre tile
    i++;
    for (let layer = 1; layer < 7; layer++) {
        tiles.push(new Polygon(vertices, 0, layer, tileSize, ctx, i)); i++;
        tiles.push(new Polygon(vertices, 0, -layer, tileSize, ctx, i)); i++;
        for(let x = 1; x < layer; x++) {
            tiles.push(new Polygon(vertices, x, -layer, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(vertices, -x, layer, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(vertices, x, layer-x, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(vertices, -x, -layer+x, tileSize, ctx, i)); i++;
        }
        for(let y = -layer; y <= 0; y++) {
            tiles.push(new Polygon(vertices, layer, y, tileSize, ctx, i)); i++;
            tiles.push(new Polygon(vertices, -layer, -y, tileSize, ctx, i)); i++;
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
    } else if (BG_DECAY + 1 < bgValue) {
        bgValue -= BG_DECAY;
    }
    ctx.beginPath();
    // create radial gradient
    const fillAlpha = 1 - Math.log2(vol + 0.5) / 10;
    let grd = ctx.createRadialGradient(0, 0, Math.max(w * 2 - vol * 4, 0), 0, 0, 0);
    grd.addColorStop(1, `rgba(0,0,0, ${fillAlpha})`);
    grd.addColorStop(0, `hsla(${Math.log2(bgValue + 0.5) - 30}, 80%, 30%, ${fillAlpha})`);

    ctx.fillStyle = grd;
    ctx.fillRect(-w / 2, -h /2, w, h);
}

function resize() {
    if (canvas) {
        let {width, height} = getDimensions();
        // resize the foreground canvas
        ctx.translate(width/2, height/2);
        // resize the bg canvas
        let tileSize = width > height ? width / 25 : height / 25;
        drawBg(width, height);
        makePolygonArray(tileSize, ctx);
        makeStarArray()
    }
}

function rotateForeground() {
    tiles.forEach(function(tile) {
        tile.rotateVertices(vol);
    });
}

function paramChange(change) {
    const { width, height } = getDimensions();
    params[change.paramKey].value = change.newValue;
    if (change.paramKey === 'vertices') {
        let tileSize = width > height ? width / 25 : height / 25;
        makePolygonArray(tileSize, ctx);
    }
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
    init,
    tick,
    resize,
    paramChange,
    params
};
