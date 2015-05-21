var visLibrary = visLibrary || {};

(function() {

    visLibrary['basic2'] = vis;


    /**
     * An example of the most basic kind of 2D visualization, to illustrate the expected format & API of a
     * skqw visualization plugin.
     *
     * @param skqw
     * @returns {{name: string, author: string, params: {sensitivity: number}, paramsMetadata: {sensitivity: {min: number, max: number, step: number}}, init: init, tick: tick}}
     */
    function vis(skqw) {
        var ctx,
            ft,
            ts,
            w,
            h,
            params = {
                sensitivity: 250
            },
            paramsMetadata = {
                sensitivity: {
                    min: 0,
                    max: 500,
                    step: 1
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
            name: 'Another Basic Visualization',
            author: 'Michael Bromley',
            init: init,
            tick: tick,
            params: params,
            paramsMetadata: paramsMetadata
        };

        function init() {
            ctx = skqw.createCanvas().getContext('2d');
        }

        function tick(timestamp) {
            w = skqw.width;
            h = skqw.height;
            ft = skqw.stream.ft;
            ts = skqw.stream.ts;

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

            for (var i = 0; i < ts.length; i++) {
                var val = ts[i],
                    x = i * width,
                    y = h / 2 + val * params.sensitivity * 10;

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

            ctx.fillStyle = 'green';

            for (var i = 0; i < ft.length; i++) {
                var val = ft[i],
                    x = i * width,
                    height = val * params.sensitivity / 2,
                    y = h - height;

                ctx.fillRect(x, y, width / 3, height);
            }
        }

    }

})();