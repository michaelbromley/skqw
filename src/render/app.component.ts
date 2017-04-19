import {Component, HostListener, ViewChild, ViewEncapsulation} from '@angular/core';
import 'rxjs/observable/combineLatest';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/withLatestFrom';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/observable/ConnectableObservable';
import {
    CLOSE_DEVTOOLS,
    MAX_GAIN,
    MAX_SAMPLE_RATE,
    MIN_GAIN,
    MIN_SAMPLE_RATE,
    OPEN_DEVTOOLS,
    RECEIVE_DEVICE_LIST,
    REQUEST_DEVICE_LIST,
    SAMPLE,
    SET_GAIN,
    SET_INPUT_DEVICE_ID,
    SET_SAMPLE_RATE,
    START_ANALYZER,
    TOGGLE_DEVTOOLS,
    TOGGLE_FULLSCREEN,
    TOGGLE_NORMALIZATION
} from '../common/constants';
import {Visualizer} from './components/visualizer/visualizer.component';
import {Loader} from './providers/loader.service';
import {ParamUpdate, Sample} from '../common/models';
import {State} from './providers/state.service.';
import {NotificationService} from './providers/notification.service';
import {LibraryService} from './providers/library.service';
import {VisualizationService} from './providers/visualization.service';
const {ipcRenderer} = require('electron');
const {app} = require('electron').remote;
const path = require('path');

require('style-loader!./styles/app.scss');

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    encapsulation: ViewEncapsulation.None
})
export class App {

    @ViewChild(Visualizer) visualizer: Visualizer;
    sample: Sample = { ft: [], ts: [] };

    constructor(public state: State,
                public visualization: VisualizationService,
                private loader: Loader,
                private libraryService: LibraryService,
                private notification: NotificationService) {

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
            this.state.update('inputDevices', list);
        });

        ipcRenderer.on(SAMPLE, (event, sample: Sample) => {
            this.sample = sample;
        });

        ipcRenderer.send(START_ANALYZER);

        ipcRenderer.on(OPEN_DEVTOOLS, () => {
            this.visualization.setDebugMode(true);
            this.notification.notify(`Debug mode enabled`);
        });
        ipcRenderer.on(CLOSE_DEVTOOLS, () => {
            this.visualization.setDebugMode(false);
            this.notification.notify(`Debug mode disabled`);
        });
    }

    /**
     * Handler for keyboard shortcuts
     */
    @HostListener('document:keydown', ['$event'])
    onKeydown(e: KeyboardEvent): void {
        if ((e.target as HTMLElement).tagName === 'INPUT') {
            return;
        }
        if (e.altKey === true && e.which === 82) {
            // Handle alt + R - reload current visualization.
            this.visualization.reload();
            this.notification.notify(`Reloaded visualization`);
        }
        if (e.altKey === true && e.which === 70) {
            // Handle alt + F - toggle fullscreen.
            ipcRenderer.send(TOGGLE_FULLSCREEN);
        }
        if (e.ctrlKey=== true && e.shiftKey && e.which === 73) {
            // Handle ctrl + shift + i - toggle devtools.
            ipcRenderer.send(TOGGLE_DEVTOOLS);
            this.visualization.reload();
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
        this.visualization.updateParam(update);
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
}
