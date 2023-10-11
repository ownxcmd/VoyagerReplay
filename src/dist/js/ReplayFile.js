import { Replay } from './Replay.js'

class ReplayFile extends Replay {
    constructor(renderer, replayData) {
        super(renderer);

        this.id = replayData.id;
        this.queue = replayData.captures;
        this.displayLoop();
    }
}

export { ReplayFile }