import {Component, Input, Output, EventEmitter, HostListener, SimpleChanges} from '@angular/core';
import {AppState} from '../../providers/state.service.';
import {MAX_GAIN, MIN_GAIN, MIN_SAMPLE_RATE, MAX_SAMPLE_RATE} from '../../../common/constants';

@Component({
    selector: 'gain-selector',
    templateUrl: './gain-selector.component.html',
    styleUrls: ['./gain-selector.scss']
})
export class GainSelector {
    @Input() gain: number;
    @Output() setGain = new EventEmitter<number>();
    @Output() setSampleRate = new EventEmitter<number>();
    maxGain = MAX_GAIN;
    minGain = MIN_GAIN;
    minSampleRate = MIN_SAMPLE_RATE;
    maxSampleRate = MAX_SAMPLE_RATE;
    active: boolean = false;
    hoverTimer: any;

    ngOnChanges(changes: SimpleChanges): void {
        this.displayUiElements();
    }

    @HostListener('document:mouseenter')
    onMouseOver(): void {
        this.displayUiElements();
    }

    @HostListener('document:mousemove')
    onMouseMove(): void {
        this.displayUiElements();
    }

    @HostListener('document:mouseleave')
    onMouseOut(): void {
        this.active = false;
    }

    displayUiElements(): void {
        this.active = true;

        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
            this.active = false;
        }, 3000);
    }
}
