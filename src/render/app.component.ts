import {Component} from '@angular/core';
import {START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../main/constants';
import {ISample} from '../main/analyzer';
import {Visualizer} from './components/visualizer/visualizer.component';
import {InputSelector} from './components/input-selector/input-selector.component';
const ipcRenderer = require('electron').ipcRenderer;

@Component({
    selector: 'app',
    template: require('./app.component.html'),
    directives: [Visualizer, InputSelector]
})
export class App {

    sample: ISample = { ft: new Float32Array([]), ts: new Float32Array([]) };
    inputs: any;

    constructor() {
    }

    ngOnInit(): void {
        ipcRenderer.send(START_ANALYZER);
        ipcRenderer.send(REQUEST_DEVICE_LIST);
        ipcRenderer.on(SAMPLE, (event, sample: ISample) => {
            this.sample = sample;
        });
        ipcRenderer.on(RECEIVE_DEVICE_LIST, (event, list) => {
            this.inputs = list;
        });
    }
    
    changeInputDeviceId(id: number): void {
        console.log('changing input device to id', id);
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }
}
