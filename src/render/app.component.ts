import {Component} from '@angular/core';
import {START_ANALYZER, SAMPLE} from '../main/constants';
import {ISample} from '../main/analyzer';
const ipcRenderer = require('electron').ipcRenderer;

@Component({
    selector: 'app',
    template: require('./app.component.html')
})
export class App {

    constructor() {
    }

    ngOnInit(): void {

        setTimeout(() => {
            ipcRenderer.send(START_ANALYZER);
            ipcRenderer.on(SAMPLE, (event, sample: ISample) => {
               console.log('sample', sample);
            });

        }, 5000);
    }
}
