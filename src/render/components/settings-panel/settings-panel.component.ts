import {Component, Input, EventEmitter, Output} from '@angular/core';
import {AppState} from '../../providers/state.service.';
import {ParamUpdate, Visualization} from '../../../common/models';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

declare var VERSION: string;
let settingsIcon: string = require('!!svg-inline!../../../assets/icons/settings.svg');

@Component({
    selector: 'settings-panel',
    templateUrl: './settings-panel.component.html',
    styleUrls: ['./settings-panel.scss']
})
export class SettingsPanel {
    @Input() state: AppState;
    @Input() current: Visualization;
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() toggle = new EventEmitter<boolean>();

    @Output() select = new EventEmitter<number>();
    @Output() setGain = new EventEmitter<number>();
    @Output() setSampleRate = new EventEmitter<number>();
    @Output() updateParam = new EventEmitter<ParamUpdate>();
    icon_settings: SafeHtml;
    version: string = VERSION;

    constructor(sanitizer: DomSanitizer) {
        this.icon_settings = sanitizer.bypassSecurityTrustHtml(settingsIcon);
    }
} 
