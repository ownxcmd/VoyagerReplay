import { Replay } from './Replay.js'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

class ReplayFile extends Replay {
    constructor(renderer, replayData) {
        super(renderer);

        this.id = replayData.id;
        this.queue = replayData.captures;
        this.displayLoop();
    }
}

export { ReplayFile }