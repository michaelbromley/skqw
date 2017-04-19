const {makeRenderConfig, root} = require('./webpack.common');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// Render process app
module.exports = function makeWebpackConfig(prodMode) {
    const entryFile = path.resolve(__dirname, './src/render/bootstrap.ts');
    const indexHtml = 'src/index.html';
    let config = makeRenderConfig('render', entryFile, indexHtml, prodMode);

    config.plugins.push(
        new CopyWebpackPlugin([
            {
                from: root('src/package.json')
            },
            {
                context: './src',
                from: 'assets/icons*/*.woff2',
                to: ''
            },
            {
                context: './src',
                from: 'node_modules/**/*',
                to: ''
            },
            {
                context: './node_modules/three/build',
                from: '*.js',
                to: 'vendor/three'
            },
            {
                context: './src/library',
                from: '**/*',
                to: 'library'
            }
        ])
    );

    return config;
};

function packageSort(packages) {
    var len = packages.length - 1;
    var first = packages[0];
    var last = packages[len];
    return function sort(a, b) {
        // polyfills always first
        if (a.names[0] === first) {
            return -1;
        }
        // main always last
        if (a.names[0] === last) {
            return 1;
        }
        // vendor before app
        if (a.names[0] !== first && b.names[0] === last) {
            return -1;
        } else {
            return 1;
        }
    }
}
