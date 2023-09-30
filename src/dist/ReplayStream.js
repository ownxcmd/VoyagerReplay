import { Replay } from './Replay.js'

class ReplayStream extends Replay {
    constructor(renderer, watchid) {
        super(renderer);
        this.watchId = watchid;
        this.queue = [];
    }

    handleEvent(event) {
        if (event instanceof MessageEvent) {
            const data = JSON.parse(event.data);
            // do a watchid check here
            if (data.id != this.watchId) {
                return;
            }
            this.queue.push(...data.captures);
            if (this.queue.length >= (1/this.tickDelay)*10) {
                this.displayLoop();
            }
        }
    }

    async displayLoop() {
        if (this.runDisplayLoop) {
            return; // don't want to run multiple display loops
        }

        this.runDisplayLoop = true;
        while (this.runDisplayLoop) {
            const capture = this.queue.shift();
            if (!capture) {
                this.runDisplayLoop = false;
                break;
            }

            if (!this.initialized) {
                this.initialized = true;
                this.display.initialize(capture);
            }

            if (!this.runDisplayLoop) { // do i even need this
                break;
            }

            this.frame++;
            this.display.updateMovingObjects(capture.MovingInfo);
            await sleep(1000*this.tickDelay);
        }
    }

    destroy() {
        super.destroy();
        this.queue.length = 0;
        getEventListeners(this.socket).message[0].remove();
    }
}

export { ReplayStream }