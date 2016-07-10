class Star {

    constructor(x, y, starSize, ctx) {
        this.x = x;
        this.y = y;
        this.ctx = ctx;
        this.angle = Math.atan(Math.abs(y)/Math.abs(x));
        this.starSize = starSize;
        this.high = 0;
    }

    drawStar(volume, framesElapsed) {
        var distanceFromCentre = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));

        // stars as lines
        var brightness = 200 + Math.min(Math.round(this.high * 5), 55);
        this.ctx.fillStyle= `rgba(${brightness}, ${brightness}, ${brightness}, ${Math.min(distanceFromCentre / this.ctx.canvas.width, 1)})`;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, distanceFromCentre / 100, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();

        // starfield movement coming towards the camera
        this.high -= Math.max(this.high - 0.00000001, 0);
        if (this.high < volume / 50) {
            this.high = volume / 50;
        }
        const speed = Math.pow(distanceFromCentre, 1.5) / 30000 * this.starSize * framesElapsed;
        var dX = Math.cos(this.angle) * speed;
        var dY = Math.sin(this.angle) * speed;
        this.x += this.x > 0 ? dX : -dX;
        this.y += this.y > 0 ? dY : -dY;

        var limitY = this.ctx.canvas.height/2 + 500;
        var limitX = this.ctx.canvas.width/2 + 500;
        if ((this.y > limitY || this.y < -limitY) || (this.x > limitX || this.x < -limitX)) {
            // it has gone off the edge so respawn it somewhere near the middle.
            this.x = (Math.random() - 0.5) * this.ctx.canvas.width/3;
            this.y = (Math.random() - 0.5) * this.ctx.canvas.height/3;
            this.angle = Math.atan(Math.abs(this.y)/Math.abs(this.x));
        }
    }
}

module.exports = Star;
