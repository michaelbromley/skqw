import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IState} from '../../providers/state.service.';

@Component({
    selector: 'gain-selector',
    template: require('./gain-selector.component.html'),
    styles: [`:host { display: inline-block; }`, require('./gain-selector.scss').toString()]
})
export class GainSelector {
    @Input() state: IState;
    @Output() setGain = new EventEmitter<number>();
    @Output() toggleNormalization = new EventEmitter<boolean>(); 
}
 