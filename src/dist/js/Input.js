class ReplayInputHandler {
    static _instance;

    constructor() {
        if (ReplayInputHandler._instance) {
            return ReplayInputHandler._instance;
        }

        ReplayInputHandler._instance = this;

        this.keybinds = new Set();

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
        for (const bind of this.keybinds) {
            if (bind.keycode != event.code || !bind.enabled) {
                continue;
            }
    
            bind.callback(event);
        }
    }
}

class ReplayKeybind {
    constructor(keyCode, callback) {
        this.keycode = keyCode;
        this.callback = callback;
        this.enabled = true;

        ReplayInputHandler.instance.keybinds.add(this);
    }

    unbind() {
        ReplayInputHandler.instance.keybinds.delete(this);
    }
}


export { ReplayKeybind }