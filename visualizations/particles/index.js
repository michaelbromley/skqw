const Particle = require('./particle');
// minimum distance to trigger the drawing of an edge.
// expressed as a percentage of the canvas width.
const MIN_DISTANCE = 10;
let minDistanceActual;

let ctx;
let particles = [];
let params = {
    sensitivity: {
        value: 250,
        type: 'range',
        label: 'sensitivity',
        min: 0,
        max: 500
    }
};

module.exports = {
    name: 'Particle Graph',
    author: 'Michael Bromley',
    init: init,
    tick: tick,
    params: params
};

function init(skqw) {
    let {width, height} = skqw.dimensions();
    ctx = skqw.createCanvas().getContext('2d');
    ctx.strokeStyle = 'blue';
    getMinDistanceActual(width);
    ctx.globalCompositeOperation = 'lighten';
 
    particles = skqw.sample().ft.map(() => new Particle(ctx, width, height));
    skqw.onResize(skqw => {
        particles.forEach(p => p.resize(skqw.dimensions().width, skqw.dimensions().height));
        getMinDistanceActual(skqw.dimensions().width);
    });
}

function tick(skqw) {
    let w = skqw.dimensions().width;
    let h = skqw.dimensions().height;
    let ft = skqw.sample().ft;
    let ts = skqw.sample().ts;

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
        particles[i].step();
        joinParticles(particles[i]);
        particles[i].render(ft[i] * 10);
    }
}

function getMinDistanceActual(canvasWidth) {
    minDistanceActual = canvasWidth * (MIN_DISTANCE / 100);
    console.log('minDistanceActual ', minDistanceActual);
}

function joinParticles(p) {
    if (p.haloRadius < 10) {
        return;
    }
    const MAX = Math.round(p.haloRadius * 0.1);
    let edges = 0;

    for (let i = 0; i < particles.length; i++) {
        if (edges === MAX) {
            return;
        }
        let q = particles[i];
        let dist = distance(p, q);
        if (dist < minDistanceActual + p.haloRadius && p.haloRadius + q.haloRadius < dist) {
            ctx.beginPath();
            let a = Math.min(0.8, (1 / ((dist - p.haloRadius) / minDistanceActual) / minDistanceActual) * 20);
            ctx.strokeStyle = `rgba(255,255,255, ${a})`;
            ctx.fillStyle = 'rgba(0,0,0,0)';

            let dx = p.x - q.x;
            let dy = p.y - q.y;
            let angleP = Math.atan2(dy, dx) - Math.PI;
            let sx = Math.cos(angleP) * p.haloRadius;
            let sy = Math.sin(angleP) * p.haloRadius;

            let angleQ = Math.PI / 2 - angleP - Math.PI;
            let ex = Math.sin(angleQ) * q.haloRadius;
            let ey = Math.cos(angleQ) * q.haloRadius;

            ctx.moveTo(p.x + sx, p.y + sy);
            ctx.lineTo(q.x + ex, q.y + ey);
            ctx.stroke();
            ctx.closePath();
            edges ++;
        }
    }
}


/**
 * Get the distance between the center points of two particles
 * @param p
 * @param q
 */
function distance(p, q) {
    let dx = p.x - q.x;
    let dy = p.y - q.y;
    return Math.sqrt(dx*dx + dy*dy);
}