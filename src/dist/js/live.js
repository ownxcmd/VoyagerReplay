import { ReplayStream } from './ReplayStream.js';
import { ReplayHandler } from './ReplayHandler.js'

const Handler = new ReplayHandler();

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

    console.log(event.type, data)

    if (data.type === 'chunk') {
        if (Handler.activeReplay && Handler.activeReplay.id === data.id) {
            Handler.activeReplay.update(data);
        }
    
        if (!document.getElementById(`stream-${data.id}`)) {
            addStream(data.id);
        }

        if (!Handler.activeReplay && WatchParams.get('id') === data.id) {
            setStream(data.id);
        }
    }
    
    if (data.type === 'end') {
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

    Handler.activeReplay = new ReplayStream(Handler.renderer, streamId);
}

(async () => {
    const response = await fetch('/stream');
    const streams = await response.json();

    for (const streamId of streams) {
        if (!document.getElementById(`stream-${streamId}`)) {
            addStream(streamId);
        }
    }
})();