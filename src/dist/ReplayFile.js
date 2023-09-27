import { Replay } from './Replay.js'

class ReplayFile extends Replay {
    constructor(renderer, tickRate, replayData) {
        super(renderer, tickRate);
        
        this.queue.push(...replayData);
        super.displayLoop();
    }
}

export { ReplayFile }