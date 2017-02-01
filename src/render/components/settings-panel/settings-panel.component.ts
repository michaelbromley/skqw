import {Component, ElementRef, HostListener, Input, EventEmitter, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/switchMap';
import {State} from '../../providers/state.service.';
import {ParamUpdate, Visualization} from '../../../common/models';
import {MIN_SAMPLE_RATE, MAX_SAMPLE_RATE} from '../../../common/constants';
import * as Ps from 'perfect-scrollbar'

declare const VERSION: string;

@Component({
    selector: 'settings-panel',
    templateUrl: './settings-panel.component.html',
    styleUrls: ['./settings-panel.scss']
})
export class SettingsPanel {
    @Input() current: Visualization;
    @Output() changeInputDeviceId = new EventEmitter<number>();
    @Output() setSampleRate = new EventEmitter<number>();
    @Output() updateParam = new EventEmitter<ParamUpdate>();
    params$: Observable<any>;
    minSampleRate = MIN_SAMPLE_RATE;
    maxSampleRate = MAX_SAMPLE_RATE;
    iconVisible: boolean = false;
    expanded: boolean = false;
    version: string = VERSION;
    private hoverTimer: any;

    constructor(public state: State,
                private elementRef: ElementRef) {
    }

    ngOnDestroy(): void {
        clearTimeout(this.hoverTimer);
    }

    ngAfterViewInit(): void {
        const container = this.elementRef.nativeElement.querySelector('.panel-body');
        Ps.initialize(container);
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
        this.iconVisible = false;
    }

    onSettingsGroupToggle(): void {
        const container = this.elementRef.nativeElement.querySelector('.panel-body');
        setTimeout(() => {
            Ps.update(container);
        }, 300);
    }

    /**
     * Display the UI controls (visualization selector, settings icons) and set a timeout
     * to hide them again after a delay.
     */
    displayUiElements(): void {
        this.iconVisible = true;

        clearTimeout(this.hoverTimer);
        this.hoverTimer = setTimeout(() => {
            if (!this.expanded) {
                this.iconVisible = false;
            }
        }, 3000);
    }
} 
