import {logToFile} from './utils';
import {handleSquirrelEvent} from './squirrel-install';

logToFile('starting SKQW...');
if (handleSquirrelEvent()) {
    process.exit(0);
}

import {
    START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID,
    SET_GAIN, TOGGLE_NORMALIZATION, TOGGLE_FULLSCREEN, TOGGLE_DEVTOOLS, SET_SAMPLE_RATE
} from '../common/constants';
const {app, BrowserWindow, ipcMain, shell} = require('electron');
import {Analyzer} from './analyzer';
require('electron-debug')();

let mainWindow = null;
let analyzer = new Analyzer();
let fullscreen = false;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        minWidth: 600,
        minHeight: 400,
        backgroundColor: '#000'
    });
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    mainWindow.setMenu(null);

    // open external (target="_blank") links in browser.
    mainWindow.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
    });

    mainWindow.on('close', () => {
        sampleSubscription.unsubscribe();
    });
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

ipcMain.on(SET_GAIN, (event, val) => {
    analyzer.setGain(val);
});

ipcMain.on(SET_SAMPLE_RATE, (event, val) => {
    analyzer.setSampleRate(val);
});

ipcMain.on(TOGGLE_NORMALIZATION, (event, val) => {
    analyzer.toggleNormalization(val);
});

ipcMain.on(TOGGLE_FULLSCREEN, () => {
    fullscreen = !fullscreen;
    mainWindow.setFullScreen(fullscreen);
});

ipcMain.on(TOGGLE_DEVTOOLS, () => {
    mainWindow.webContents.toggleDevTools();
});
