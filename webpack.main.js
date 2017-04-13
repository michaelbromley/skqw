const {externalsFn, root} = require('./webpack.common');

/**
 * Webpack config for the "main" electron process.
 */
module.exports = {
    name: 'main',
    target: 'node',
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    entry: {
        'main': './src/main/index.ts'
    },
    output: {
        path: root('app'),
        filename: 'index.js'
    },
    module: {
        loaders: [
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },
    externals: [externalsFn]
};
