const ROTATION_STEP = 0.001;

class Polygon {

    constructor(sides, x, y, tileSize, ctx, num) {
        this.sides = sides;
        this.tileSize = tileSize;
        this.ctx = ctx;
        this.num = num; // the number of the tile, starting at 0
        this.radius = 0; // the highest colour value, which then fades out
        this.decay = this.num > 42 ? 1.5 : 2; // increase this value to fade out faster.
        this.highlight = 0; // for highlighted stroke effect;

        // figure out the x and y coordinates of the center of the polygon based on the
        // 60 degree XY axis coordinates passed in
        let step = Math.round(Math.cos(Math.PI / 6) * tileSize * 2);
        this.y = Math.round(step * Math.sin(Math.PI / 3) * -y);
        this.x = Math.round((x * step) + (y * step / 2));

        // calculate the vertices of the polygon
        this.vertices = [];
        for (let i = 1; i <= this.sides;i += 1) {
            let _x = this.x + this.tileSize * Math.cos(i * 2 * Math.PI / this.sides + Math.PI/6);
            let _y = this.y + this.tileSize * Math.sin(i * 2 * Math.PI / this.sides + Math.PI/6);
            this.vertices.push([_x, _y]);
        }
    }

    /**
     * Rotate all the vertices to achieve the overall rotational effect
     */
    rotateVertices(volume) {
        let rotation = ROTATION_STEP;
        rotation -= this.invert(volume) ? Math.sin(Math.log2(volume) / 2000) : 0;
        for (let i = 0; i <= this.sides-1;i += 1) {
            this.vertices[i][0] = this.vertices[i][0] -  this.vertices[i][1] * Math.sin(rotation);
            this.vertices[i][1] = this.vertices[i][1] +  this.vertices[i][0] * Math.sin(rotation);
        }
    }

    calculateOffset(coords, volume, params) {
        let adjustedDepth = this.invert(volume) ? 1 - (params.depth.value - 1) / (params.depth.max - 1) : params.depth.value;
        let angle = Math.atan(coords[1]/coords[0]);
        let distance = Math.sqrt(Math.pow(coords[0], 2) + Math.pow(coords[1], 2)); // a bit of pythagoras
        let mentalFactor = Math.min(Math.max((Math.tan(volume/6000) * 0.5), -20), 2); // this factor makes the visualization go crazy wild
        let offsetFactor = Math.pow(distance/3, 2) * (volume * Math.log2(adjustedDepth) / 100000) * (Math.pow(this.radius, 1.3)/500) * mentalFactor;
        let offsetX = Math.cos(angle) * offsetFactor;
        let offsetY = Math.sin(angle) * offsetFactor;
        offsetX *= (coords[0] < 0) ? -1 : 1;
        offsetY *= (coords[0] < 0) ? -1 : 1;
        return [offsetX, offsetY];
    };

    render(ft, volume, tileCount, params) {
        let bucket = Math.ceil(ft.length / tileCount * this.num);
        let val = ft[bucket] * params.sensitivity.value;
        // let val = Math.pow((ft[bucket]/25),2)*255;
        val *= this.num > 42 ? 1.1 : 1;
        // establish the value for this tile
        if (val > this.radius) {
            this.radius = val;
        } else {
            this.radius -= this.decay;
            val = this.radius;
        }

        // figure out what colour to fill it and then draw the polygon
        let r, g, b, a;
        if (val > 0) {
            this.ctx.beginPath();
            let offset = this.calculateOffset(this.vertices[0], volume, params);
            this.ctx.moveTo(this.vertices[0][0] + offset[0], this.vertices[0][1] + offset[1]);
            // draw the polygon
            for (let i = 1; i <= this.sides-1;i += 1) {
                offset = this.calculateOffset(this.vertices[i], volume, params);
                this.ctx.lineTo (this.vertices[i][0] + offset[0], this.vertices[i][1] + offset[1]);
            }
            this.ctx.closePath();

            if (val > 128) {
                r = (val-128)*2;
                g = ((Math.cos((2*val/128*Math.PI/2)- 4*Math.PI/3)+1)*128);
                b = (val-105)*3;
            }
            else if (val > 175) {
                r = (val-128)*2;
                g = 255;
                b = (val-105)*3;
            }
            else {
                r = ((Math.cos((2*val/128*Math.PI/2))+1)*128);
                g = ((Math.cos((2*val/128*Math.PI/2)- 4*Math.PI/3)+1)*128);
                b = ((Math.cos((2.4*val/128*Math.PI/2)- 2*Math.PI/3)+1)*128);
            }
            if (val > 210) {
                this.cubed = val; // add the cube effect if it's really loud
            }
            if (val > 100) {
                this.highlight = 100; // add the highlight effect if it's pretty loud
            }
            // set the alpha
            a = Math.log2(val) / 30;

            this.ctx.fillStyle = "rgba(" +
                Math.round(r) + ", " +
                Math.round(g) + ", " +
                Math.round(b) + ", " +
                a + ")";
            this.ctx.fill();
            // stroke
            if (val > 20) {
                let strokeVal = 20;
                this.ctx.strokeStyle =  "rgba(" + strokeVal + ", " + strokeVal + ", " + strokeVal + ", 0.5)";
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        }
    }

    drawHighlight(volume, params) {
        this.ctx.beginPath();
        // draw the highlight
        let offset = this.calculateOffset(this.vertices[0], volume, params);
        this.ctx.moveTo(this.vertices[0][0] + offset[0], this.vertices[0][1] + offset[1]);
        // draw the polygon
        for (let i = 0; i <= this.sides-1;i += 1) {
            offset = this.calculateOffset(this.vertices[i], volume, params);
            this.ctx.lineTo (this.vertices[i][0] + offset[0], this.vertices[i][1] + offset[1]);
        }
        this.ctx.closePath();
        let a = this.highlight/100;
        this.ctx.strokeStyle =  "rgba(255, 255, 255, " + a + ")";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.highlight -= 0.5;
    }

    /**
     * Returns true is volume is above a certain threshold, which causes
     * depth and rotation to invert.
     * @param volume
     * @returns {boolean}
     */
    invert(volume) {
        return volume > 3500;
    }
}

module.exports = Polygon;
