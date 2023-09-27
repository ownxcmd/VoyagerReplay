import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RobloxPart } from './RobloxPart.js';

const GetLight = (Position) => {
    const Light = new THREE.DirectionalLight( 0xffffff, 1);
    Light.position.set(...Position);
    Light.castShadow = true;
    Light.shadow.camera.top = Light.shadow.camera.right = 1000;
    Light.shadow.camera.bottom = Light.shadow.camera.left = -1000;
    Light.shadow.mapSize.width = 8192;
    Light.shadow.mapSize.height = 8192;
    Light.shadow.camera.near = 0.1;
    Light.shadow.camera.far = 2000000;

    return Light
}

const GetSkybox = () => {
    const skyboxFileNames = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
    const skyboxMaterialArray = skyboxFileNames.map(texture => {
        //const textureLoader = new THREE.TextureLoader();
        const material = new THREE.TextureLoader().load(`../texture/skybox/${texture}.png`);

        return new THREE.MeshBasicMaterial({ map: material, side: THREE.BackSide });
    });

    const Skybox = new THREE.Mesh( new THREE.BoxGeometry( 1000000, 1000000, 1000000 ), skyboxMaterialArray );

    return Skybox;
}

class Display {
    static callbacks = [];

    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3500000 );

        this.controls = new OrbitControls( this.camera, renderer.domElement );
        this.controls.enableDamping = false;

        this.disposables = [];
        this.mapGroup = new THREE.Group();
        this.movingGroup = new THREE.Group();
    }

    async initialize(captureData) {
        for (const [PartId, PartInfo] of Object.entries(captureData.MapInfo)) {
            const NewPart = new RobloxPart(this.mapGroup, {
                position: PartInfo.Position,
                rotation: PartInfo.Rotation,
                size: PartInfo.Size,
                shape: PartInfo.Shape,
                color: PartInfo.Color,
                transparency: PartInfo.Transparency,
                tags: PartInfo.Tags,
                id: PartId,
            });
    
            NewPart.mesh.receiveShadow = true;
            NewPart.mesh.castShadow = true;
        }
    
        const AmbientLight = new THREE.AmbientLight( 0xffffff, 0.25);
    
        const Light = GetLight(captureData.LightingInfo);
        const Skybox = GetSkybox();

        this.scene.add( this.mapGroup, this.movingGroup, AmbientLight, Light, Skybox );
    
        this.camera.position.set(...captureData.CameraInfo.Position);
        this.camera.rotation.set(...captureData.CameraInfo.Rotation, 'XYZ');
        this.controls.update();
    }

    cleanMovingObjects(movingInfo) {
        for (const [PartId, Part] of Object.entries(this.disposables)) {
            if (PartId in movingInfo) {
                continue;
            }

            Part.destroy();
            delete this.disposables[PartId];
        }
    }

    updateMovingObjects(movingInfo) {
        for (const [PartId, PartInfo] of Object.entries(movingInfo)) {
            const existingPart = this.disposables[PartId];
            if (existingPart) {
                existingPart.update(PartInfo);
                continue;
            };
    
            console.log(PartInfo.Shape);
            const NewPart = new RobloxPart(this.movingGroup, {
                position: PartInfo.Position,
                rotation: PartInfo.Rotation,
                size: PartInfo.Size,
                shape: PartInfo.Shape,
                color: PartInfo.Color,
                transparency: PartInfo.Transparency,
                tags: PartInfo.Tags,
                id: PartId,
            });

            this.disposables[PartId] = NewPart;
        }
        
        this.cleanMovingObjects(movingInfo);
    }

    async destroy() {
        for (const [PartId, Part] of Object.entries(this.disposables)) {
            Part.destroy();
            delete this.disposables[PartId];
        }
    }
}

export { Display }