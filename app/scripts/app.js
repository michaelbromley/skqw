let ipc = require('electron').ipc;

var visLibrary = visLibrary || {};

(function() {

    visLibrary['basic'] = vis;

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
            params: params,
            paramsMetadata: {
                sensitivity : {
                    min: 0,
                    max: 500,
                    step: 1
                }
            }
        };

        function init() {
            ctx = skqw.createCanvas().getContext('2d');
        }

        function tick(timestamp) {
            w = skqw.width;
            h = skqw.height;
            ft = source.ft;
            ts = source.ts;
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

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

            for(var i = 0; i < ft.length; i++) {
                var val = ft[i],
                    x = i * width,
                    height = val * params.sensitivity / 2,
                    y = h - height;

                ctx.fillRect(x, y, width / 3, height);
            }
        }

    }

})();

/**
 *
 * @param {HTMLElement} containerElement
 * @returns {{stream: {ts, ft}, container: HTMLElement, loadVisualization: loadVisualization, setVisualization: setVisualization, start: start, createCanvas: createCanvas}}
 */
function SKQW(containerElement) {
    var ts = [],
        ft = [],
        started = false,
        library = {},
        current,
        canvases = [],
        w = containerElement.offsetWidth,
        h = containerElement.offsetHeight,
        resizeTimer;
    // debug - calculate sample frequency coming over socket
    var fps = 0, now, lastUpdate = (new Date)*1;


    window.addEventListener('resize', resizeHandler);

    return {
        stream: {
            get ts() {
                return ts;
            },
            get ft() {
                return ft;
            }
        },
        container: containerElement,
        get width() { return w; },
        get height() { return h; },
        loadVisualization: loadVisualization,
        setVisualization: setVisualization,
        getVisualization: getVisualization,
        start: start,
        createCanvas: createCanvas
    };

    function loadVisualization(name, fn) {
        library[name] = fn(this);
        return this;
    }

    function setVisualization(name) {
        if (!library[name]) {
            throw new Error('"' + name + '" has not been loaded into the visualization library.');
        }
        removeCanvases();
        current = name;
        library[current].init();
        return this;
    }

    function getVisualization() {
        return {
            name: current,
            fn: library[current]
        };
    }

    function start() {
        ft = source.ft;
        ts = source.ts;

        if (!started) {
            started = true;
            requestAnimationFrame(tick);
        }

        return this;
    }

    function tick(timestamp) {
        library[current].tick(timestamp);
        requestAnimationFrame(tick);
    }

    function createCanvas() {
        var canvas = document.createElement('canvas');
        containerElement.appendChild(canvas);
        canvas.width = containerElement.offsetWidth;
        canvas.height = containerElement.offsetHeight;
        canvases.push(canvas);
        return canvas;
    }

    /**
     * Debounce the resize handler since the resize even gets fired rapidly in
     * succession as the user resizes.
     */
    function resizeHandler() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(updateDimensions, 100);
    }

    /**
     * Update the w & h dimensions and set the canvas dimensions.
     */
    function updateDimensions() {
        w = containerElement.offsetWidth;
        h = containerElement.offsetHeight;

        canvases.forEach(function(c) {
            c.width = w;
            c.height = h;
        });
    }

    /**
     * Remove any existing canvases from the DOM.
     */
    function removeCanvases() {
        canvases.forEach(function(canvas) {
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        });
    }
}

let skqw = SKQW(document.querySelector('#container'));
skqw.loadVisualization('basic', visLibrary['basic']);
skqw.setVisualization('basic');
skqw.start();
