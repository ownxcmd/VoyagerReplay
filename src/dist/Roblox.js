import * as THREE from 'three';
import { GetGeometry } from './CustomGeometry.js';

const addVector = (a, b) => a.map((x, i) => x + b[i]);

class Skybox {
    constructor(Size = 1000000) {
        const skyboxFileNames = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
        const skyboxMaterialArray = skyboxFileNames.map(texture => {
            //const textureLoader = new THREE.TextureLoader();
            const material = new THREE.TextureLoader().load(`../texture/skybox/${texture}.png`);
    
            return new THREE.MeshBasicMaterial({ map: material, side: THREE.BackSide });
        });
    
        return new THREE.Mesh( new THREE.BoxGeometry( Size, Size, Size ), skyboxMaterialArray );
    }
}

class Lighting extends THREE.Group {
    constructor(SunPosition) {
        const Sun = new THREE.DirectionalLight(0xffffff, 1);
        Sun.position.set(...SunPosition);
        Sun.castShadow = true;
        Sun.shadow.camera.top = Sun.shadow.camera.right = 1000;
        Sun.shadow.camera.bottom = Sun.shadow.camera.left = -1000;
        Sun.shadow.mapSize.width = 8192;
        Sun.shadow.mapSize.height = 8192;
        Sun.shadow.camera.near = 0.1;
        Sun.shadow.camera.far = 2000000;

        const AmbientLight = new THREE.AmbientLight( 0xffffff, 0.25);

        this.add(Sun, AmbientLight);
    }
}

class Part {
    static ValidSettings = {
        position: typeof [],
        rotation: typeof [],
        size: typeof [],
        transparency: typeof 0,
        color: typeof 0, 
        tags: typeof [],
        shape: typeof '',
        id: typeof '',
    };

    constructor(Group, Settings) {
        for (const [key, value] of Object.entries(Settings)) {
            if (typeof value === Part.ValidSettings[key]) {
                this[key] = value;
            } else {
                console.warn(`Invalid setting ${key} with value ${value} passed to RobloxPart constructor`);
            }
        }

        const Geometry = GetGeometry(this.shape, this.size);
        const Material = new THREE.MeshPhysicalMaterial( { color: this.color, roughness: 0.5, reflectivity: 0.5, metalness: 0, clearcoat: 0, flatShading: false, fog: true } );
        if (this.transparency > 0) {
            Material.opacity = 1 - this.transparency;
            Material.transparent = true;
        }

        if (this.tags.Player && this.tags.PlayerPart == 'Head') {
            // Geometry.center();
            console.log('Player Head ', this.id);
        }

        this.mesh = new THREE.Mesh( Geometry, Material );
        
        this.mesh.position.set(...this.position);
        this.mesh.rotation.set(...this.rotation, 'YXZ');

        Group.add( this.mesh );
    }

    update(PartInfo) {
        //console.log('update called');
        this.mesh.position.set(...PartInfo.Position);
        this.mesh.rotation.set(...PartInfo.Rotation, 'YXZ');
    }

    destroy() {
        //console.log('destroying' + this.id);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.removeFromParent();
    }
}

export { Part, Lighting, Skybox }