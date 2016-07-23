const POINT_DECAY = 3.6;
const HALO_DECAY = 2.3;
const ACC = 0.99;
const MAX_V = 1;

class Node {

    constructor(ctx, x, y, id) {
        this.id = id;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.haloRadius = 0;
    }

    /**
     * Render the particle.
     * @param value
     */
    render(value = 10) {
        let val = Math.log(value * value + Math.E) * 7;
        this.radius = this.getNewRadius(this.radius, val);
        this.haloRadius = this.getNewHaloRadius(this.haloRadius, val);
        this.v = this.getNewSpeed(this.v, val);

        // draw halo
        this.ctx.strokeStyle = `rgba(100, 100, 100, ${Math.min(this.haloRadius / 50, 0.8)})`;
        // this.ctx.fillStyle = 'rgb(0, 0, 0)';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.haloRadius, 0, 2 * Math.PI);
        // this.ctx.fill();
        this.ctx.stroke();

        // draw point
        let hue = this.radius * 5;
        this.ctx.fillStyle = `hsla(${hue}, 70%, 10%, 1)`;
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

module.exports = Node;
