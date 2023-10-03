import { Replay } from './Replay.js'
import { ReplayInputHandler } from './Input.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class ReplayFile extends Replay {
    constructor(renderer, replayData) {
        super(renderer);

        this.input = new ReplayInputHandler(this);
        this.replayData = replayData;
        this.fastForward = false;
        this.rewind = false;
        this.createKeybinds();
        this.displayLoop();
    }

    frameClamp(value) {
        return clamp(value, 0, this.replayData.captures.length - 1);
    }

    createKeybinds() {
        this.input.addKeybind('Space', (event) => {
            if (event.type == 'keydown') {
                (this.runDisplayLoop ? this.stopDisplayLoop : this.displayLoop)();
            }
        });

        this.input.addKeybind('ArrowLeft', (event) => {
            if (event.type == 'keydown') {
                if (!this.runDisplayLoop) {
                    const capture = this.replayData.captures[this.frameClamp(--this.frame)];
                    this.display.updateMovingObjects(capture.MovingInfo);
                } else {
                    this.rewind = true;
                }
            }
        });

        this.input.addKeybind('ArrowRight', (event) => {
            
        })
    }

    handleEvent(event) {
        if (event instanceof KeyboardEvent) {
            if (event.type == 'keydown') {
                switch(event.code) {
                    case 'Space':
                        if (this.runDisplayLoop) {
                            this.stopDisplayLoop();
                        } else {
                            this.displayLoop();
                        }
                        break;
                    case 'ArrowLeft':
                        if (!this.runDisplayLoop) {
                            const capture = this.replayData.captures[this.frameClamp(--this.frame)];
                            this.display.updateMovingObjects(capture.MovingInfo);
                        } else {
                            this.rewind = true;
                        }
                        break;
                    case 'ArrowRight':
                        if (!this.rewind && !this.runDisplayLoop) {
                            const capture = this.replayData.captures[this.frameClamp(++this.frame)];
                            this.display.updateMovingObjects(capture.MovingInfo);
                        } else if (this.runDisplayLoop) {
                            this.fastForward = true;
                        }
                }
            } else if (event.type == 'keyup') {
                switch(event.code) {
                    case 'ArrowLeft':
                        this.rewind = false;
                        break;
                    case 'ArrowRight':
                        this.fastForward = false;
                        break;
                }
            }
            console.log(event);
            
        }
    }

    getFrameAdvance() {
        let nextFrameValue;

        if (this.rewind) {
            nextFrameValue = this.frame - 1;
        } else if (this.fastForward) {
            nextFrameValue = this.frame + 2;
        } else {
            nextFrameValue = this.frame + 1;
        }

        return this.frameClamp(nextFrameValue);
    }

    async displayLoop() {
        if (this.runDisplayLoop) {
            return; // don't want to run multiple display loops
        }

        this.runDisplayLoop = true;
        
        while(this.runDisplayLoop) {
            const capture = this.replayData.captures[this.frame];

            if (!this.initialized) {
                this.initialized = true;
                this.display.initialize(capture);
            }

            if (!this.runDisplayLoop) { // need to check after initialize
                break;
            }

            this.frame = this.getFrameAdvance();
            this.display.updateMovingObjects(capture.MovingInfo);
            await sleep(1000*this.tickDelay);
        }
    }
}

export { ReplayFile }