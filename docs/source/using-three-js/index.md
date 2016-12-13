---
title: "Developer Guide: Using Three.js"
date: 2016-08-26 08:59:02
---

SKQW supports both the 2d and 3d contexts of the HTML Canvas. For working with 3d, it is common to use a library to abstract over the low-level WebGL APIs. One popular 3d library is [Three.js](http://threejs.org/).

Here is a complete example which recreates the ["creating a scene" tutorial example](http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene) from the Three documentation as a SKQW visualization:

```JavaScript
const {createCanvas, getSample, getDimensions} = require('skqw-core');
// The Three library can be downloaded and saved in the same folder as the visualization script.
const THREE = require('./three');

let scene;
let camera;
let renderer;
let cube;

function init() {
    const { width, height } = getDimensions();
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

    // create a canvas
    let canvas = createCanvas();
    // and pass it to Three, so Three can use it to render onto
    renderer = new THREE.WebGLRenderer({ canvas });

    renderer.setSize( width, height );

    let geometry = new THREE.BoxGeometry( 1, 1, 1 );
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

    camera.position.z = 5;
}

function tick() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render( scene, camera );
}

module.exports = {
    name: 'Three.js Demo',
    init,
    tick
};
```

## Loading External Scripts

For more advanced results, you will likely want to load external JavaScript files for things like shaders or effect composers.

To do this, you should use the `loadScript()` function from the `skqw-core` module.

```JavaScript
const {createCanvas, getSample, getDimensions, loadScript} = require('skqw-core');

// Using loadScript() rather than require() will automatically create the global THREE object.
loadScript('./three.js');

// Some external scripts we need for our fancy 3d visualization.
// Saved locally in the same folder as the visualization.
loadScript('./CopyShader.js');
loadScript('./EffectComposer.js');
loadScript('./RGBShiftShader.js');
loadScript('./RenderPass.js');
loadScript('./ShaderPass.js');

// ... skip some variable declarations

function init() {
    const { width, height } = getDimensions();
    const { ft } = getSample();;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(100, width / height, 10, 5000);
    camera.position.set(0, 100, 10);
    camera.lookAt(new THREE.Vector3(0, 10, -100));
    let canvas = createCanvas();
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(width, height);

    scene = new THREE.Scene();

    // postprocessing
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    rgbEffect = new THREE.ShaderPass(THREE.RGBShiftShader);
    rgbEffect.uniforms['amount'].value = 0.0015;
    rgbEffect.renderToScreen = true;
    composer.addPass(rgbEffect);
}
```