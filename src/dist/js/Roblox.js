import * as THREE from 'three';
import { GetGeometry } from './CustomGeometry.js';

class Skybox extends THREE.Mesh {
    constructor(Size = 1000000) {
        super(new THREE.BoxGeometry( Size, Size, Size ));
        const skyboxFileNames = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
        const skyboxMaterialArray = skyboxFileNames.map(texture => {
            //const textureLoader = new THREE.TextureLoader();
            const material = new THREE.TextureLoader().load(`../texture/skybox/${texture}.png`);
    
            return new THREE.MeshBasicMaterial({ map: material, side: THREE.BackSide });
        });

        console.log(skyboxMaterialArray);
        this.material = skyboxMaterialArray;
    }
}

class Lighting extends THREE.Group {
    constructor(SunPosition) {
        super();

        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.sun.castShadow = true;
        this.sun.shadow.camera.top = this.sun.shadow.camera.right = 1000;
        this.sun.shadow.camera.bottom = this.sun.shadow.camera.left = -1000;
        this.sun.shadow.mapSize.width = 8192;
        this.sun.shadow.mapSize.height = 8192;
        this.sun.shadow.camera.near = 0.1;
        this.sun.shadow.camera.far = 2000000;
        if (SunPosition) {
            this.sun.position.set(...SunPosition);
        }

        this.ambient = new THREE.AmbientLight(0xffffff, 0.25);

        this.add(this.sun, this.ambient);
    }

    update(SunPosition) {
        this.sun.position.set(...SunPosition);
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

        console.log(this.id);

        const Geometry = GetGeometry(this.shape, this.size);
        const Material = new THREE.MeshPhysicalMaterial( { color: this.color, roughness: 0.5, reflectivity: 0.5, metalness: 0, clearcoat: 0, flatShading: false, fog: true } );
        if (this.transparency > 0) {
            Material.opacity = 1 - this.transparency;
            Material.transparent = true;
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
        this.mesh.material.color.set(PartInfo.Color);
    }

    destroy() {
        //console.log('destroying' + this.id);
        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.removeFromParent();
    }
}

export { Part, Lighting, Skybox }