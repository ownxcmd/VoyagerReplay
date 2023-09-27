import * as THREE from 'three';
import { ReplayStream } from './ReplayStream.js';

const TICKS_PER_SECOND = 30;

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

let ActiveReplay = new ReplayStream(renderer, 1/TICKS_PER_SECOND)

function SwitchReplay(Replay) {
    if (ActiveReplay) {
        ActiveReplay.destroy();
    }
    ActiveReplay = Replay;
}

function animate() {
    const display = ActiveReplay.display;

    requestAnimationFrame( animate );
    display.controls.update();
    display.renderer.setSize( window.innerWidth, window.innerHeight );
    display.renderer.render( display.scene, display.camera );
}

console.log(window.location.href.split('/').slice(-1));
animate();