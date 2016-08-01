const Particle = require('./particle');
const Node = require('./node');
const Edge = require('./edge');

const EDGE_MARGIN = 50;
const WALL_BOUNCE = 0.01;
const ROTATION_RATE = 0.005;
const volumeCache = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let ctx = {};
let bufferCtx;
let bgAcc = [0, 0];
let particleAcc = 0;
let volume = [];
let recentVol = [];
let particles = [];
let nodes = [];
let edges = {};
let lastTimestamp;
let nodeOffset = 0;
// generic counter that increments on each tick
let counter = 0;

let params = {
    hue: {
        value: 200,
        type: 'range',
        label: 'Hue',
        min: 1,
        max: 360
    },
    gravity: {
        value: 10,
        type: 'range',
        label: 'Gravity',
        min: 1,
        max: 500
    },
    particleCount: {
        value: 128,
        type: 'range',
        label: 'Particle Count',
        min: 100,
        max: 500
    },
    nodeCount: {
        value: 3,
        type: 'range',
        label: 'Node Count',
        min: 2,
        max: 6
    }
};

function init(skqw) {
    let {width, height} = skqw.dimensions;
    ctx.bg = skqw.createCanvas().getContext('2d');
    ctx.fore = skqw.createCanvas().getContext('2d');
    bufferCtx = document.createElement('canvas').getContext('2d');
    bufferCtx.canvas.width = width;
    bufferCtx.canvas.height = height;


    particles = constructParticles(params.particleCount.value, width, height);
    nodes = constructNodes(params.nodeCount.value, width, height);
    edges = constructEdges(particles, nodes);

    for (let i = 0; i < nodes.length; i++) {
        recentVol[i] = volumeCache;
    }
}

function tick(skqw, timestamp) {
    const { width, height } = skqw.dimensions;
    const ft = skqw.sample.ft;

    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    let frames = (timestamp - lastTimestamp) / 16.666;
    nodeOffset = frames * ROTATION_RATE;
    counter ++;

    // divide the volumes into separate buckets for each node.
    const bucketSize = Math.floor(ft.length / nodes.length);
    for (let bucket = 0; bucket < nodes.length; bucket++) {
        volume[bucket] = 0;
        for (let i = bucket * bucketSize; i < (bucket + 1) * bucketSize; i ++) {
            volume[bucket] += ft[i];
        }
        recentVol[bucket].push(volume[bucket]);
        recentVol[bucket].shift();
    }

    if (counter % 10 === 0) {
        drawBg(recentVol, width, height);
    }

    ctx.fore.globalCompositeOperation = 'soft-light';

    ctx.fore.clearRect(0, 0, width, height);

    drawParticles(timestamp, width, height);
    // render nodes& edges
    nodes.forEach((node, index) => {
        let newPos = positionNode(nodes.length, index, nodeOffset, width, height);
        node.x = newPos.x;
        node.y = newPos.y;
        node.render(volume[index], width);
    });

    for (let id in edges) {
        edges[id].render();
    }
}

function constructParticles(particleCount, width, height) {
    let particles = [];
    for (let i = 0; i < particleCount; i ++) {
        particles.push(new Particle(ctx.fore, width, height, i));
    }
    return particles;
}

function constructNodes(nodeCount, w, h) {
    let nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        let node = new Node(ctx.fore, 0, 0, i);
        let initialPos = positionNode(nodeCount, i, 0, w, h);
        node.x = initialPos.x;
        node.y = initialPos.y;
        nodes.push(node);
    }
    return nodes;
}

function constructEdges(particles, nodes) {
    let edges = {};
    nodes.forEach((n, index) => {
        const hue = params.hue.value + index * 20;
        particles.forEach(p => {
            edges[`${n.id}_${p.id}`] = new Edge(ctx.fore, p, n, hue);
        });
    });
    return edges;
}

function positionNode(nodeCount, nodeIndex, offset, w, h) {
    const length = nodeCount;
    const radius = Math.min(w, h) / 3;
    const x = radius * Math.cos(2 * Math.PI * nodeIndex / length + offset) + w / 2;
    const y = radius * Math.sin(2 * Math.PI * nodeIndex / length + offset) + h / 2;
    return { x, y };
}

function add(a, b) {
    return a + b;
}

function drawBg(recentVol, width, height) {
    ctx.bg.clearRect(0, 0, width, height);
    ctx.bg.globalCompositeOperation = 'screen';
    for (let bgIndex = 0; bgIndex < 2; bgIndex ++) {

        let recentVolSum = recentVol[bgIndex].reduce(add, 0);
        let delta = recentVolSum - bgAcc[bgIndex];
        const longestDimension = Math.max(width, height);

        if (bgAcc[bgIndex] < longestDimension / 3) {
            bgAcc[bgIndex] += delta / 100;
        } else {
            bgAcc[bgIndex] = longestDimension / 3;
        }
        if (1 < bgAcc[bgIndex]) {
            bgAcc[bgIndex] -= 1;
        }

        const centerX = width / 2;
        const centerY = height / 2;

        const reverse = bgIndex === 0 ? Math.PI : 0;

        let inner = {
            x: centerX + Math.cos(nodeOffset / (2 + bgIndex) + reverse) * bgAcc[bgIndex],
            y: centerY + Math.sin(nodeOffset / (2 + bgIndex) + reverse) * bgAcc[bgIndex]
        };
        let gradRadius = longestDimension / 1.5;
        let grd = ctx.bg.createRadialGradient(centerX, centerY, gradRadius, inner.x, inner.y, 0);
        grd.addColorStop(0, `hsla(${bgIndex === 0 ? params.hue.value : params.hue.value + 100}, 80%, ${bgAcc[bgIndex] / longestDimension * 30 + 10}%, 0.9)`);
        grd.addColorStop(1, `rgba(0,0,0, 0.9)`);
        ctx.bg.fillStyle = grd;
        ctx.bg.fillRect(0, 0, width, height);
    }
}

