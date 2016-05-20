import {Component, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {RECEIVE_DEVICE_LIST, REQUEST_DEVICE_LIST, SET_INPUT_DEVICE_ID} from '../../../main/constants';
import {VSelector} from '../v-selector/v-selector.component';
const ipcRenderer = require('electron').ipcRenderer;
 
@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss').toString()],
    directives: [InputSelector, VSelector]
})
export class SettingsPanel {
    @Input() inputDevices:  { [id: number]: string } = {};
    @Input() library: { id: number; name: string }[];
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectVisId = new EventEmitter<number>();
} 
