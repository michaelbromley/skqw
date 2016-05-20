import {Component, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {RECEIVE_DEVICE_LIST, REQUEST_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../../../main/constants';
const ipcRenderer = require('electron').ipcRenderer;
 
@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss').toString()],
    directives: [InputSelector]
})
export class SettingsPanel {
    private inputs;

    ngOnInit() {
        ipcRenderer.send(REQUEST_DEVICE_LIST);
        ipcRenderer.on(RECEIVE_DEVICE_LIST, (event, list) => {
            this.inputs = list;
        });
    }

    changeInputDeviceId(id: number): void {
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }
}
