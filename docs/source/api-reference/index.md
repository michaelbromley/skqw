---
title: API Reference
---

This is a description of the APIs for authoring visualizations in SKQW. For a general overview, see the [dev guide](../developer-guide-getting-started).

## Visualization Interfaces

```TypeScript
interface Visualization {
    name: string;
    init: () => void;
    tick: (timestamp: number) => void;
    resize?: () => void;
    destroy?: () => void;
    paramChange?: (change: ParamUpdate) => void;
    params?: { [name: string]: Parameter }
}

interface Parameter {
    value: number | boolean;
    type: 'range' | 'boolean';
    label: string;
    min?: number;
    max?: number;
    step?: number;
}

interface ParamUpdate {
    paramKey: string;
    newValue: number | boolean;
}
```

### `visualization.name`

The name which will be displayed in the app UI.

### `visualization.init()`

Called once when the visualization is selected in the UI. Normally used to create one or more canvases. 

**Important note:** it is not advisable to set the properties of a canvas context in the `init()` function, because in accordance with the [Canvas spec](https://dev.w3.org/html5/spec-preview/the-canvas-element.html), the context gets reset any time the canvas is resized. Therefore it is better to make changes to the context in either the `tick()` or the `resize()` functions.

### `visualization.tick(timestamp)`

Called for each frame of the visualization animation, roughly 60 times per second. The `timestamp` is a [DOMHighResTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) provided by the [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame) method which is used internally.

### `visualization.resize()`

Called whenever the app window is resized.

### `visualization.destroy()`

Called just before unloading the visualization, as when a different visualization is selected in the UI.

### `visualization.paramChange(change)`

Called whenever the user changes a param in the UI. If omitted, SKQW will automatically update any parameter values changed.

### `visualization.params`

An object describing the user-configurable parameters which may be changed at run time to alter the way the visualization renders.
