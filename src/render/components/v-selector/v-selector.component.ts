import {Component, HostListener, Input, EventEmitter, Output} from '@angular/core';
import {IVisualization} from '../../../common/models';
import {ParameterControls} from '../parameter-controls/parameter-controls.component';

@Component({
    selector: 'v-selector',
    template: require('./v-selector.component.html'),
    styles: [require('./v-selector.scss').toString()],
    directives: [ParameterControls]
})
export class VSelector {
    @Input() library: { id: number; name: string; }[];
    @Input() current: IVisualization;
    @Input() visible: boolean = false;
    @Output() selectLibraryDir = new EventEmitter<boolean>();
    @Output() select = new EventEmitter<number>();
    @Output() toggleVisible = new EventEmitter<boolean>()

    @HostListener('document:mouseover')
    show(): void {
        this.toggleVisible.emit(true);
    }

    @HostListener('document:mouseout')
    hide(): void {
        this.toggleVisible.emit(false);
    }
}
