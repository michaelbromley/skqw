---
title: "Developer Guide: Using Three.js"
date: 2016-08-26 08:59:02
---

SKQW supports both the 2d and 3d contexts of the HTML Canvas. For working with 3d, it is common to use a library to abstract over the low-level WebGL APIs. One popular 3d library is [Three.js](http://threejs.org/).

Since Three.js creates its own HTML Canvas element, we can simply pass this to the `skqw.createCanvas()` method, and SKQW will use the one provided by Three.

Here is a complete example which recreates the ["creating a scene" tutorial example](http://threejs.org/docs/index.html#Manual/Introduction/Creating_a_scene) from the Three documentation as a SKQW visualization:

```JavaScript
// The Three library can be downloaded and saved in the same folder as the 
// visualization script.
const THREE = require('./three');

let scene;
let camera;
let renderer;
let cube;

function init(skqw) {
    const { width, height } = skqw.dimensions;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    
    // Here is the key line. This tells SKQW to use Three's canvas element
    // to render to.
    skqw.createCanvas(renderer.domElement);

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
    name: 'Three.js Test',
    init,
    tick
};

```