const Polygon = require('./polygon');

let tiles = [];
let stars = [];
let fgCanvas;
let fgCtx;
const ROTATION_STEP = 0.001;
let bgCanvas;
let bgCtx;
let sfCanvas;
let sfCtx;
let volume;
let params = {
    sensitivity: {
        value: 50,
        type: 'range',
        label: 'Sesntitivity'
    },
    depth: {
        value: 20,
        type: 'range',
        label: 'Depth'
    }
};

function init(skqw) {

    // foreground hexagons layer
    fgCanvas = skqw.createCanvas();
    fgCtx = fgCanvas.getContext("2d");

    // background image layer
    bgCanvas = skqw.createCanvas();
    bgCtx = bgCanvas.getContext("2d");

    // middle starfield layer
    /*sfCanvas = skqw.createCanvas();
     sfCtx = sfCanvas.getContext("2d");*/

    // makeStarArray();
    skqw.onResize(resizeHandler);
    setTimeout(() => resizeHandler(skqw));
}

var i = 0;
function tick(skqw) {
    let {width, height} = skqw.dimensions();
    let {ft, ts} = skqw.sample();

    volume = Array.prototype.reduce.call(ft, function(a, b) {
        return a + b;
    });
    volume = Math.abs(volume) * params.sensitivity.value * 15;

    i++;
    if (i % 60 === 0) {
        console.log('volume', volume);
    }

    fgCtx.clearRect(-width / 2, -height / 2, width, height);
    // sfCtx.clearRect(-fgCanvas.width/2, -fgCanvas.height/2, fgCanvas.width, fgCanvas.height);

    /*stars.forEach(function(star) {
     star.drawStar();
     });*/

    drawBg(width, height);
    rotateForeground();
    tiles.forEach(function(tile) {
        tile.render(ft, volume);
    });
    tiles.forEach(function(tile) {
        if (tile.highlight > 0) {
            tile.drawHighlight();
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



function drawBg(w, h) {
    bgCtx.clearRect(0, 0, w, h);
    let r, g, b, a;
    let val = (volume || 0) / 10;
    r = 20 + (Math.sin(val) + 1) * 28;
    g = val * 2;
    b = val * 8;
    bgCtx.beginPath();
    bgCtx.rect(0, 0, w, h);
    // create radial gradient
    let grd = bgCtx.createRadialGradient(w / 2, h / 2, val, w / 2, h / 2, w - Math.min(Math.pow(val, 1.7), w - 20));
    grd.addColorStop(0, 'rgba(0,0,0,1)');// centre is transparent black
    grd.addColorStop(1, "rgba(" +
        Math.round(r) + ", " +
        Math.round(g) + ", " +
        Math.round(b) + ", 1)"); // edges are reddish

    bgCtx.fillStyle = grd;
    bgCtx.fill();
}

function resizeHandler(skqw) {
    if (fgCanvas) {
        let {width, height} = skqw.dimensions();
        // resize the foreground canvas
        fgCtx.translate(width/2, height/2);
        console.log('resizeHandler');
        // resize the bg canvas

        /* sfCtx.translate(fgCanvas.width/2,fgCanvas.height/2);*/

        let tileSize = width > height ? width / 25 : height / 25;

        drawBg(width, height);
        makePolygonArray(tileSize, fgCtx);
        // makeStarArray()
    }
}

function rotateForeground() {
    tiles.forEach(function(tile) {
        tile.rotateVertices(volume);
    });
}


module.exports = {
    name: 'The Resistance',
    author: 'Michael Bromley',
    init: init,
    tick: tick,
    params: params
};
