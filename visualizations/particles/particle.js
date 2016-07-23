const TOP_SPEED = 2;
const DECELERATION = 5;

class Particle {

    constructor(ctx, width, height, id) {
        this.id = id;
        this.ctx = ctx;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = 5;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    tick(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        let frames = (timestamp - this.lastTimestamp) / 16.666;
        this.x += this.vx * frames;
        this.y += this.vy * frames;
        this.lastTimestamp = timestamp;
        if (TOP_SPEED < Math.abs(this.vx)) {
            this.vx *= DECELERATION;
        }
        if (TOP_SPEED < Math.abs(this.vy)) {
            this.vy *= DECELERATION;
        }

    }
}

module.exports = Particle;