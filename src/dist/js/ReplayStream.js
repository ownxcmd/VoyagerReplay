import { Replay } from './Replay.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class ReplayStream extends Replay {
    constructor(renderer, streamid) {
        super(renderer);
        this.id = streamid;
        this.queue = [];

        this.displayLoop();
    }

    update(data) {
        // do a streamid check here
        if (data.id != this.id) {
            console.log(data.id, this.id, this.runDisplayLoop);
            return;
        }
        this.queue.push(...data.captures);
    }

    async displayLoop() {
        if (this.runDisplayLoop) {
            return; // don't want to run multiple display loops
        }

        this.runDisplayLoop = true;
        while (this.runDisplayLoop) {
            const capture = this.queue.shift();
            if (!capture) {
                await sleep(1000*this.tickDelay);
                continue;
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
    }
}

export { ReplayStream }