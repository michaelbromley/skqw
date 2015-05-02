
function basic(skqw) {
    var ctx,
        ft,
        ts,
        w,
        h,
        params = {
            sensitivity: 250
        },
        paramsMetadata = {
            sensitivity : {
                min: 0,
                max: 500,
                step: 1
            }
        };

    return {
        name: 'A Basic Visualization',
        author: 'Michael Bromley',
        params: params,
        paramsMetadata: paramsMetadata,
        init: init,
        tick: tick
    };

    function init() {
        ctx = skqw.createCanvas().getContext('2d');
    }

    function tick(timestamp) {
        w = skqw.container.offsetWidth;
        h = skqw.container.offsetHeight;
        ft = skqw.stream.ft;
        ts = skqw.stream.ts;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        drawBars();
        drawWave();
    }

    function drawWave() {
        var length = ts.length,
            width = w / length;

        ts.forEach(function(val, i) {
            var x = i * width,
                y = h / 2 + val * params.sensitivity * 10;

            ctx.fillRect(x, y, 1, 1);
        });
    }

    function drawBars() {
        var length = ft.length,
            width = w / length;

        for(var i = 0; i < ft.length; i++) {
            var val = ft[i],
                x = i * width,
                height = val * params.sensitivity,
                y = h - height;

            ctx.fillRect(x, y, width, height);
        }
    }

}