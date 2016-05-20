
/**
 * An example of the most basic kind of 2D visualization, to illustrate the expected format & API of a
 * skqw visualization plugin.
 */
module.exports = function defaultVis() {
    let ctx;
    let ft;
    let ts;
    let w;
    let h;
    let params = {
        sensitivity: {
            value: 250,
            type: 'range',
            min: 0,
            max: 500
        }
    };

    /**
     * The return value must be an object with the following required properties:
     * - name: the name of this visualization
     * - author: the author's name
     * - init: a function that will be called when the vis is started, and performs
     *         any set-ups that are required by the vis. Typically it would minimally
     *         make a call to skqw.createCanvas().
     * - tick: a function that performs the actual animation. This function will be called
     *         by skqw from a requestAnimationFrame(), and therefore has access to a timestamp.
     *
     * Optional properties:
     * - params: exposes any user-configurable parameters for the vis.
     * - paramsMetadata: defines metadata for the params - useful for automatic GUI generation.
     */
    return {
        name: 'A Basic Visualization',
        author: 'Michael Bromley',
        init: init,
        tick: tick,
        params: params
    };

    function init(skqw) {
        ctx = skqw.createCanvas().getContext('2d');
    }

    function tick(skqw) {
        w = skqw.dimensions().width;
        h = skqw.dimensions().height;
        ft = skqw.sample().ft;
        ts = skqw.sample().ts;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);
        drawBars();
        drawWave();
    }

    function drawWave() {
        var length = ts.length,
            width = w / length;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 5;

        for(var i = 0; i < ts.length; i++) {
            var val = ts[i],
                x = i * width,
                y = h / 2 + val * params.sensitivity.value * 10;

            if (i === 0) {
                ctx.beginPath(x, y);
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    function drawBars() {
        var length = ft.length,
            width = w / length;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        for(var i = 0; i < ft.length; i++) {
            var val = ft[i],
                x = i * width,
                height = val * params.sensitivity.value / 2,
                y = h - height;

            ctx.fillRect(x, y, width / 3, height);
        }
    }

};
