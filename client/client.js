var skqw;

window.addEventListener('load', init);

function init() {
    skqw = SKQW(document.querySelector('#container'));

    for(var key in visLibrary) {
        if (visLibrary.hasOwnProperty(key)) {
            var visFn = visLibrary[key];
            skqw.loadVisualization(key, visFn);
        }
    }

    skqw.setVisualization(Object.keys(visLibrary)[0]);
    skqw.start();

    skqwDat(skqw);
}