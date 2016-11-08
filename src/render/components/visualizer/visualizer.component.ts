import {Component, ElementRef, Input, SimpleChange} from '@angular/core';
import {IVisualization, ISample, IParamUpdate} from '../../../common/models';
import {defaultVis} from './defaultVisualization';
import {CanvasService} from '../../providers/canvas.service';

@Component({
    selector: 'visualizer',
    template: ``,
    styleUrls: ['./visualizer.scss']
})
export class Visualizer {

    @Input() sample: ISample;
    @Input() visualization: IVisualization;
    private resizeTimer: any;
    private isRunning: boolean = false;
    private onResizeFn: Function;
    private rafId: any;

    private tick = (timestamp) => {
        if (this.isRunning && this.visualization.tick) {
            try {
                this.visualization.tick(timestamp);
            } catch (e) {
                console.log(e);
            }
            this.rafId = requestAnimationFrame(this.tick);
        }
    };

    constructor(private elementRef: ElementRef,
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
            } else {
                /*this.visualization = defaultVis;
                this.visualization.init();
                this.start();*/
            }
        }
    }

    start() {
        this.isRunning = true;
        this.rafId = requestAnimationFrame(this.tick);
    }

    stop(visualization?: IVisualization) {
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

    updateParam(paramUpdate: IParamUpdate): void {
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
