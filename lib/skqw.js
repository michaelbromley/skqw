/**
 *
 * @param {HTMLElement} containerElement
 * @returns {{stream: {ts, ft}, container: HTMLElement, loadVisualization: loadVisualization, setVisualization: setVisualization, start: start, createCanvas: createCanvas}}
 */
function skqw(containerElement) {
    var ts = [],
        ft = [],
        started = false,
        library = {},
        current;

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
        current = name;
        library[current].init();
        return this;
    }

    function getVisualization() {
        return library[current];
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
        return canvas;
    }
}