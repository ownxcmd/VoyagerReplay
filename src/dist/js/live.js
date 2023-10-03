import * as THREE from 'three';
import { ReplayStream } from './ReplayStream.js';

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

const streamSocket = new WebSocket(`ws://localhost:8080`);

const WatchParams = new URLSearchParams(window.location.search);
let ActiveReplay;
if (WatchParams.has('id')) {
    const streamId = WatchParams.get('id');
    addStream(streamId);
    setStream(streamId);
    updateStreamSelection(streamId);
}

document.getElementById('stream-list').addEventListener('change', updateStreamSelection);

// document.addEventListener('keydown', (event) => {
//     if (ActiveReplay) { 
//         ActiveReplay.handleEvent(event);
//     }
// });
// document.addEventListener('keyup', (event) => {
//     if (ActiveReplay) {
//         ActiveReplay.handleEvent(event);
//     }
// });

streamSocket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'chunk') {
        if (ActiveReplay) {
            ActiveReplay.update(data);
        }
    
        if (!document.getElementById(`stream-${data.id}`)) {
            addStream(data.id);
        }
    }
    
    if (data.type === 'end') {
        console.log('end', data);
        if (ActiveReplay && ActiveReplay.id === data.id) {
            console.log('removing');
            setStream('none');
            document.getElementById(`stream-${data.id}`).remove();
            SwitchReplay(null);
        }
    }
});

function SwitchReplay(Replay) {
    if (ActiveReplay) {
        ActiveReplay.destroy();
    }

    renderer.clear();
    ActiveReplay = Replay;
}

function animate() {
    if (ActiveReplay) {
        const display = ActiveReplay.display;
        display.controls.update();
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.render( display.scene, display.camera );
    }

    requestAnimationFrame( animate );
}

function getSelectedStream() {
    const streamList = document.getElementById('stream-list');
    const streamId = streamList.options[streamList.selectedIndex].value;

    return streamId;
}

function setStream(streamId) {
    const streamList = document.getElementById('stream-list');
    streamList.value = streamId;
    updateStreamSelection();
}

function addStream(streamId) {
    const streamList = document.getElementById('stream-list');

    const option = document.createElement('option');
    option.id = `stream-${streamId}`;
    option.value = streamId;
    option.innerText = streamId;
    streamList.appendChild(option);
}

function updateStreamSelection() {
    const streamId = getSelectedStream();

    if (streamId === 'none') {
        //window.history.replaceState({}, '', '/live');
        SwitchReplay(null);
        return;
    }
    window.history.replaceState({}, '', `/live?id=${streamId}`);

    const NewReplay = new ReplayStream(renderer, streamId);
    SwitchReplay(NewReplay);
}

(async () => {
    const response = await fetch('/live/streams');
    const streams = await response.json();

    for (const streamId of streams) {
        if (!document.getElementById(`stream-${streamId}`)) {
            addStream(streamId);
        }
    }
})();

animate();