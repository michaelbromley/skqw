import {Component, ChangeDetectorRef, ViewChild, HostListener, ViewEncapsulation} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import {
    START_ANALYZER, REQUEST_DEVICE_LIST, RECEIVE_DEVICE_LIST, SET_INPUT_DEVICE_ID,
    SET_GAIN, TOGGLE_NORMALIZATION, MAX_GAIN, MIN_GAIN, TOGGLE_FULLSCREEN, TOGGLE_DEVTOOLS, MIN_SAMPLE_RATE,
    MAX_SAMPLE_RATE, SET_SAMPLE_RATE, CLOSE_DEVTOOLS, OPEN_DEVTOOLS, SAMPLE
} from '../common/constants';
import {Visualizer} from './components/visualizer/visualizer.component';
import {Loader} from './providers/loader.service';
import {ParamUpdate, Sample, Visualization} from '../common/models';
import {State} from './providers/state.service.';
import {NotificationService} from './providers/notification.service';
import {LibraryService} from './providers/library.service';
const ipcRenderer = require('electron').ipcRenderer;
const {app} = require('electron').remote;
const path = require('path');

require('style!./styles/app.scss');

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class App {

    @ViewChild(Visualizer) visualizer: Visualizer;
    sample: Sample = { ft: [], ts: [] };
    visualization$: Observable<Visualization>;
    private debugMode: boolean = false;

    constructor(public state: State,
                private loader: Loader,
                private libraryService: LibraryService,
                private notification: NotificationService,
                private cdr: ChangeDetectorRef) {

        let normalizeFt = true;
        (<any> window).skqw_toggleNormalization = () => {
            normalizeFt = !normalizeFt;
            console.log('Normalization set to ', normalizeFt);
            ipcRenderer.send(TOGGLE_NORMALIZATION, normalizeFt);
        };

        this.visualization$ = this.state.activeId
            .map(id => id.toString())
            .filter(id => !!id)
            .distinctUntilChanged()
            .map(id => {
                return this.loader.loadLibraryEntry(id, this.debugMode)
            })
            .filter(vis => !!vis);
    }

    ngOnInit(): void {
        ipcRenderer.send(REQUEST_DEVICE_LIST);
        ipcRenderer.on(RECEIVE_DEVICE_LIST, (event, list) => {
            this.state.update('inputDevices', list);
        });

        ipcRenderer.on(SAMPLE, (event, sample: Sample) => {
            this.sample = sample;
        });

        ipcRenderer.send(START_ANALYZER);


        ipcRenderer.on(OPEN_DEVTOOLS, () => {
            this.debugMode = true;
            this.notification.notify(`Debug mode enabled`);
        });
        ipcRenderer.on(CLOSE_DEVTOOLS, () => {
            this.debugMode = false;
            this.notification.notify(`Debug mode disabled`);
        });
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
            this.reloadCurrentVisualization();
            this.notification.notify(`Reloaded visualization`);
        }
        if (e.altKey === true && e.which === 70) {
            // Handle alt + F - toggle fullscreen.
            ipcRenderer.send(TOGGLE_FULLSCREEN);
        }
        if (e.ctrlKey=== true && e.shiftKey && e.which === 73) {
            // Handle ctrl + shift + i - toggle devtools.
            ipcRenderer.send(TOGGLE_DEVTOOLS);
            this.reloadCurrentVisualization();
        }
        if (e.which === 38) {
            // increase the gain
            const newValue = this.state.getValue().gain + 5;
            this.setGain(newValue);
        }
        if (e.which === 40) {
            // decrease the gain
            const newValue = this.state.getValue().gain - 5;
            this.setGain(newValue);
        }
    }
    
    setInputDeviceId(id: number): void {
        this.state.update('selectedInputId', id);
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }

    updateParamValue(update: ParamUpdate): void {
        this.visualizer.updateParam(update);
    }

    setGain(val: number) {
        if (MIN_GAIN <= val && val <= MAX_GAIN) {
            this.state.update('gain', val);
            ipcRenderer.send(SET_GAIN, val);
        }
    }

    setSampleRate(val: number) {
        if (MIN_SAMPLE_RATE <= val && val <= MAX_SAMPLE_RATE) {
            this.state.update('sampleRate', val);
            ipcRenderer.send(SET_SAMPLE_RATE, val);
        }
    }

    private reloadCurrentVisualization(): void {
       /* if (!this.vis) {
            return;
        }
        let id = this.state.getValue().library
            .filter(item => item.name === this.vis.name)[0].id;
        this.vis = this.loader.loadLibraryEntry(id, this.debugMode);*/
    }
}
