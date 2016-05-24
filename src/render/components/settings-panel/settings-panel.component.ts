import {Component, Input, EventEmitter, Output} from '@angular/core';
import {InputSelector} from '../input-selector/input-selector.component';
import {VSelector} from '../v-selector/v-selector.component';
import {ParameterControls} from '../parameter-controls/parameter-controls.component';
import {IVisualization, IParamUpdate} from '../../../common/models';
 
@Component({
    selector: 'settings-panel',
    template: require('./settings-panel.component.html'),
    styles: [require('./settings-panel.scss').toString()],
    directives: [InputSelector, VSelector, ParameterControls]
})
export class SettingsPanel {
    @Input() inputDevices:  { [id: number]: string } = {}; 
    @Input() library: { id: number; name: string }[];
    @Input() libraryDir: string; 
    @Input() currentVis: IVisualization;
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() selectVisId = new EventEmitter<number>(); 
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() updateParam = new EventEmitter<IParamUpdate>();
    @Output() changeVisibility = new EventEmitter<boolean>();
    private isVisible: boolean = false;
    
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.changeVisibility.emit(this.isVisible);
    }
} 
