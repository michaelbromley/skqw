---
title: "Developer Guide: Getting Started"
date: 2016-08-19 15:36:33
---

A visualization in SKQW is a JavaScript module in the commonjs format. Since SKQW is implemented on top of the Electron platform, which uses recent versions of Node and Chrome, you are free to use (most) ES2015 language features. One notable exception is that module imports and exports must be in the [Node commonjs](https://nodejs.org/docs/latest/api/modules.html) (`module.exports` and `require()`) format.

## File Location & Naming

A visualization main file must be located in a subdirectory of the "library path" (as set in the UI), and must be named "index.js":

```
// "visualizations" is set as the library path in the app.

- visualizations/
    |
    |- myVis/
    |   |- index.js
    |
```

## Basic Example

Here is a bare-bones visualization:

```JavaScript
// canvas context.
let ctx;

function init(skqw) {
    ctx = skqw.createCanvas().getContext('2d');
}

function tick(skqw) {
    const { width, height } = skqw.dimensions;
    const ft = skqw.sample.ft;

    // clear the canvas.
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, width, height);
    
    // draw the visualization frame
    drawBars(width, height, ft);
}

function drawBars(w, h, ft) {
    const length = ft.length;
    const width = w / length;
    
    // The bars will be red
    ctx.fillStyle = `hsla(0, 50%, 50%, 0.8)`;
    for(let i = 0; i < ft.length; i++) {
        const height = ft[i] * 250;
        const x = i * width;
        const y = h - height;
        ctx.fillRect(x, y, width - 2, height);
    }
}

module.exports = {
    name: 'Simple Example',
    init,
    tick
};
```

The code above will display a simple frequency spectrum of red bars. Let's take a look at each of the basic parts:

#### `init()` function
Every visualization *must* export an `init()` function. This function will be called once each time the visualization is selected in SKQW. It is used to set up the canvas as well as any other set-up your code may require. In this case we have SKQW create a new canvas for us to draw to, and save a reference to the canvas' [context object](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D). 

#### `skqw` object
This object is passed as the first parameter to each of the visualization lifecycle functions. It has a single method, `createCanvas()`, which 
will create an HTML canvas element which we can then draw on to.

It additionally has two properties: 

- `dimensions` which is an object containing the `width` and `height` of the 
canvas; 
- `sample` which is and object containing 2 arrays of numbers: 
    - `ts` is the "time series" or waveform of the current audio sample.
    - `ft` is the "fourier transform" or frequency spectrum of the current
    audio sample.
    
The two arrays provided by `sample` provide the raw information that you will use to form the basis of your visualizations.

#### `tick()` function
This is a required function which will be called every time a new audio sample arrives from the sound card, roughly 60 times per second. This is 
where the magic happens! The `tick` function is responsible for rendering each individual frame of your visualization.

In our example, we first clear the canvas by drawing a big black rectangle over whatever was there before, and then we call a function which will
iterate over each value in the `sample.ft` array, and represent it as a red bar whose height is proportional to the value of that frequency.

#### `module.exports` 
Finally, we export the required information as a [Node commonjs](https://nodejs.org/docs/latest/api/modules.html) module. There are more functions and properties which SKQW can read (see the [API docs](../api-reference)), which lets us write richer visualizations, but the three shown are the bare minimum required for things to work.

## Next Steps

Now you should know enough to start playing around with SKQW visualizations and creating some cool visuals!

There are a few more parts of the API not covered above. For a full rundown of all APIs, see the [API Reference](../api-reference).

Another way to learn is to take a look at the [source code of the standard library of visualizations](https://github.com/michaelbromley/skqw-library). 
