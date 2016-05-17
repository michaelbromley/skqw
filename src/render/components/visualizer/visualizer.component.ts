import {Component, ElementRef, Input, HostListener} from '@angular/core';
import {ISample} from '../../../main/analyzer';
import {defaultVis} from './defaultVisualization';

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
    private canvases: HTMLCanvasElement[] = [];
    private dimensions: {
        width: number;
        height: number;
    } = { width: 0, height: 0 };
    private vis;
    private resizeTimer: number;


    constructor(private elementRef: ElementRef) {
    }
    
    ngAfterViewInit(): void {
        this.updateDimensions();
        this.loadVisualization();
        this.start();
    }

    loadVisualization() {
        this.vis = defaultVis({
            createCanvas: () => this.createCanvas(),
            getSample: () => this.sample,
            getDimensions: () => this.dimensions
        });
        
        this.vis.init();
    }

    start() {
        requestAnimationFrame(this.tick.bind(this));
    }

    tick(timestamp) {
        this.vis.tick(timestamp);
        requestAnimationFrame(this.tick.bind(this));
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
    @HostListener('resize')
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
