import {START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../common/constants';
const {app, BrowserWindow, ipcMain} = require('electron');

import {Analyzer} from './analyzer';

let mainWindow = null;
let analyzer = new Analyzer();

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800
    });
    mainWindow.loadUrl('file://' + __dirname + '/dist/index.html');
});

app.on('before-quit', () => {
   sampleSubscription.unsubscribe();
});

let sampleSubscription = analyzer.sample$.subscribe(sample => {
    if (mainWindow) {
        mainWindow.send(SAMPLE, sample);
    }
});

ipcMain.on(START_ANALYZER, () => {
    analyzer.start();
});

ipcMain.on(REQUEST_DEVICE_LIST, (event) => {
    event.sender.send(RECEIVE_DEVICE_LIST, analyzer.listAudioDevices());
});

ipcMain.on(SET_INPUT_DEVICE_ID, (event, id) => {
    analyzer.setOptions({ inputDevice: id });
});
