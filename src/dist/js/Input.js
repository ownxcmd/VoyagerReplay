class ReplayInputHandler {
    constructor(replay) {
        this.replay = replay;
        this.callbacks = [];

        document.addEventListener('keydown', this);
        document.addEventListener('keyup', this);
    }

    addKeybind(keyCode, callback) {
        this.callbacks.push({
            code: keyCode,
            callback: callback,
        });
    }

    handleEvent(event) {
        for (const connection of this.callbacks) {
            if (connection.code != event.code) {
                continue;
            }
    
            connection.callback.call(this.replay, event);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this);
        document.removeEventListener('keyup', this);
    }
}

export { InputHandler }