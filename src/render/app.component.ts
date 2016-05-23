import {Component, ChangeDetectorRef} from '@angular/core';
import {START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../common/constants';
import {Visualizer} from './components/visualizer/visualizer.component';
import {SettingsPanel} from './components/settings-panel/settings-panel.component';
import {Loader} from './providers/loader.service';
import {IParamUpdate, ISample, IVisualization} from '../common/models';
const ipcRenderer = require('electron').ipcRenderer;
const {app, dialog} = require('electron').remote;
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
    private libraryDir: string;
    private vis: IVisualization;
    private inputDevices: { [id: number]: string } = {};

    constructor(private loader: Loader,
                private cdr: ChangeDetectorRef) {
        this.libraryDir = path.join(process.cwd());
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

    selectLibraryDir() {
        dialog.showOpenDialog({
            title: 'Select Visualization Library Folder',
            defaultPath: this.libraryDir,
            properties: ['openDirectory']
        }, (paths: string[]) => {
            this.loader.setPath(paths[0]);
            this.loader.loadAll();
            this.library = this.loader.listAll();
            this.cdr.detectChanges();
            this.selectVis(0);
        });
    }

    selectVis(id: number): void {
        this.vis = this.loader.getVisualization(id);  
    }

    setInputDeviceId(id: number): void {
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }

    updateParamValue(update: IParamUpdate): void {
        this.vis.params[update.paramKey].value = update.newValue;
    }
}
