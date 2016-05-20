import {Component} from '@angular/core';
import {START_ANALYZER, SAMPLE} from '../main/constants';
import {ISample} from '../main/analyzer';
import {Visualizer} from './components/visualizer/visualizer.component';
import {SettingsPanel} from './components/settings-panel/settings-panel.component';
import {Loader, IVisualization} from './providers/loader.service';
import {VSelector} from './components/v-selector/v-selector.component';
const ipcRenderer = require('electron').ipcRenderer;
const app = require('electron').remote.app;
const path = require('path');

require('./styles/app.scss');

@Component({
    selector: 'app',
    template: require('./app.component.html'),
    directives: [Visualizer, SettingsPanel, VSelector]
})
export class App {

    sample: ISample = { ft: new Float32Array([]), ts: new Float32Array([]) };
    library: { id: number; name: string; }[] = [];
    vis: IVisualization;

    constructor(private loader: Loader) {
        loader.setPath(path.join(process.cwd(), 'visualizations'));
        loader.loadAll();
        this.library = loader.listAll();
    }

    ngOnInit(): void {
        ipcRenderer.send(START_ANALYZER);
        ipcRenderer.on(SAMPLE, (event, sample: ISample) => {
            this.sample = sample;
        });
    }
    
    selectVis(id: number): void {
        this.vis = this.loader.getVisualization(id);
    }
}
