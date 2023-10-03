import * as THREE from 'three';
import * as BSON from 'bson';
import { ReplayFile } from './ReplayFile.js';
import { ReplayHandler } from './ReplayHandler.js'

const renderer = new THREE.WebGLRenderer();
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

const Handler = new ReplayHandler(renderer);

const WatchParams = new URLSearchParams(window.location.search);
if (WatchParams.has('id')) {
    fetch(`/replay/${WatchParams.get('id')}`)
        .then(response => response.json())
        .then(replayData => {
            Handler.activeReplay = new ReplayFile(renderer, replayData);
        });
}

document.getElementById('select-replay').addEventListener('click', onButtonClicked);

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
    
        Handler.activeReplay = new ReplayFile(renderer, replayData);;
    });
}