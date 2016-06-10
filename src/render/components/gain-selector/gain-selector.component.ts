import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IState} from '../../providers/state.service.';
import {MAX_GAIN, MIN_GAIN} from '../../../common/constants';

@Component({
    selector: 'gain-selector',
    template: require('./gain-selector.component.html'),
    styles: [`:host { display: inline-block; }`, require('./gain-selector.scss').toString()]
})
export class GainSelector {
    @Input() state: IState;
    @Output() setGain = new EventEmitter<number>();
    @Output() toggleNormalization = new EventEmitter<boolean>();
    maxGain = MAX_GAIN;
    minGain = MIN_GAIN;
}
 