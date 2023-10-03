class ReplayInputHandler {
    static _instance;

    constructor() {
        if (ReplayInputHandler._instance) {
            return ReplayInputHandler._instance;
        }

        ReplayInputHandler._instance = this;

        this.callbacks = [];

        document.addEventListener('keydown', this);
        document.addEventListener('keyup', this);
    }

    static get instance() {
        if(!ReplayInputHandler._instance){
            return new ReplayInputHandler();
        }

        return ReplayInputHandler._instance;
    }

    handleEvent(event) {
        for (const connection of this.callbacks) {
            if (connection.keycode != event.code || !connection.enabled) {
                continue;
            }
    
            connection.callback(event);
        }
    }
}

class ReplayKeybind {
    constructor(keyCode, callback) {
        this.keycode = keyCode;
        this.callback = callback;
        this.enabled = true;

        ReplayInputHandler.instance.callbacks.push(this);
    }

    unbind() {
        ReplayInputHandler.instance.callbacks = ReplayInputHandler.instance.callbacks.filter((connection) => {
            return connection != this;
        });
    }

    enable() {
        this.enabled = true;
    }

    disable() {
        this.enabled = false;
    }
}


export { ReplayKeybind }