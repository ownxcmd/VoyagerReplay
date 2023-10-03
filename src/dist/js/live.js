import * as THREE from 'three';
import { ReplayStream } from './ReplayStream.js';
import { ReplayHandler } from './ReplayHandler.js'

const renderer = new THREE.WebGLRenderer();
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

const Handler = new ReplayHandler(renderer);

const streamSocket = new WebSocket(`ws://localhost:8080`);

const WatchParams = new URLSearchParams(window.location.search);
if (WatchParams.has('id')) {
    const streamId = WatchParams.get('id');
    addStream(streamId);
    setStream(streamId);
}

document.getElementById('stream-list').addEventListener('change', updateStreamSelection);

streamSocket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.type === 'chunk') {
        if (Handler.activeReplay && Handler.activeReplay.id === data.id) {
            Handler.activeReplay.update(data);
        }
    
        if (!document.getElementById(`stream-${data.id}`)) {
            addStream(data.id);
        }
    }
    
    if (data.type === 'end') {
        console.log('end', data);

        if (data.id != WatchParams.get('id')) {
            document.getElementById(`stream-${data.id}`).remove();
        }
        
        if (Handler.activeReplay && Handler.activeReplay.id === data.id) {
            Handler.activeReplay = null;
        }
    }
});

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
        Handler.activeReplay = null;
        return;
    }
    window.history.replaceState({}, '', `/live?id=${streamId}`);

    const NewReplay = new ReplayStream(renderer, streamId);
    Handler.activeReplay = NewReplay;
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