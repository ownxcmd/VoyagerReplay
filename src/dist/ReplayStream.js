import { Replay } from './Replay.js'

class ReplayStream extends Replay {
    constructor(renderer, tickRate) {
        super(renderer, tickRate);
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            //console.log(data);
            this.queue.push(...data);
            super.displayLoop();
        })
    }

    destroy() {
        super.destroy();
        getEventListeners(this.socket).message[0].remove();
    }
}

export { ReplayStream }