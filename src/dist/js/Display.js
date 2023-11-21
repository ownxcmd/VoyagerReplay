import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ReplayHandler } from './ReplayHandler.js';
import * as Roblox from './Roblox.js';

class Display {
    constructor() {
        this.renderer = ReplayHandler.instance.renderer;
        this.textRenderer = ReplayHandler.instance.textRenderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3500000 );

        this.controls = new OrbitControls( this.camera, this.textRenderer.domElement );
        this.controls.enableDamping = false;

        this.lighting = new Roblox.Lighting();
        this.skybox = new Roblox.Skybox();

        this.dynamic = new Map();
        this.static = new Map();
        this.mapGroup = new THREE.Group();
        this.movingGroup = new THREE.Group();
    }

    initialize(captureData) {
        this.camera.layers.enableAll();

        for (const [PartId, PartInfo] of Object.entries(captureData.MapInfo)) {
            PartInfo.Id = PartId;
            this.static.set(PartId, new Roblox.Part(PartInfo, this.mapGroup));
        }

        //this.lighting.update();
        this.scene.add( this.mapGroup, this.movingGroup, this.lighting, this.skybox );
    
        this.camera.position.set(...captureData.CameraInfo.Position);
        this.camera.rotation.set(...captureData.CameraInfo.Rotation, 'XYZ');
        this.controls.update();
    }

    cleanMovingObjects(movingInfo) {
        this.dynamic.forEach((Part, PartId) => {
            if (PartId in movingInfo) {
                continue;
            }

            Part.destroy();
            this.dynamic.delete(PartId);
        });
    }

    updateMovingObjects(movingInfo) {
        for (const [PartId, PartInfo] of Object.entries(movingInfo)) {
            const existingPart = this.dynamic.get(PartId);
            if (existingPart) {
                existingPart.update(PartInfo);
                continue;
            };

            PartInfo.Id = PartId;
            this.dynamic.set(PartId, new Roblox.Part(PartInfo, this.movingGroup));
        }
        
        this.cleanMovingObjects(movingInfo);
    }

    togglePlayerNames() {
        this.camera.layers.toggle(1);
    }

    destroy() {
        this.dynamic.forEach((part) => Part.destroy());
        this.static.forEach((part) => Part.destroy());

        this.dynamic.clear();
        this.static.clear();

        this.lighting.destroy();
        this.skybox.destroy();

        this.scene.remove(...this.scene.children);
    }
}

export { Display }