import * as THREE from 'three';
import { ReplayStream } from './ReplayStream.js';
import { ReplayFile } from './ReplayFile.js';

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );


const streamSocket = new WebSocket('ws://localhost:8080');

let ActiveReplay = new ReplayStream(renderer, window.location.href.split('/').slice(-1));
streamSocket.addEventListener('message', ActiveReplay);

document.getElementById('select-replay').addEventListener('click', onButtonClicked);

document.addEventListener('keydown', (event) => {
    if (ActiveReplay) { 
        ActiveReplay.handleEvent(event);
    }
});
document.addEventListener('keyup', (event) => {
    if (ActiveReplay) {
        ActiveReplay.handleEvent(event);
    }
});

function SwitchReplay(Replay) {
    if (ActiveReplay) {
        streamSocket.removeEventListener('message', ActiveReplay);
        ActiveReplay.destroy();
    }

    streamSocket.addEventListener('message', Replay);
    ActiveReplay = Replay;
}

function animate() {
    if (ActiveReplay) {
        const display = ActiveReplay.display;
        display.controls.update();
        display.renderer.setSize( window.innerWidth, window.innerHeight );
        display.renderer.render( display.scene, display.camera );
    }

    requestAnimationFrame( animate );
}

// replay selection
function selectReplay (){
    return new Promise(resolve => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = false;
        input.accept = 'application/bson';

        input.onchange = _ => {
            const file = input.files[0];
            const reader = new FileReader();

            reader.readAsText(file,'UTF-8');
            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                resolve(content);
            }
        };

        input.click();
    });
}

// Replay select callback
function onButtonClicked(){
    selectReplay().then((selectedReplay) => {
        if (!selectedReplay) {
            return;
        }
    
        let replayData;
        try {
            replayData = JSON.parse(selectedReplay);
        } catch (e) {
            alert('Invalid JSON replay file provided');
        }
        
        console.log(replayData);
    
        const NewReplay = new ReplayFile(renderer, replayData);
        SwitchReplay(NewReplay);
    });
}



console.log();
animate();