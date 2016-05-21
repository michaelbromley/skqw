import {Component, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {VSelector} from '../v-selector/v-selector.component';
 
@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [`:host { position: relative; }`, require('./settings-panel.scss').toString()],
    directives: [InputSelector, VSelector]
})
export class SettingsPanel {
    @Input() inputDevices:  { [id: number]: string } = {};
    @Input() library: { id: number; name: string }[];
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectVisId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
} 
