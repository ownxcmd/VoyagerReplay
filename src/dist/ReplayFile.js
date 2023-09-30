import { Replay } from './Replay.js'

class ReplayFile extends Replay {
    constructor(renderer, replayData) {
        super(renderer);

        this.replayData = replayData;
    }

    async displayLoop() {
        if (this.runDisplayLoop) {
            return; // don't want to run multiple display loops
        }

        this.runDisplayLoop = true;
        for (; this.frame < this.replayData.Captures.length; this.frame++) {
            const capture = this.replayData.Captures[this.frame];

            if (!this.initialized) {
                this.initialized = true;
                this.display.initialize(capture);
            }

            if (!this.runDisplayLoop) { // need to check after initialize
                break;
            }

            this.display.updateMovingObjects(capture.MovingInfo);
            await sleep(1000*this.tickDelay);
        }
    }
}

export { ReplayFile }