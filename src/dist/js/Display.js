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

        this.disposables = [];
        this.mapGroup = new THREE.Group();
        this.movingGroup = new THREE.Group();
    }

    initialize(captureData) {
        this.camera.layers.enableAll();

        for (const [PartId, PartInfo] of Object.entries(captureData.MapInfo)) {
            PartInfo.Id = PartId;
            const NewPart = new Roblox.Part(PartInfo, this.mapGroup);
        }

        //this.lighting.update();
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

            PartInfo.Id = PartId;
            const NewPart = new Roblox.Part(PartInfo, this.movingGroup);

            this.disposables[PartId] = NewPart;
        }
        
        this.cleanMovingObjects(movingInfo);
    }

    togglePlayerNames() {
        this.camera.layers.toggle(1);
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