---
title: "Developer Guide: Common Patterns"
date: 2016-08-27 08:57:33
---

Here are some patterns and techniques I have found useful in creating more sophisticated visualizations. These currently apply to 2D contexts, since I have not created any 3D ones yet.

## Getting the Volume

It is often useful to calculate the overall volume of the signal. This is a simple matter of adding up all the values of the `ft` array:

```JavaScript
function tick(skqw) {
  const ft = skqw.sample.ft;
  
  // Here is a procedural approach to calculating the volume.
  const volume1 = 0;
  for (let i = 0; i < ft.length; i ++) {
      volume1 += ft[i];
  }
  
  // Here is a more functional approach. Performance may be worse, but 
  // that probably won't matter.
  const volume2 = ft.reduce((a, b) => a + b);
}
```

## Damping

The audio signal often fluctuates rapidly. Directly mapping those changes to a visualization can result in an unpleasantly jerky experience.

Damping can be used to smooth out the rapid fluctuations and give a smoother signal with which to work. Here is one way to do that:

```JavaScript
let dampedVolume = 0;
// A higher value gives a smoother but slower response to
// changes in the signal value.
const dampingFactor = 10;

function tick(skqw) {
  const ft = skqw.sample.ft;
  
  const volume = ft.reduce((a, b) => a + b);
  const delta = volume - dampedVolume;
  dampedVolume += delta / dampingFactor;
}
```

## Multiple Canvases

SKQW allows you to create as many canvases as you like, and they will be layered on top of one another. This can be useful, for instance, when you want one layer to use a different blend mode than another, or have one canvas update at a different frame rate than another.

```JavaScript
let backgroundCtx;
let foregroundCtx;

function init(skqw) {
  backgroundCtx = skqw.createCanvas().getContext('2d');
  foregroundCtx = skqw.createCanvas().getContext('2d');
}
```

## Off-Screen Buffer Canvas

A canvas element may be created but never rendered to directly, but rather used as a buffer for the main canvas. This can allow a couple of advanced techniques:

1. Setting the alpha on a frame, rather than clearing it completely.
2. Transforming a frame and overlaying the transform on the next frame.

This technique is used, for example, in the default "SKQW" visualization to create the "waterfall" effect.

A buffer canvas is not created with `skqw.createCanvas()` since we do not intend to render to it directly:

```JavaScript
let ctx;
let ctxBuffer;

function init(skqw) {
  const { width, height } = skqw.dimensions;
  
  ctx = skqw.createCanvas().getContext('2d');
  
  // the buffer is created with the regular DOM API.
  ctxBuffer = document.createElement('canvas').getContext('2d');
  
  // we need to manually manage the dimensions of the buffer, since
  // SKQW does not know about it.
  ctxBuffer.canvas.width = width;
  ctxBuffer.canvas.height = height;
}

function tick(skqw) {
  const { width, height } = skqw.dimensions;

  ctxBuffer.save();
  ctxBuffer.clearRect(0, 0, width, height);
  ctxBuffer.globalAlpha = 0.8;
  // set up a translation to apply to the buffer (move it down 
  // by one pixel in this case)
  ctxBuffer.translate(0, 1);
  // copy the main canvas to the buffer
  ctxBuffer.drawImage(ctx.canvas, 0, 0);
  // clear the main canvas as usual
  ctx.clearRect(0, 0, width, height);
  // copy the transformed buffer back to the main canvas
  ctx.drawImage(ctxBuffer.canvas, 0, 0);
  ctxBuffer.restore();
  
  // ... do the rest of the drawing
}
```

