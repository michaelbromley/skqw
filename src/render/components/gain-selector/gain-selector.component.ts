import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IState} from '../../providers/state.service.';
import {MAX_GAIN, MIN_GAIN, MIN_SAMPLE_RATE, MAX_SAMPLE_RATE} from '../../../common/constants';

@Component({
    selector: 'gain-selector',
    templateUrl: './gain-selector.component.html',
    styleUrls: ['./gain-selector.scss']
})
export class GainSelector {
    @Input() state: IState;
    @Output() setGain = new EventEmitter<number>();
    @Output() setSampleRate = new EventEmitter<number>();
    maxGain = MAX_GAIN;
    minGain = MIN_GAIN;
    minSampleRate = MIN_SAMPLE_RATE;
    maxSampleRate = MAX_SAMPLE_RATE;
}
