const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

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

function makeRenderConfig(name, entryFile, indexHtml, prodMode) {
    let config = {};

    config.name = name;
    if (prodMode) {
        config.devtool = 'eval';
    } else {
        config.devtool = 'eval-source-map';
    }
    config.node = {
        __dirname: false,
        __filename: false
    };
    config.target = 'electron-renderer';

    config.entry = {
        [name]: entryFile
    };

    config.output = {
        path: root('app'),
        filename: '[name].js'
    };

    config.resolve = {
        // only discover files that have those extensions
        extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html']
    };

    config.module = {
        loaders: [
            {
                test: /\.ts$/,
                loaders: /*aotMode ? ['@ngtools/webpack'] :*/ ['ts-loader', 'angular2-template-loader']
            },
            {test: /\.(svg|png|jpe?g|gif|woff|woff2|ttf|eot|ico)$/, loader: 'file-loader?name=assets/[name].[ext]?'},
            {test: /\.css$/, loader: 'raw-loader'},
            {test: /\.s[ac]ss$/, loader: 'raw-loader!sass-loader'},
            {test: /\.html$/, loader: 'html-loader'}
        ],
        noParse: [
            /.+zone\.js\/dist\/.+/,
            /.+angular2\/bundles\/.+/,
            /angular2-polyfills\.js/,
            /node_modules\/json-schema\/lib\/validate\.js/
        ]
    };

    config.plugins = [
        new HtmlWebpackPlugin({
            inject: true,
            template: indexHtml
        }),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(require('./package.json').version)
        }),

        new webpack.LoaderOptionsPlugin({
            options: {
                context: __dirname,
                sassLoader: {
                    includePaths: [path.resolve(__dirname, "./src/render/styles/")]
                },
                resolve: {
                    extensions: ['.ts', '.tsx', '.js']
                }
            }
        })
    ];

    if (prodMode) {
        config.plugins.push(
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                },
                output: {
                    comments: false,
                }
            })
        );
    }
    config.externals = [externalsFn];

    return config;
}

module.exports = {
    externalsFn,
    root,
    makeRenderConfig
};
