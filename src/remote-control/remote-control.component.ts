import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewEncapsulation} from '@angular/core';
import {State} from '../render/providers/state.service.';
import {MAX_SAMPLE_RATE, MIN_SAMPLE_RATE, SET_INPUT_DEVICE_ID, SET_SAMPLE_RATE} from '../common/constants';
import {ParamUpdate, Visualization} from '../common/models';
import {Observable} from 'rxjs/Observable';
import {VisualizationService} from '../render/providers/visualization.service';
import * as Ps from 'perfect-scrollbar';
const {ipcRenderer} = require('electron');


require('style-loader!../render/styles/app.scss');

@Component({
    selector: 'remote-control',
    templateUrl: './remote-control.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default,
    styleUrls: ['./remote-control.scss']
})
export class RemoteControlComponent {
    minSampleRate = MIN_SAMPLE_RATE;
    maxSampleRate = MAX_SAMPLE_RATE;
    visualization$: Observable<Visualization>;

    constructor(public state: State,
                public visualization: VisualizationService,
                private changeDetector: ChangeDetectorRef,
                private elementRef: ElementRef) {
    }

    ngAfterViewInit(): void {
        const container = this.elementRef.nativeElement;
        Ps.initialize(container);
    }

    setSampleRate(val: number) {
        if (MIN_SAMPLE_RATE <= val && val <= MAX_SAMPLE_RATE) {
            this.state.update('sampleRate', val);
            ipcRenderer.send(SET_SAMPLE_RATE, val);
        }
    }

    setInputDeviceId(id: number): void {
        this.state.update('selectedInputId', id);
        ipcRenderer.send(SET_INPUT_DEVICE_ID, id);
    }

    onSettingsGroupToggle(): void {
        const container = this.elementRef.nativeElement;
        setTimeout(() => {
            Ps.update(container);
        }, 300);
        this.changeDetector.detectChanges();
    }

    updateParamValue(update: ParamUpdate): void {
        this.visualization.updateParam(update);
    }
}
