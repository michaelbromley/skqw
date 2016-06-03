import {Component, ChangeDetectorRef, HostListener} from '@angular/core';
import {START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../common/constants';
import {Visualizer} from './components/visualizer/visualizer.component';
import {SettingsPanel} from './components/settings-panel/settings-panel.component';
import {Loader} from './providers/loader.service';
import {IParamUpdate, ISample, IVisualization} from '../common/models';
import {VSelector} from './components/v-selector/v-selector.component';
const ipcRenderer = require('electron').ipcRenderer;
const {app, dialog} = require('electron').remote;
const path = require('path');
const storage = require('electron-json-storage');

require('./styles/app.scss');

@Component({
    selector: 'app',
    template: require('./app.component.html'),
    directives: [Visualizer, SettingsPanel, VSelector]
})
export class App {

    private sample: ISample = { ft: [], ts: [] };
    private library: { id: number; name: string; }[] = [];
    private libraryDir: string;
    private vis: IVisualization;
    private inputDevices: { [id: number]: string } = {};
    private vSelectorVisible: boolean = false;
    private settingsModalVisible: string = '';

    constructor(private loader: Loader,
                private cdr: ChangeDetectorRef) {
        storage.get('libraryDir', (err, data) => {
            this.libraryDir = data.libraryDir;
            if (this.libraryDir) {
                this.loadLibrary(this.libraryDir);
            }
        });
    }

    ngOnInit(): void {
        ipcRenderer.send(REQUEST_DEVICE_LIST);
        ipcRenderer.on(RECEIVE_DEVICE_LIST, (event, list) => {
            this.inputDevices = list;
        });

        // ipcRenderer.send(START_ANALYZER);
        ipcRenderer.on(SAMPLE, (event, sample: ISample) => {
            this.sample = sample;
        });
    }

    selectLibraryDir() {
        dialog.showOpenDialog({
            title: 'Select Visualization Library Folder',
            defaultPath: this.libraryDir || path.join(process.cwd()),
            properties: ['openDirectory']
        }, (paths: string[]) => {
            if (paths.length === 1) {
                let dir = paths[0];
                storage.set('libraryDir', {libraryDir: dir});
                this.libraryDir = dir;
                this.loadLibrary(dir);
            }
        });
    }

    selectVis(id: number): void {
        this.vis = this.loader.getVisualization(id);
    }

    /**
     * Reload the current visualization files from disk.
     */
    @HostListener('document:keydown', ['$event'])
    reloadVis(e: KeyboardEvent): void {
        if (e.altKey === true && e.which === 82) {
            if (!this.vis) {
                return;
            }
            this.loader.loadAll();
            let id = this.library.filter(item => item.name === this.vis.name)[0].id;
            this.vis = this.loader.getVisualization(id);
        }
    }

    setInputDeviceId(id: number): void {
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    } 

    updateParamValue(update: IParamUpdate): void {
        this.vis.params[update.paramKey].value = update.newValue;
    }

    settingModalChanged(val: string) {
        this.settingsModalVisible = val;
        if (val !== '' && this.vSelectorVisible) {
            this.vSelectorVisible = false;
        }
    }

    toggleVSelector(visible: boolean) {
        if (this.settingsModalVisible === '') {
            this.vSelectorVisible = visible;
        }
    }

    private loadLibrary(dir: string): void {
        this.loader.setPath(dir);
        this.loader.loadAll(); 
        this.library = this.loader.listAll();
        this.cdr.detectChanges();
        this.selectVis(0);
    }
}
