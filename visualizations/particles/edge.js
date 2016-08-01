const DECAY = 1;

class Edge {
    constructor(ctx, particle, node, hue) {
        this.ctx = ctx;
        this.particle = particle;
        this.node = node;
        this.strength = 0;
        this.burst = 0;
        this.hue = hue;
    }

    join(strength, burst) {
        if (strength === 0 || this.strength < strength) {
            this.strength = Math.min(strength, 100);
        }
        if (this.burst * 5 < burst) {
            this.burst = burst * 50;
        }
    }

    render() {
        if (DECAY < this.strength) {
            this.ctx.strokeStyle = `hsla(${this.hue}, ${Math.min(this.burst, 100)}%, 50%, ${this.strength / 100}`;
            this.ctx.lineWidth = Math.min(Math.max(this.burst / 20, 2), 3);
            let node = this.node;
            let particle = this.particle;
            let dx = node.x - particle.x;
            let dy = node.y - particle.y;
            let angleP = Math.atan2(dy, dx) - Math.PI;
            let sx = Math.cos(angleP) * node.haloRadius;
            let sy = Math.sin(angleP) * node.haloRadius;
            this.ctx.beginPath();
            this.ctx.moveTo(node.x + sx, node.y + sy);
            this.ctx.lineTo(particle.x, particle.y);
            this.ctx.stroke();

            this.ctx.lineWidth = 1;

            this.strength -= DECAY;
        }
        if (DECAY * 3 < this.burst) {
            this.burst -= DECAY * 3;
        }
    }
}

module.exports = Edge;