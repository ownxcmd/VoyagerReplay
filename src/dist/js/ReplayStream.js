import { Replay } from './Replay.js'

class ReplayStream extends Replay {
    constructor(streamid) {
        super();
        this.id = streamid;
        this.dead = false;

        this.displayLoop();
    }

    update(data) {
        if (this.dead) {
            return;
        }
        this.queue.push(...data.captures);
    }

    destroy() {
        super.destroy();
        this.dead = true;
    }
}

export { ReplayStream }