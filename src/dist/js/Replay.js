import { Display } from './Display.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class Replay {
    #frame;

    constructor(renderer) {
        this.initialized = false;
        this.runDisplayLoop = false;

        this.tickDelay = 1/30;
        this.#frame = 0;
        this.queue = [];

        this.fastForward = false;
        this.rewind = false;

        this.display = new Display(renderer);
    }

    set frame(value) {
        this.#frame = clamp(value, 0, this.queue.length - 1);

        const capture = this.queue[this.#frame];
        if (!capture) {
            return;
        }

        this.display.updateMovingObjects(capture.MovingInfo);
    }

    get frame() {
        return this.#frame;
    }

    get nextFrame() {
        if (this.rewind) {
            return this.#frame - 1;
        } else if (this.fastForward) {
            return this.#frame + 2;
        } else {
            return this.#frame + 1;
        }
    }

    async displayLoop() {
        if (this.runDisplayLoop) {
            return; // don't want to run multiple display loops
        }

        this.runDisplayLoop = true;
        
        while(this.runDisplayLoop) {
            if (!this.initialized) {
                const capture = this.queue[this.#frame];
                if (capture) {
                    this.initialized = true;
                    this.display.initialize(capture);
                }
            }

            this.frame = this.nextFrame;
            await sleep(1000*this.tickDelay);
        }
    }

    stopDisplayLoop() {
        this.runDisplayLoop = false;
    }

    destroy() {
        this.stopDisplayLoop();
        this.queue.length = 0;
        this.display.destroy();
    }
}

export { Replay }