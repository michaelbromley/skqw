import {Component} from '@angular/core';
import {START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../main/constants';
import {ISample} from '../main/analyzer';
import {Visualizer} from './components/visualizer/visualizer.component';
import {SettingsPanel} from './components/settings-panel/settings-panel.component';
import {Loader, IVisualization} from './providers/loader.service';
const ipcRenderer = require('electron').ipcRenderer;
const app = require('electron').remote.app;
const path = require('path');

require('./styles/app.scss');

@Component({
    selector: 'app',
    template: require('./app.component.html'),
    directives: [Visualizer, SettingsPanel]
})
export class App {

    private sample: ISample = { ft: new Float32Array([]), ts: new Float32Array([]) };
    private library: { id: number; name: string; }[] = [];
    private vis: IVisualization;
    private inputDevices: { [id: number]: string } = {};

    constructor(private loader: Loader) {
        loader.setPath(path.join(process.cwd(), 'visualizations'));
        loader.loadAll();
        this.library = loader.listAll();
    }

    ngOnInit(): void {
        ipcRenderer.send(REQUEST_DEVICE_LIST);
        ipcRenderer.on(RECEIVE_DEVICE_LIST, (event, list) => {
            this.inputDevices = list;
        });

        ipcRenderer.send(START_ANALYZER);
        ipcRenderer.on(SAMPLE, (event, sample: ISample) => {
            this.sample = sample;
        });
    }

    selectVis(id: number): void {
        this.vis = this.loader.getVisualization(id);
    }

    setInputDeviceId(id: number): void { 
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }
}
