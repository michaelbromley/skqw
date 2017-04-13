const path = require('path');

const externalsFn =  (function () {
    const IGNORES = [
        'node-core-audio',
        'electron'
    ];
    return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
            return callback(null, "require('" + request + "')");
        }
        return callback();
    };
})();

function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}

module.exports = {
    externalsFn,
    root
};
