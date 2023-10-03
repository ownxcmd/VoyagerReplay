import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as Roblox from './Roblox.js';

class Display {
    constructor(renderer) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3500000 );

        this.controls = new OrbitControls( this.camera, renderer.domElement );
        this.controls.enableDamping = false;

        this.lighting = new Roblox.Lighting();
        this.skybox = new Roblox.Skybox();

        this.disposables = [];
        this.mapGroup = new THREE.Group();
        this.movingGroup = new THREE.Group();
    }

    initialize(captureData) {
        for (const [PartId, PartInfo] of Object.entries(captureData.MapInfo)) {
            const NewPart = new Roblox.Part(this.mapGroup, {
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

        this.lighting.update(captureData.LightingInfo);
        this.scene.add( this.mapGroup, this.movingGroup, this.lighting, this.skybox );
    
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
            const NewPart = new Roblox.Part(this.movingGroup, {
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

    destroy() {
        for (const [PartId, Part] of Object.entries(this.disposables)) {
            Part.destroy();
            delete this.disposables[PartId];
        }

        this.scene.remove(...this.scene.children);
    }
}

export { Display }