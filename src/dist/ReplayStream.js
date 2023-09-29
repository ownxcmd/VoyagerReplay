import { Replay } from './Replay.js'

class ReplayStream extends Replay {
    constructor(renderer) {
        super(renderer);
        this.socket = new WebSocket('ws://localhost:8080');

        this.socket.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            //console.log(data);
            this.queue.push(...data);
            if (this.queue.length >= (1/this.tickDelay)*10) {
                super.displayLoop();
            }
        });
    }

    destroy() {
        super.destroy();
        getEventListeners(this.socket).message[0].remove();
    }
}

export { ReplayStream }