/**
 * Just testing to see if I can get Three.js working. This is just an unlit spinning cube.
 */
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
    skqw.createCanvas(renderer.domElement);

    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
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
