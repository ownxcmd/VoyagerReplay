import { Display } from './Display.js'

class Replay {
    constructor(renderer) {
        this.initialized = false;
        this.runDisplayLoop = false;
        this.frame = 0;
        this.tickDelay = 1/30;
        this.display = new Display(renderer);
    }

    stopDisplayLoop() {
        this.runDisplayLoop = false;
    }

    destroy() {
        this.stopDisplayLoop();
        this.display.destroy();
    }
}

export { Replay }