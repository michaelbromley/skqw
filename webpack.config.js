const path = require('path');
const webpack = require('webpack');
const ngtools = require('@ngtools/webpack');
const AotPlugin = require('@ngtools/webpack').AotPlugin;

// Webpack Plugins
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
let ENV = process.env.npm_lifecycle_event;
let isProd = ENV === 'app:build' || ENV === 'app:build-aot';

var externalsFn =  (function () {
    var IGNORES = [
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

module.exports = function (env) {

    const aotMode = env === 'aot';
    console.log(`building in ${aotMode ? 'aot' : 'jit'} mode...`);
    const entryFile = aotMode ? 'main.aot.ts' : 'bootstrap.ts';

    return [
        // Render process app
        (function makeWebpackConfig() {
            let config = {};

            config.name = 'render';
            if (isProd) {
                config.devtool = 'source-map';
            } else {
                config.devtool = 'eval-source-map';
            }

            config.node = {
                __dirname: false,
                __filename: false
            };
            config.target = 'electron-renderer';

            config.entry = {
                'render': path.resolve(__dirname, './src/render/', entryFile)
            };

            /**
             * Output
             * Reference: http://webpack.github.io/docs/configuration.html#output
             */
            config.output = {
                path: root('app'),
                filename: 'js/[name].js'
            };

            config.resolve = {
                // only discover files that have those extensions
                extensions: ['.ts', '.js', '.json', '.css', '.scss', '.html']
            };

            config.module = {
                loaders: [
                    // Support for .ts files.
                    {
                        test: /\.ts$/,
                        loaders: aotMode ? ['@ngtools/webpack'] : ['ts', 'angular2-template-loader']
                    },

                    // copy those assets to output
                    {test: /\.(svg|png|jpe?g|gif|woff|woff2|ttf|eot|ico)$/, loader: 'file?name=assets/[name].[ext]?'},
                    // all css required in src/app files will be merged in js files
                    {test: /\.css$/, loader: 'raw'},

                    // all css required in src/app files will be merged in js files
                    {test: /\.s[ac]ss$/, loader: 'raw!sass'},

                    // support for .html as raw text
                    {test: /\.html$/, loader: 'html'}
                ],
                noParse: [/.+zone\.js\/dist\/.+/, /.+angular2\/bundles\/.+/, /angular2-polyfills\.js/]
            };

            /**
             * Plugins
             * Reference: http://webpack.github.io/docs/configuration.html#plugins
             * List: http://webpack.github.io/docs/list-of-plugins.html
             */
            config.plugins = [];

            config.plugins.push(
                // Inject script and link tags into html files
                // Reference: https://github.com/ampedandwired/html-webpack-plugin
                new HtmlWebpackPlugin({
                    inject: true,
                    template: 'src/index.html',
                    chunksSortMode: packageSort(['polyfills', 'render'])
                }),

                // Copy assets from the public folder
                // Reference: https://github.com/kevlened/copy-webpack-plugin
                new CopyWebpackPlugin([
                    {
                        from: root('src/package.json')
                    },
                    {
                        context: './src',
                        from: 'node_modules/**/*',
                        to: ''
                    }
                ]),
                new webpack.DefinePlugin({
                    VERSION: JSON.stringify(require('./package.json').version)
                }),
                new AotPlugin({
                    tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
                    entryModule: path.resolve(__dirname, './src/render/app.module#AppModule'),
                    genDir: path.resolve(__dirname, './src/render/ngfactory'),
                })
            );

            config.externals = [externalsFn];

            return config;
        })(),
        // Main process app
        {
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
                    { test: /\.ts$/, loader: 'ts' }
                ]
            },
            externals: [externalsFn]
        }
    ];
};

// Helper functions
function root(args) {
    args = Array.prototype.slice.call(arguments, 0);
    return path.join.apply(path, [__dirname].concat(args));
}

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