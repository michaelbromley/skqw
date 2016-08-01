const TOP_SPEED = 0.5;
const DECELERATION = 0.5;

class Particle {

    constructor(ctx, width, height, id) {
        this.id = id;
        this.ctx = ctx;
        this.position(width, height);
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.hue = 1;
        this.strength = 0;
    }

    position(width, height) {
        this.radius = Math.round(Math.random() * 5 * width / 1000);
        this.x = Math.random() * width;
        this.y = Math.random() * height;
    }

    touch(hue, strength) {
        this.hue = hue;
        if (this.strength < strength) {
            this.strength = strength;
        }
    }

    render(width, height) {
        const fillStyle =  `hsla(${this.hue}, ${Math.min(this.strength, 100)}%, 50%, ${this.radius / 3}`;
        this.ctx.fillStyle = fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();

    }

    tick(timestamp) {
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        let frames = (timestamp - this.lastTimestamp) / 16.666;
        this.x += this.vx * frames * this.radius / 3;
        this.y += this.vy * frames * this.radius / 3;
        this.lastTimestamp = timestamp;
        if (TOP_SPEED < Math.abs(this.vx)) {
            this.vx *= DECELERATION;
        }
        if (TOP_SPEED < Math.abs(this.vy)) {
            this.vy *= DECELERATION;
        }

        if (100 < Math.abs(this.vx) || 100 < Math.abs(this.vy)) {
            //if (false) {
            console.log('fast', this.vx, this.vy, this);
        }

        if (1 < this.strength) {
            this.strength -= 0.4;
        }
    }
}

module.exports = Particle;