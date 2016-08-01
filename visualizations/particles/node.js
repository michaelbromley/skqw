const HALO_DECAY = 1.3;
const ACC = 0.99;
const MAX_V = 1;

class Node {

    constructor(ctx, x, y, id) {
        this.id = id;
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.haloRadius = 0;
    }

    /**
     * Render the particle.
     * @param value
     * @param width
     */
    render(value = 10, width) {
        const val = Math.log(value * value + Math.E) * 7;
        const widthFactor =  width / 1000;
        this.haloRadius = this.getNewHaloRadius(this.haloRadius, val, widthFactor);
        this.v = this.getNewSpeed(this.v, val);

        // draw halo
        this.ctx.strokeStyle = `rgba(100, 100, 100, ${Math.min(this.haloRadius / 50, 0.8)})`;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.haloRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        //this.ctx.stroke();
        //this.ctx.fill();
    }

    getNewHaloRadius(current, val, widthFactor) {
        if (current < val * widthFactor) {
            return val * widthFactor;
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
