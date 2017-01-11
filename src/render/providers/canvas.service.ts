import {ElementRef, Injectable} from '@angular/core';
import {Dimensions} from '../../common/models';

/**
 * Manages creating and destroying canvases for use by visualization scripts.
 */
@Injectable()
export class CanvasService {

    private host: ElementRef;
    private canvases: HTMLCanvasElement[] = [];
    private dimensions: Dimensions = { width: 0, height: 0 };

    constructor() { }

    registerHostElement(host: ElementRef): void {
        this.host = host;
    }

    create(): HTMLCanvasElement {
        let canvas = document.createElement('canvas');
        let container = this.host.nativeElement;
        container.appendChild(canvas);
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
        this.canvases.push(canvas);
        return canvas;
    }

    destroyCanvases(): void {
        this.canvases.forEach(c => {
            if (c.parentNode) {
                c.parentNode.removeChild(c);
            }
        });
        this.canvases = [];
    }

    getDimensions(): Dimensions {
        return this.dimensions;
    }

    /**
     * Update the w & h dimensions and set the canvas dimensions.
     */
    updateDimensions() {
        this.dimensions.width = this.host.nativeElement.offsetWidth;
        this.dimensions.height = this.host.nativeElement.offsetHeight;

        this.canvases.forEach((c: HTMLCanvasElement) => {
            c.width = this.dimensions.width;
            c.height = this.dimensions.height;
        });
    }

}