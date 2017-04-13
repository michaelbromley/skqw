const {externalsFn, root} = require('./webpack.common');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

// Render process app
module.exports = function makeWebpackConfig(prodMode) {
    let config = {};

    config.name = 'render';
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
        'render': path.resolve(__dirname, './src/render/bootstrap.ts')
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
                loaders: /*aotMode ? ['@ngtools/webpack'] :*/ ['ts-loader', 'angular2-template-loader']
            },

            // copy those assets to output
            {test: /\.(svg|png|jpe?g|gif|woff|woff2|ttf|eot|ico)$/, loader: 'file-loader?name=assets/[name].[ext]?'},
            // all css required in src/app files will be merged in js files
            {test: /\.css$/, loader: 'raw-loader'},

            // all css required in src/app files will be merged in js files
            {test: /\.s[ac]ss$/, loader: 'raw-loader!sass-loader'},

            // support for .html as raw text
            {test: /\.html$/, loader: 'html-loader'}
        ],
        noParse: [
            /.+zone\.js\/dist\/.+/,
            /.+angular2\/bundles\/.+/,
            /angular2-polyfills\.js/,
            /node_modules\/json-schema\/lib\/validate\.js/
        ]
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
        ]),
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
        /*,

         new AotPlugin({
         tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
         entryModule: path.resolve(__dirname, './src/render/app.module#AppModule'),
         genDir: path.resolve(__dirname, './src/render/ngfactory'),
         })*/
    );

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
