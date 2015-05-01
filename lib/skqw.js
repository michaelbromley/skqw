/**
 *
 * @param {HTMLElement} containerElement
 * @returns {{stream: {ts, ft}, container: HTMLElement, setVisualization: setVisualization, start: start, createCanvas: createCanvas}}
 */
function skqw(containerElement) {
    var ts = [],
        ft = [],
        started = false,
        vis;

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
        setVisualization: setVisualization,
        start: start,
        createCanvas: createCanvas
    };

    function setVisualization(newVis) {
        vis = newVis(this);
        vis.init();
        return this;
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
    }

    function tick(timestamp) {
        vis.tick(timestamp);
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