function drawParticles(timestamp, width, height) {
    // draw particles
    let recentVolSum = recentVol[0].reduce(add, 0);
    if (particleAcc < recentVolSum) {
        particleAcc = recentVolSum;
    }
    if (1 < particleAcc) {
        particleAcc -= 10;
    }
    /*  ctx.mid.globalCompositeOperation = 'lighten';
     bufferCtx.clearRect(0, 0, width, height);
     bufferCtx.globalAlpha = Math.min(0.99, particleAcc / 800);
     bufferCtx.drawImage(ctx.mid.canvas, 0, 0);
     ctx.mid.clearRect(0, 0, width, height);
     ctx.mid.drawImage(bufferCtx.canvas, 0, 0);*/

    // Step and render all particles
    // ctx.fore.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.tick(timestamp);
        p.render(width, height);
        applyBoundaryAcceleration(p, width, height);
        for (let j = 0; j < nodes.length; j ++) {
            const avgVol = recentVol[j].reduce(add, 0) / recentVol[j].length;
            let burst = volume[j] / avgVol * (j + 1);
            interactWithNode(p, nodes[j], burst, width, height);
        }
    }

}

/**
 * Apply gravitation forces between the node and a particle.
 * @param {Particle} p
 * @param {Node} n
 */
function interactWithNode(p, n, burst, width, height) {
    const forceSum = { x: 0, y: 0 };
    const xDist = p.x - n.x;
    const yDist = p.y - n.y;
    const d = distance(p, n);
    const threshold = n.haloRadius * 3;

    // Apply gravitation proportional to the inverse square of the distance
    const gravitation = params.gravity.value / d * d;
    const gForce = n.haloRadius / 5000 * gravitation / Math.max(width, height);
    const bForce = burst / 1000 * gravitation;
    forceSum.x -= Math.abs(gForce * (xDist / d)) * Math.sign(xDist);
    forceSum.y -= Math.abs(gForce * (yDist / d)) * Math.sign(yDist);
    if (0.1 < Math.abs(forceSum.x) || 0.1 < Math.abs(forceSum.y)) {
        console.log('forceSum', forceSum);
    }
    p.vx += forceSum.x;
    p.vy += forceSum.y;

    // update edges
    if (d < threshold) {
        let strength = 0;
        if (n.haloRadius < d) {
            strength = (threshold - d) / (threshold - n.haloRadius) * 100;
        }
        edges[`${n.id}_${p.id}`].join(strength, burst);
        p.touch(edges[`${n.id}_${p.id}`].hue, strength);
    }
}

/**
 * Alter the velocity of the particle based on proximity to the canvas boundary to keep them
 * within the canvas.
 * @param {Particle} p
 */
function applyBoundaryAcceleration(p, w, h) {
    if (p.x < EDGE_MARGIN) {
        let delta = EDGE_MARGIN - p.x;
        p.vx += reflect(delta);
    } else if (w - EDGE_MARGIN < p.x) {
        let delta = p.x - (w - EDGE_MARGIN);
        p.vx -= reflect(delta);
    }
    if (p.y < EDGE_MARGIN) {
        let delta = EDGE_MARGIN - p.y;
        p.vy += reflect(delta);
    } else if (h - EDGE_MARGIN < p.y) {
        let delta = p.y - (h - EDGE_MARGIN);
        p.vy -= reflect(delta);
    }
}

/**
 * Function governing how a particle reflects from the edge of the canvas.
 * @param delta
 * @returns {number}
 */
function reflect(delta) {
    return delta / EDGE_MARGIN * WALL_BOUNCE;
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

function paramChange(skqw, change) {
    const { width, height } = skqw.dimensions;
    params[change.paramKey].value = change.newValue;
    if (change.paramKey === 'nodeCount' || change.paramKey === 'particleCount') {
        particles = constructParticles(params.particleCount.value, width, height);
        nodes = constructNodes(params.nodeCount.value, width, height);
        edges = constructEdges(particles, nodes);
        for (let i = 0; i < nodes.length; i++) {
            recentVol[i] = volumeCache;
        }
    }
    if (change.paramKey === 'hue') {
        Object.keys(edges).forEach(id => edges[id].hue = change.newValue);
    }
}

function resize(skqw) {
    let {width, height} = skqw.dimensions;
    bufferCtx.canvas.width = width;
    bufferCtx.canvas.height = height;
    particles.forEach(p => p.position(width, height));
}

module.exports = {
    name: 'Particle Graph',
    init,
    tick,
    paramChange,
    resize,
    params
};
