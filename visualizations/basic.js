
/**
 * An example of the most basic kind of 2D visualization, to illustrate the expected format & API of a
 * skqw visualization plugin.
 */
module.exports = function defaultVis() {
    let ctx;
    let params = {
        sensitivity: {
            value: 250,
            type: 'range',
            label: 'sensitivity',
            min: 0,
            max: 500
        },
        showLines: {
            value: true,
            type: 'boolean',
            label: 'Show time series'
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
        let w = skqw.dimensions().width;
        let h = skqw.dimensions().height;
        let ft = skqw.sample().ft;
        let ts = skqw.sample().ts;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);
        drawBars(w, h, ft);
        if (params.showLines.value === true) {
            drawWave(w, h, ts);
        }
    }

    function drawWave(w, h, ts) {
        let length = ts.length,
            width = w / length;

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 5;

        for(let i = 0; i < ts.length; i++) {
            let val = ts[i];
            let x = i * width;
            let y = h / 2 + val * params.sensitivity.value * 10;

            if (i === 0) {
                ctx.beginPath(x, y);
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }

    function drawBars(w, h, ft) {
        let length = ft.length;
        let width = w / length;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        for(let i = 0; i < ft.length; i++) {
            let val = ft[i];
            let x = i * width;
            let height = val * params.sensitivity.value / 2;
            let y = h - height;

            ctx.fillRect(x, y, width / 3, height);
        }
    }

};
