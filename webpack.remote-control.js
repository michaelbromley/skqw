const {root, makeRenderConfig} = require('./webpack.common');
const path = require('path');

// Render process app
module.exports = function makeWebpackConfig(prodMode) {
    const entryFile = path.resolve(__dirname, './src/remote-control/bootstrap.ts');
    const indexHtml = 'src/remote-control/index.html';
    let config = makeRenderConfig('remote-control', entryFile, indexHtml, prodMode);

    config.output = {
        path: root('app', 'remote-control'),
        filename: '[name].js'
    };

    return config;
};
