import { Replay } from './Replay.js'

class ReplayStream extends Replay {
    constructor(renderer, textRenderer, streamid) {
        super(renderer, textRenderer);
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