import * as THREE from 'three';
import * as BSON from 'bson';
import { ReplayFile } from './ReplayFile.js';

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

let ActiveReplay;
const WatchParams = new URLSearchParams(window.location.search);
if (WatchParams.has('id')) {
    fetch(`/replay/${WatchParams.get('id')}`)
        .then(response => response.json())
        .then(replayData => {
            ActiveReplay = new ReplayFile(renderer, replayData);
        });
}

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
        ActiveReplay.destroy();
    }

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
            const extension = file.name.split('.').pop();

            if (extension == 'bson') {
                reader.readAsArrayBuffer(file);
            } else if (extension == 'json') {
                reader.readAsText(file, 'UTF-8');
            }

            reader.onload = readerEvent => {
                const content = readerEvent.target.result;
                resolve([content, extension]);
            }
        };

        input.click();
    });
}

// Replay select callback
function onButtonClicked(){
    selectReplay().then(([selectedReplay, extension]) => {
        if (!selectedReplay) {
            return;
        }

        console.log(extension);
    
        let replayData;
        try {
            replayData = extension == 'bson' ? BSON.deserialize(selectedReplay) : JSON.parse(selectedReplay);
        } catch (e) {
            alert('Invalid replay file provided');
        }
    
        const NewReplay = new ReplayFile(renderer, replayData);
        SwitchReplay(NewReplay);
    });
}

animate();