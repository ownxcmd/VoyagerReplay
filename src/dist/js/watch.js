import * as BSON from 'bson';
import { ReplayFile } from './ReplayFile.js';
import { ReplayHandler } from './ReplayHandler.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

const Handler = new ReplayHandler();
const ReplayControls = new GUI();

const WatchParams = new URLSearchParams(window.location.search);
if (WatchParams.has('id')) { // if were trying to view a replay stored on the server
    fetch(`/replay/${WatchParams.get('id')}`)
        .then(response => response.json())
        .then(replayData => {
            Handler.activeReplay = new ReplayFile(replayData);
        });
}

//document.getElementById('select-replay').addEventListener('click', onButtonClicked);

let CurrentFrameSlider, CurrentTime;
const Controls = {
    'Open Replay': onButtonClicked,
    'Toggle Player Names (V)': () => {
        ReplayHandler.instance.activeReplay?.display.togglePlayerNames();
    },
}

function createGui() {
    ReplayControls.title('Replay Controls')

    ReplayControls.add(Controls, 'Open Replay');
    ReplayControls.add(Controls, 'Toggle Player Names (V)');

    ReplayControls.open();
}

// replay selection
function openReplayFile (){
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
    openReplayFile().then(([selectedReplay, extension]) => {
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
    
        Handler.activeReplay = new ReplayFile(replayData);
        CurrentFrameSlider?.destroy();
        CurrentTime?.destroy();

        CurrentTime = ReplayControls.add(Handler.activeReplay, 'time')
            .name('Time')
            .disable()
            .listen();

        CurrentFrameSlider = ReplayControls.add(Handler.activeReplay, 'frame', 0, Handler.activeReplay.queue.length - 1, 1)
            .name('Frame')
            .decimals(0)
            .listen()
            .onChange((newFrame) => {
                Handler.activeReplay.frame = newFrame;
            });
    });
}

createGui();