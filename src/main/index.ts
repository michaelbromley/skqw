import {
    CLOSE_DEVTOOLS,
    CLOSE_REMOTE_CONTROL,
    OPEN_DEVTOOLS,
    OPEN_REMOTE_CONTROL,
    RECEIVE_DEVICE_LIST,
    REQUEST_DEVICE_LIST,
    SAMPLE,
    SET_GAIN,
    SET_INPUT_DEVICE_ID,
    SET_SAMPLE_RATE,
    START_ANALYZER,
    STATE_CHANGE,
    TOGGLE_DEVTOOLS,
    TOGGLE_FULLSCREEN,
    TOGGLE_NORMALIZATION
} from '../common/constants';
import {Analyzer} from './analyzer';
const {app, BrowserWindow, ipcMain, shell} = require('electron');
require('electron-debug')();

let mainWindow = null;
let remoteWindow = null;
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

    mainWindow.webContents.on('devtools-opened', () => {
        mainWindow.webContents.send(OPEN_DEVTOOLS);
    });

    mainWindow.webContents.on('devtools-closed', () => {
        mainWindow.webContents.send(CLOSE_DEVTOOLS);
    });

    mainWindow.on('close', () => {
        sampleSubscription.unsubscribe();
        if (remoteWindow && !remoteWindow.isDestroyed()) {
            remoteWindow.close();
        }
    });
});

app.on('window-all-closed', function() {
    app.quit();
});

let sampleSubscription = analyzer.sample$.subscribe(sample => {
    if (mainWindow) {
        mainWindow.send(SAMPLE, sample);
    }
});

ipcMain.on(OPEN_REMOTE_CONTROL, () => {
    if (remoteWindow && !remoteWindow.isDestroyed()) {
        return;
    }
    remoteWindow = new BrowserWindow({
        height: 600,
        width: 400,
        minWidth: 300,
        minHeight: 200,
        backgroundColor: '#222',
        show: false,
        frame: true
    });
    remoteWindow.loadURL('file://' + __dirname + '/remote-control/index.html');
    remoteWindow.setMenu(null);
    remoteWindow.once('ready-to-show', () => {
        remoteWindow.show();
    });
});

ipcMain.on(CLOSE_REMOTE_CONTROL, () => {
    remoteWindow.close();
    remoteWindow = null;
});

ipcMain.on(START_ANALYZER, () => {
    analyzer.start();
});

ipcMain.on(STATE_CHANGE, (event, change) => {
    mainWindow.webContents.send(STATE_CHANGE, change);
    try {
        if (remoteWindow && !remoteWindow.isDestroyed()) {
            remoteWindow.webContents.send(STATE_CHANGE, change);
        }
    } catch (e) {
        throw new Error('sod it all');
    }
})

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
