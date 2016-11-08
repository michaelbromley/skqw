import {Component, ChangeDetectorRef, ViewChild, HostListener, ViewEncapsulation} from '@angular/core';
import {
    START_ANALYZER, SAMPLE, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID,
    SET_GAIN, TOGGLE_NORMALIZATION, MAX_GAIN, MIN_GAIN, TOGGLE_FULLSCREEN, TOGGLE_DEVTOOLS, MIN_SAMPLE_RATE,
    MAX_SAMPLE_RATE, SET_SAMPLE_RATE
} from '../common/constants';
import {Visualizer} from './components/visualizer/visualizer.component';
import {Loader} from './providers/loader.service';
import {IParamUpdate, ISample, IVisualization} from '../common/models';
import {State} from './providers/state.service.';
import {NotificationService} from './providers/notification.service';
const ipcRenderer = require('electron').ipcRenderer;
const {app, dialog} = require('electron').remote;
const path = require('path');
const storage = require('electron-json-storage');

require('style!./styles/app.scss');

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class App {

    @ViewChild(Visualizer) visualizer: Visualizer;
    sample: ISample = { ft: [], ts: [] };
    vis: IVisualization;
    private hoverTimer: any;
    private saveGainTimer: any;
    private sampleRateTimer: any;

    constructor(public state: State,
                private loader: Loader,
                private notification: NotificationService,
                private cdr: ChangeDetectorRef) {

        storage.get('libraryDir', (err, data) => {
            if (data.libraryDir) {
                this.state.setLibraryDir(data.libraryDir);
                this.loadLibrary(data.libraryDir);
            }
        });
        storage.get('gain', (err, data) => {
            if (data.gain) {
                this.state.setGain(data.gain);
            }
        });
        storage.get('sampleRate', (err, data) => {
            if (data.sampleRate) {
                this.state.setSampleRate(data.sampleRate);
            }
        });

        let normalizeFt = true;
        (<any> window).skqw_toggleNormalization = () => {
            normalizeFt = !normalizeFt;
            console.log('Normalization set to ', normalizeFt);
            ipcRenderer.send(TOGGLE_NORMALIZATION, normalizeFt);
        };
    }

    ngOnInit(): void {
        ipcRenderer.send(REQUEST_DEVICE_LIST);
        ipcRenderer.on(RECEIVE_DEVICE_LIST, (event, list) => {
            this.state.setInputDevices(list);
        });

        ipcRenderer.send(START_ANALYZER);
    }
    
    toggleSettings(expanded: boolean): void {
        this.state.setSettingsExpanded(expanded);
    }

    /**
     * Display a dialog for seleting the library dir.
     */
    selectLibraryDir() {
        dialog.showOpenDialog({
            title: 'Select Visualization Library Folder',
            defaultPath: this.state.getValue().libraryDir || path.join(process.cwd()),
            properties: ['openDirectory']
        }, (paths: string[]) => {
            if (paths && paths.length === 1) {
                let dir = paths[0];
                storage.set('libraryDir', { libraryDir: dir });
                this.state.setLibraryDir(dir);
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
    onKeydown(e: KeyboardEvent): void {
        if ((e.target as HTMLElement).tagName === 'INPUT') {
            return;
        }
        if (e.altKey === true && e.which === 82) {
            // Handle alt + R - reload current visualization.
            if (!this.vis) {
                return;
            }
            this.loader.loadAll();
            let id = this.state.getValue().library
                .filter(item => item.name === this.vis.name)[0].id;
            this.vis = this.loader.getVisualization(id);
            this.notification.notify(`Reloaded visualization`);
        }
        if (e.altKey === true && e.which === 70) {
            // Handle alt + F - toggle fullscreen.
            ipcRenderer.send(TOGGLE_FULLSCREEN);
        }
        if (e.ctrlKey=== true && e.shiftKey && e.which === 73) {
            // Handle ctrl + shift + i - toggle devtools.
            ipcRenderer.send(TOGGLE_DEVTOOLS);
        }
        if (e.which === 38) {
            // increase the gain
            const newValue = this.state.getValue().gain + 1;
            this.setGain(newValue);
            this.notification.notify(`Gain: ${newValue}`);
        }
        if (e.which === 40) {
            // decrease the gain
            const newValue = this.state.getValue().gain - 1;
            this.setGain(newValue);
            this.notification.notify(`Gain: ${newValue}`);
        }
    }

    @HostListener('document:mouseenter')
    onMouseOver(): void {
        this.displayUiElements();
    }

    @HostListener('document:mousemove')
    onMouseMove(): void {
        this.displayUiElements();
    }

    @HostListener('document:mouseleave')
    onMouseOut(): void {
        this.state.setSettingsIconVisible(false);
    }

    /**
     * Display the UI controls (visualization selector, settings icons) and set a timeout
     * to hide them again after a delay.
     */
    displayUiElements(): void {
           this.state.setSettingsIconVisible(true);
        
        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
            this.state.setSettingsIconVisible(false);
            if (!this.state.getValue().settingsExpanded) {
                this.state.setSettingsIconVisible(false);
            }
        }, 3000);
    }
    
    setInputDeviceId(id: number): void {
        this.state.setSelectedInputId(id);
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }

    updateParamValue(update: IParamUpdate): void {
        this.visualizer.updateParam(update);
    }

    setGain(val: number) {
        if (MIN_GAIN <= val && val <= MAX_GAIN) {
            this.state.setGain(val);
            ipcRenderer.send(SET_GAIN, val);
        }
        clearTimeout(this.saveGainTimer);
        this.saveGainTimer = setTimeout(() =>  storage.set('gain', { gain: val }));
    }

    setSampleRate(val: number) {
        console.log('setting sample rate to',val);
        if (MIN_SAMPLE_RATE <= val && val <= MAX_SAMPLE_RATE) {
            this.state.setSampleRate(val);
            ipcRenderer.send(SET_SAMPLE_RATE, val);
        }
        clearTimeout(this.sampleRateTimer);
        this.sampleRateTimer = setTimeout(() =>  storage.set('sampleRate', { sampleRate: val }));
    }

    private loadLibrary(dir: string): void {
        this.loader.setPath(dir);
        try {
            this.loader.loadAll();
        } catch (e) {
            this.notification.notify(e.message);
        }
        this.state.setLibrary(this.loader.listAll());
        this.cdr.detectChanges();
        this.selectVis(0);
    }
}
