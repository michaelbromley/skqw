const {app, BrowserWindow} = require('electron');

import {Analyzer} from './analyzer';

let mainWindow = null;

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
 
    mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');
});

