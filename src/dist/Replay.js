import { Display } from './Display.js'

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Replay {
    constructor(renderer, tickDelay = 30) {
        this.mapPass = false;
        this.runDisplayLoop = false;
        this.queue = [];
        this.frame = 0;
        this.display = new Display(renderer);

        this.tickDelay = tickDelay;
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

            if (!this.mapPass) {
                this.mapPass = true;
                await this.display.initialize(capture);
            }

            if (!this.runDisplayLoop) {
                break;
            }

            this.frame++;
            this.display.updateMovingObjects(capture.MovingInfo);
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
        this.scene.remove.apply(this.scene, this.scene.children);
    }
}

export { Replay }