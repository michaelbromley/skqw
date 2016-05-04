/**
 * Plugin for skqw that uses dat.gui (https://github.com/dataarts/dat.gui) to auto-generate
 * UI controls for each of the params defined on the current visualization.
 */
var datGui;

function skqwDat(vis) {
    datGui = datGui || new dat.GUI();



    for (var prop in vis.params) {
        if (vis.params.hasOwnProperty(prop)) {
            addParamToGui(vis, prop);
        }
    }

    function addParamToGui(vis, prop) {
        var metadata = vis.paramsMetadata[prop],
            min = typeof metadata.min === 'undefined' ? undefined : metadata.min,
            max = typeof metadata.max === 'undefined' ? undefined : metadata.max,
            step = typeof metadata.step === 'undefined' ? undefined : metadata.step,
            added;

        if (existy(min) && existy(max)) {
            added = datGui.add(vis.params, prop, min, max);
        } else {
            added = datGui.add(vis.params, prop);
        }

        if (existy(step)) {
            added.step(step);
        }

    }

    /**
     * Is the value not null or undefined?
     * @param val
     * @returns {boolean}
     */
    function existy(val) {
        return typeof val != null;
    }
}