import { Replay } from './Replay.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class ReplayFile extends Replay {
    constructor(renderer, replayData) {
        super(renderer);

        this.replayData = replayData;
        this.rewind = false;
        this.displayLoop();
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
                        this.rewind = true;
                }
            } else if (event.type == 'keyup') {
                switch(event.code) {
                    case 'ArrowLeft':
                        this.rewind = false;
                }
            }
            console.log(event);
            
        }
    }

    getFrameAdvance() {
        let nextFrameValue;

        if (this.rewind) {
            nextFrameValue = this.frame - 1;
        } else {
            nextFrameValue = this.frame + 1;
        }

        return clamp(nextFrameValue, 0, this.replayData.captures.length - 1);
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