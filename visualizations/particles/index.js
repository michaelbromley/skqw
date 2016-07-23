const Particle = require('./particle');
const Node = require('./node');
const Edge = require('./edge');

const EDGE_MARGIN = 50;
const WALL_BOUNCE = 0.01;
const ROTATION_RATE = 0.01;
const volumeCache = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

let ctx;
let volume = [];
let recentVol = [];
let particles = [];
let nodes = [];
let edges = {};
let lastTimestamp;
let nodeOffset = 0;

let params = {
    sensitivity: {
        value: 250,
        type: 'range',
        label: 'Sensitivity',
        min: 0,
        max: 500
    },
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
        max: 50
    },
    nodeCount: {
        value: 3,
        type: 'range',
        label: 'Node Count',
        min: 1,
        max: 6
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
    let {width, height} = skqw.dimensions;
    ctx = skqw.createCanvas().getContext('2d');
    ctx.strokeStyle = 'blue';


    particles = skqw.sample.ft.map((p, index) => new Particle(ctx, width, height, index));
    nodes = constructNodes(params.nodeCount.value, width, height);
    edges = constructEdges(particles, nodes);

    for (let i = 0; i < nodes.length; i++) {
        recentVol[i] = volumeCache;
    }
}

function tick(skqw, timestamp) {
    let w = skqw.dimensions.width;
    let h = skqw.dimensions.height;
    let ft = skqw.sample.ft;
    let ts = skqw.sample.ts;

    if (!lastTimestamp) {
        lastTimestamp = timestamp;
    }
    let frames = (timestamp - lastTimestamp) / 16.666;
    nodeOffset = frames * ROTATION_RATE;

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

    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, w, h);

    // Step and render all particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.tick(timestamp);
        p.render();
        applyBoundaryAcceleration(p, w, h);
        for (let j = 0; j < nodes.length; j ++) {
            const avgVol = recentVol[j].reduce((a, b) => a + b, 0) / recentVol[j].length;
            let burst = volume[j] / avgVol * (j + 1);
            interactWithNode(p, nodes[j], burst);
        }
    }

    // render nodes
    nodes.forEach((node, index) => {
        let newPos = positionNode(nodes.length, index, nodeOffset, w, h);
        node.x = newPos.x;
        node.y = newPos.y;
        node.render(volume[index]);
    });

    for (let id in edges) {
        edges[id].render();
    }
}

function constructNodes(nodeCount, w, h) {
    let nodes = [];
    for (let i = 0; i < nodeCount; i++) {
        let node = new Node(ctx, 0, 0, i);
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
            edges[`${n.id}_${p.id}`] = new Edge(ctx, p, n, hue);
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

/**
 * Apply gravitation forces between the node and a particle.
 * @param {Particle} p
 * @param {Node} n
 */
function interactWithNode(p, n, burst) {
    const forceSum = { x: 0, y: 0 };
    const xDist = p.x - n.x;
    const yDist = p.y - n.y;
    const d = distance(p, n);
    const threshold = n.haloRadius * 3;

    // Apply gravitation proportional to the inverse square of the distance
    const gravitation = params.gravity.value / d * d;
    const gForce = n.haloRadius / 1000000 * gravitation;
    // const bForce = burst / 1000 * gravitation;
    forceSum.x -= Math.abs(gForce * (xDist / d)) * Math.sign(xDist);
    forceSum.y -= Math.abs(gForce * (yDist / d)) * Math.sign(yDist);
    p.vx += forceSum.x;
    p.vy += forceSum.y;

    // update edges
    if (d < threshold) {
        let strength = 0;
        if (n.haloRadius < d) {
            strength = (threshold - d) / (threshold - n.haloRadius) * 100;
        }
        edges[`${n.id}_${p.id}`].join(strength, burst);
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
 * Function governing how a particle reflexts from the edge of the canvas.
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