import {Component, ElementRef, Input, SimpleChange} from '@angular/core';
import {ISample} from '../../../main/analyzer';
import {IVisualization} from '../../providers/loader.service';

export interface IDimensions {
    width: number;
    height: number;
}

@Component({
    selector: 'visualizer',
    template: ``,
    styles: [`:host { 
        position: absolute; 
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    `]
})
export class Visualizer {

    @Input() sample: ISample;
    @Input() visualization: IVisualization;
    private skqw;
    private canvases: HTMLCanvasElement[] = [];
    private dimensions: IDimensions = { width: 0, height: 0 };
    private resizeTimer: number;
    private isRunning: boolean = false;


    constructor(private elementRef: ElementRef) {
        this.skqw = {
            createCanvas: () => this.createCanvas(),
            sample: (): ISample => this.sample,
            dimensions: (): IDimensions => this.dimensions
        };
    }

    ngOnInit(): void {
        window.addEventListener('resize', this.resizeHandler.bind(this)); 
    }

    ngOnChanges(changes: {[key: string]: SimpleChange}): void {
        if (changes['visualization']) {
            if (this.visualization && this.visualization.init) {
                this.visualization.init(this.skqw);
                this.start();
            } else {
                this.stop();
            }
        }
    }

    start() {
        this.isRunning = true;
        requestAnimationFrame(this.tick.bind(this));
    }

    stop() {
        this.isRunning = false;
        this.removeCanvases();
    }

    tick(timestamp) {
        if (this.isRunning && this.visualization.tick) {
            this.visualization.tick(this.skqw, timestamp);
            requestAnimationFrame(this.tick.bind(this));
        }
    }

    /**
     * Creates a canvas element for the visualization to render onto.
     */
    createCanvas(): HTMLCanvasElement {
        let canvas = document.createElement('canvas');
        let container = this.elementRef.nativeElement;
        this.elementRef.nativeElement.appendChild(canvas);
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        this.canvases.push(canvas);
        return canvas;
    }

    /**
     * Debounce the resize handler since the resize even gets fired rapidly in
     * succession as the user resizes.
     */
    resizeHandler() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(this.updateDimensions(), 100);
    }

    /**
     * Update the w & h dimensions and set the canvas dimensions.
     */
    updateDimensions() {
        this.dimensions.width = this.elementRef.nativeElement.offsetWidth;
        this.dimensions.height = this.elementRef.nativeElement.offsetHeight;

        this.canvases.forEach((c: HTMLCanvasElement) => {
            c.width = this.dimensions.width;
            c.height = this.dimensions.height;
        });
    }

    /**
     * Remove any existing canvases from the DOM.
     */
    removeCanvases() {
        this.canvases.forEach(c => {
            if (c.parentNode) {
                c.parentNode.removeChild(c);
            }
        });
        this.canvases = [];
    }
}
