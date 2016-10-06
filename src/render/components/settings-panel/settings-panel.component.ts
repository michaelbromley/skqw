import {Component, Input, EventEmitter, Output} from '@angular/core';
import {IState} from '../../providers/state.service.';
import {IParamUpdate, IVisualization} from '../../../common/models';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

declare var VERSION: string;
let settingsIcon: string = require('!!svg-inline!../../../assets/icons/settings.svg');

@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss')]
})
export class SettingsPanel {
    @Input() state: IState;
    @Input() current: IVisualization; 
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() toggle = new EventEmitter<string>();

    @Output() select = new EventEmitter<number>();
    @Output() setGain = new EventEmitter<number>();
    @Output() setSampleRate = new EventEmitter<number>();
    @Output() updateParam = new EventEmitter<IParamUpdate>();
    private icon_settings: SafeHtml;
    private version: string = VERSION;

    constructor(sanitizer: DomSanitizer) {
        this.icon_settings = sanitizer.bypassSecurityTrustHtml(settingsIcon);
    }
} 
