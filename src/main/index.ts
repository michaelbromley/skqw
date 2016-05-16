import {START_ANALYZER, SAMPLE} from './constants';
const {app, BrowserWindow, ipcMain} = require('electron');

import {Analyzer} from './analyzer';

let mainWindow = null;
let analyzer = new Analyzer();

app.on('ready', function() {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
    mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');
});

analyzer.sample$
    .throttleTime(1000)
    .subscribe(sample => {
        if (mainWindow) {
            mainWindow.send(SAMPLE, sample);
        }
    });


ipcMain.on(START_ANALYZER, (event) => {
    analyzer.start();
    event.sender.send(SAMPLE, 'test');
});
