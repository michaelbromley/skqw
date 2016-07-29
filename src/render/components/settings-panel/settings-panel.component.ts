import {Component, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {LibraryPathSelector} from '../library-path-selector/library-path-selector.component';
import {IState} from '../../providers/state.service.';
import {VSelector} from '../v-selector/v-selector.component';
import {IParamUpdate, IVisualization} from '../../../common/models';
import {SettingsGroup} from '../settings-group/settings-group.component';
import {GainSelector} from '../gain-selector/gain-selector.component';
import {ParameterControls} from '../parameter-controls/parameter-controls.component';

declare var VERSION: string;

@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss')],
    directives: [VSelector, InputSelector, GainSelector, ParameterControls, LibraryPathSelector, SettingsGroup]
})
export class SettingsPanel {
    @Input() state: IState;
    @Input() current: IVisualization; 
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() toggle = new EventEmitter<string>();

    @Output() select = new EventEmitter<number>();
    @Output() setGain = new EventEmitter<number>();
    @Output() toggleNormalization = new EventEmitter<boolean>();
    @Output() updateParam = new EventEmitter<IParamUpdate>();
    private icon_settings = require('!!svg-inline!../../../assets/icons/settings.svg');
    private version: string = VERSION;
} 
