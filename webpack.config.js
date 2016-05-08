// Helper: root(), and rootDir() are defined at the bottom
var path = require('path');
var webpack = require('webpack');

// Webpack Plugins
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

/**
 * Env
 * Get npm lifecycle event to identify the environment
 */
var ENV = process.env.npm_lifecycle_event;
var isProd = ENV === 'app:build';

module.exports = [
    function makeWebpackConfig() {
        var config = {};

        config.name = 'render';
        if (isProd) {
            config.devtool = 'source-map';
        } else {
            config.devtool = 'eval-source-map';
        }

        // add debug messages
        config.debug = !isProd;

        /**
         * Entry
         * Reference: http://webpack.github.io/docs/configuration.html#entry
         */
        config.entry = {
            'polyfills': './src/render/polyfills.ts',
            'render': './src/render/bootstrap.ts' // our angular app
        };

        /**
         * Output
         * Reference: http://webpack.github.io/docs/configuration.html#output
         */
        config.output = {
            path: root('dist'),
            filename: 'js/[name].js'
        };

        /**
         * Resolve
         * Reference: http://webpack.github.io/docs/configuration.html#resolve
         */
        config.resolve = {
            cache: true,
            root: root(),
            // only discover files that have those extensions
            extensions: ['', '.ts', '.js', '.json', '.css', '.scss', '.html']
        };

        /**
         * Loaders
         * Reference: http://webpack.github.io/docs/configuration.html#module-loaders
         * List: http://webpack.github.io/docs/list-of-loaders.html
         * This handles most of the magic responsible for converting modules
         */
        config.module = {
            loaders: [
                // Support for .ts files.
                {
                    test: /\.ts$/,
                    loader: 'ts',
                    query: {
                        'ignoreDiagnostics': [
                            2403, // 2403 -> Subsequent variable declarations
                            2300, // 2300 -> Duplicate identifier
                            2374, // 2374 -> Duplicate number index signature
                            2375, // 2375 -> Duplicate string index signature
                            2502  // 2502 -> Referenced directly or indirectly
                        ]
                    }
                },

                // copy those assets to output
                {test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/, loader: 'file?name=fonts/[name].[ext]?'},

                // all css required in src/app files will be merged in js files
                {test: /\.css$/, loader: 'raw'},

                // all css required in src/app files will be merged in js files
                {test: /\.scss$/, loader: 'raw!sass'},

                // support for .html as raw text
                // todo: change the loader to something that adds a hash to images
                {test: /\.html$/, loader: 'raw'}
            ],
            postLoaders: [],
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
            })
        );

        // Add build specific plugins
        if (isProd) {
            config.plugins.push(
                // Reference: http://webpack.github.io/docs/list-of-plugins.html#noerrorsplugin
                // Only emit files when there are no errors
                new webpack.NoErrorsPlugin(),

                // Reference: http://webpack.github.io/docs/list-of-plugins.html#dedupeplugin
                // Dedupe modules in the output
                new webpack.optimize.DedupePlugin(),

                // Reference: http://webpack.github.io/docs/list-of-plugins.html#uglifyjsplugin
                // Minify all javascript, switch loaders to minimizing mode
                new webpack.optimize.UglifyJsPlugin({
                    // Angular 2 is broken again, disabling mangle until beta 6 that should fix the thing
                    // Todo: remove this with beta 6
                    mangle: false
                }),

                // Copy assets from the public folder
                // Reference: https://github.com/kevlened/copy-webpack-plugin
                new CopyWebpackPlugin([{
                    from: root('src/public')
                }])
            );
        }

        /**
         * Sass
         * Reference: https://github.com/jtangelder/sass-loader
         * Transforms .scss files to .css
         */
        config.sassLoader = {

        };

        return config;
    }(),
    {
        name: 'main',
        target: 'node',
        node: {
          __dirname: false,
          __filename: false
        },
        entry: {
            'main': './src/main/index.ts'
        },
        output: {
            path: root(),
            filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loader: 'ts',
                    query: {
                        'ignoreDiagnostics': []
                    }
                }
            ]
        },
        externals: [
            (function () {
                var IGNORES = [
                    'electron'
                ];
                return function (context, request, callback) {
                    if (IGNORES.indexOf(request) >= 0) {
                        return callback(null, "require('" + request + "')");
                    }
                    return callback();
                };
            })()
        ]
    }
];

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