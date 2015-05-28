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

    function start(source) {
        source = source || 'socket';

        if (source === 'socket') {
            var socket = io();
            socket.on('sample', function (stream) {
                ft = new Float32Array(stream.ft);
                ts = stream.ts;

                if (!started) {
                    started = true;
                    requestAnimationFrame(tick);
                }
            });
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