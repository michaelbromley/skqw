window.addEventListener('load', init);

function init() {
    var instance = skqw(document.querySelector('#container'))
        .loadVisualization('basic', basic)
        .setVisualization('basic')
        .start();

    skqwDat(instance);
}