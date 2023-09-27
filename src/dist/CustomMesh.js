import * as THREE from 'three';

const loader = new OBJLoader();

class PlayerPart {
    static Loaded = {};

    static async get(ModelName) {
        if (!this.Loaded[ModelName]) {
            
            this.Loaded[ModelName] = await loader.loadAsync(`./mesh/${ModelName}.obj`);
        };

        return this.Loaded[ModelName];
    }
}

export { Head }