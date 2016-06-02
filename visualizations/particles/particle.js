const POINT_DECAY = 0.6;
const HALO_DECAY = 0.3;
const ACC = 0.99;
const MAX_V = 1;

class Particle {

    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.radius = 0;
        this.haloRadius = 0;
        this.dx = Math.random() - 0.5;
        this.dy = Math.random() - 0.5;
        this.v = 0.1;
        this.resize(canvasWidth, canvasHeight);
    }

    resize(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
    }

    /**
     * Move the particle to the next position
     */
    step() {
        let nextX = this.x + this.dx;
        let nextY = this.y + this.dy;
        if (nextX < 0 || this.canvasWidth < nextX) {
            this.dx *= -1;
        }
        if (nextY < 0 || this.canvasHeight < nextY) {
            this.dy *= -1;
        }

        this.x += (this.dx * this.v);
        this.y += (this.dy * this.v);
    }

    /**
     * Render the particle.
     * @param value
     */
    render(value = 10) {
        let val = value * 0.5;
        this.radius = this.getNewRadius(this.radius, val);
        this.haloRadius = this.getNewHaloRadius(this.haloRadius, val);
        this.v = this.getNewSpeed(this.v, val);

        // draw halo
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(this.haloRadius / 50, 0.8)})`;
        // this.ctx.fillStyle = 'rgb(0, 0, 0)';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.haloRadius, 0, 2 * Math.PI);
        // this.ctx.fill();
        this.ctx.stroke();

        // draw point
        let hue = this.radius * 10;
        this.ctx.fillStyle = `hsla(${hue}, 70%, 50%, ${this.radius / 200})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    getNewRadius(current, val) {
        if (current < val) {
            return val;
        } else if (POINT_DECAY < current) {
            return current - POINT_DECAY;
        }
        return val;
    }

    getNewHaloRadius(current, val) {
        if (current < val) {
            return val;
        } else if (HALO_DECAY < current) {
            return current - HALO_DECAY;
        }
        return val;
    }

    getNewSpeed(current, val) {
        let speed = val * 0.0005;
        if (current < MAX_V) {
            current += speed;
        }
        current *= ACC;
        return current;
    }
}

module.exports = Particle;
