---
title: "The skqw-core Module"
date: 2016-12-12 15:36:33
---

The `skqw-core` module is provided by SKQW and exposes some key functions which are required to create a visualization.

## `createCanvas()`

Creates an HTML Canvas element which can then be drawn to - either directly by using `.getContext()`, or by passing it to a graphics library such as Three.js.

```JavaScript
// A simple 2d canvas example
let ctx = createCanvas().getContext('2d');
ctx.strokeStyle = 'red';
ctx.beginPath();
ctx.moveTo(100, 150);
ctx.lineTo(450, 50);
ctx.stroke();

// An example using Three.js
let canvas = createCanvas();
let renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
// .. snip
renderer.render(scene, camera);
```

## `getDimensions()`

Returns an object describing the dimensions of the SKQW window.

```JavaScript
const { width, height } = getDimensions();
```

## `getSample()`

Returns an object containing two arrays which represent the latest audio sample from the sound card:

* `ts` is the "time series" or waveform of the current audio sample. It consists of 256 numbers.
* `ft` is the "fourier transform" or frequency spectrum of the current audio sample. It consists of 128 numbers.

The two arrays provided by `sample` provide the raw information that you will use to form the basis of your visualizations.

```JavaScript
const { ts, ft } = getSample();

drawWaveform(ts);
drawFrequencySpectrum(ft);
```

## `loadScript()`

This function is used to load JavaScript files which are *not* CommonJS modules. A typical example is a Three.js shader file.
Scripts loaded with `loadScript()` will be executed in the global scope, and any global variables created within them will thus be available for use in your visualization.

```JavaScript
// CopyShader.js
THREE.CopyShader = {

	// ... shader code snipped
};
```
.

```JavaScript
// myVisualization.js

// assuming Three.js has been loaded and a global `THREE` object has been created.

loadScript('./CopyShader.js');
```