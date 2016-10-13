---
title: API Reference
---

This is a description of the APIs for authoring visualizations in SKQW. For a general overview, see the [dev guide](../developer-guide-getting-started).

## `skqw` object
The `skqw` object is passed as the first argument of each of the lifecycle functions (see Visualization interface below). 

```TypeScript
interface ISkqw {
    createCanvas: (domElement?: HTMLCanvasElement) => HTMLCanvasElement;
    dimensions: {
        width: number;
        height: number;
    };
    sample: {
        ts: number[];
        ft: number[];
    }
}
```

### `skqw.createCanvas()`

If called with no arguments, it will create a new `<canvas>` element and return it.

Alternatively you may create the canvas element yourself, and pass it as an argument to `createCanvas()`. This is useful, for example, when using a library such as Three.js, which will provide you with a canvas element itself, which can then be handed over to SKQW.

### `skqw.dimensions.width`

The width of the canvas in pixels.

### `skqw.dimensions.height`

The height of the canvas in pixels.

### `skqw.sample.ts`

An array of numbers representing the time series of the audio sample (time domain). Also known as a waveform.

### `skqw.sample.ft`

An array of numbers representing the fast fourier transform of the signal (frequency domain). Also known as a frequency spectrum.

## Visualization Interfaces

```TypeScript
interface IVisualization {
    name: string;
    init: (skqw: ISkqw) => void;
    tick: (skqw: ISkqw, timestamp: number) => void;
    resize?: (skqw: ISkqw) => void;
    destroy?: (skqw: ISkqw) => void;
    paramChange?: (skqw: ISkqw, change: IParamUpdate) => void;
    params?: { [name: string]: IParameter }
}

interface IParameter {
    value: number | boolean;
    type: 'range' | 'boolean';
    label: string;
    min?: number;
    max?: number;
    step?: number;
}

interface IParamUpdate {
    paramKey: string;
    newValue: number | boolean;
}
```

### `visualization.name`

The name which will be displayed in the app UI.

### `visualization.init(skqw)`

Called once when the visualization is selected in the UI. Normally used to create one or more canvases. 

**Important note:** it is not advisable to set the properties of a canvas context in the `init()` function, because in accordance with the [Canvas spec](https://dev.w3.org/html5/spec-preview/the-canvas-element.html), the context gets reset any time the canvas is resized. Therefore it is better to make changes to the context in either the `tick()` or the `resize()` functions.

### `visualization.tick(skqw, timestamp)`

Called for each frame of the visualization animation, roughly 60 times per second. The `timestamp` is a [DOMHighResTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) provided by the [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) method which is used internally.

### `visualization.resize(skqw)`

Called whenever the app window is resized.

### `visualization.destroy(skqw)`

Called just before unloading the visualization, as when a different visualization is selected in the UI.

### `visualization.paramChange(skqw, change)`

Called whenever the user changes a param in the UI.

### `visualization.params`

An object describing the user-configurable parameters which may be changed at run time to alter the way the visualization renders.
