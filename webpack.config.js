const path = require('path');
const webpack = require('webpack');
const webpackMainConfig = require('./webpack.main');
const webpackRenderConfig = require('./webpack.render');

// Get npm lifecycle event to identify the environment
const ENV = process.env.npm_lifecycle_event;
const prodMode = ENV === 'app:build' || ENV === 'app:build-aot';

module.exports = function (env) {

    const aotMode = env === 'aot';
    console.log(`building in ${aotMode ? 'aot' : 'jit'} mode...`);

    return [webpackRenderConfig(prodMode), webpackMainConfig];
};