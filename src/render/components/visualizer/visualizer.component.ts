import {Component, ElementRef, Input, SimpleChange} from '@angular/core';
import {Visualization, Sample, ParamUpdate} from '../../../common/models';
import {defaultVis} from './defaultVisualization';
import {CanvasService} from '../../providers/canvas.service';
import {NotificationService} from '../../providers/notification.service';

const MAX_ERRORS = 10;

@Component({
    selector: 'visualizer',
    template: ``,
    styleUrls: ['./visualizer.scss']
})
export class Visualizer {

    @Input() sample: Sample;
    @Input() visualization: Visualization;
    private resizeTimer: any;
    private isRunning: boolean = false;
    private onResizeFn: Function;
    private rafId: any;
    private errorCount = 0;

    private tick = (timestamp) => {
        if (this.isRunning && this.visualization.tick) {
            try {
                this.visualization.tick(timestamp);
            } catch (e) {
                    this.errorCount++;
                    console.error(e);
            }
            if (this.errorCount < MAX_ERRORS) {
                this.rafId = requestAnimationFrame(this.tick);
            } else {
                this.notification.notify(`Halting visualization: too many errors!`);
                this.stop();
            }
        }
    };

    constructor(private elementRef: ElementRef,
                private notification: NotificationService,
                private canvasService: CanvasService) {
        canvasService.registerHostElement(elementRef);
    }

    ngOnInit(): void {
        window.addEventListener('resize', this.resizeHandler.bind(this));
        this.resizeHandler();
    }

    ngOnChanges(changes: {[key: string]: SimpleChange}): void {
        if (changes['visualization']) {
            this.stop(changes['visualization'].previousValue);
            if (this.visualization && this.visualization.init) {
                try {
                    this.visualization.init();
                } catch (e) {
                    console.log(e);
                }
                this.start();
            }
        }
    }

    start() {
        this.errorCount = 0;
        this.isRunning = true;
        this.rafId = requestAnimationFrame(this.tick);
    }

    stop(visualization?: Visualization) {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
        }
        if (visualization && typeof visualization.destroy === 'function') {
            try {
                visualization.destroy();
            } catch (e) {
                console.log(e);
            }
        }
        this.isRunning = false;
        this.canvasService.destroyCanvases();
        this.onResizeFn = null;
    }

    updateParam(paramUpdate: ParamUpdate): void {
        if (this.visualization && this.visualization.params) {
            if (typeof this.visualization.paramChange === 'function') {
                try {
                    this.visualization.paramChange(paramUpdate);
                } catch (e) {
                    console.log(e);
                }
            } else {
                // if the paramChange hook is not defined, automatically update
                // the parameter.
                this.visualization.params[paramUpdate.paramKey].value = paramUpdate.newValue;
            }
        }
    }

    /**
     * Debounce the resize handler since the resize even gets fired rapidly in
     * succession as the user resizes.
     */
    resizeHandler() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.canvasService.updateDimensions();
            if (this.visualization && typeof this.visualization.resize === 'function') {
                try {
                    this.visualization.resize();
                } catch (e) {
                    console.log(e);
                }
            }
        }, 100);
    }
}
