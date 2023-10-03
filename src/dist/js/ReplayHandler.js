import { ReplayKeybind } from './Input.js'

class ReplayHandler {
    static _instance;

    constructor(renderer) {
        if (ReplayHandler._instance) {
            return ReplayHandler._instance;
        }
        
        ReplayHandler._instance = this;

        this.renderer = renderer;
        this.createKeybinds();

        this.render = this.animate.bind(this);
        this.render();
    }

    static get instance() {
        if(!ReplayHandler._instance){
            return new ReplayHandler();
        }

        return ReplayHandler._instance;
    }

    animate() {
        if (this.activeReplay) {
            const display = this.activeReplay.display;
            display.controls.update();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            this.renderer.render( display.scene, display.camera );
        }
    
        requestAnimationFrame( this.render );
    }

    createKeybinds() {
        const Pause = new ReplayKeybind('Space', (event) => {
            const replay = this.activeReplay;
            if (event.type == 'keydown') {
                (replay.runDisplayLoop ? replay.stopDisplayLoop : replay.displayLoop).call(replay);
            }
        });

        const Rewind = new ReplayKeybind('ArrowLeft', (event) => {
            const replay = this.activeReplay;
            if (event.type == 'keydown') {
                if (!replay.runDisplayLoop) {
                    replay.frame--;
                }
                replay.rewind = !replay.fastForward;
            } else if (event.type == 'keyup') {
                replay.rewind = false;
            }
        });

        const FastForward = new ReplayKeybind('ArrowRight', (event) => {
            const replay = this.activeReplay;
            if (event.type == 'keydown') {
                if (!replay.runDisplayLoop) {
                    replay.frame++;
                }
                replay.fastForward = !replay.rewind;
            } else if (event.type == 'keyup') {
                replay.fastForward = false;
            }
        });

        const Beginning = new ReplayKeybind('ArrowDown', (event) => {
            const replay = this.activeReplay;
            if (event.type == 'keydown') {
                if (!replay.runDisplayLoop) {
                    replay.frame = 0;
                }
            }
        });

        const End = new ReplayKeybind('ArrowUp', (event) => {
            const replay = this.activeReplay;
            if (event.type == 'keydown') {
                if (!replay.runDisplayLoop) {
                    replay.frame = replay.queue.length - 1;
                }
            }
        });
    }

    set activeReplay(replay) {
        if (this._activeReplay) {
            this._activeReplay.destroy();
        }

        this.renderer.clear();
        this._activeReplay = replay;
    }

    get activeReplay() {
        return this._activeReplay;
    }
}

export { ReplayHandler }