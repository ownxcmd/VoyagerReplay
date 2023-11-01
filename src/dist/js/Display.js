import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import * as Roblox from './Roblox.js';

const nametagCache = {};

class TextLabel {
    constructor(Text, Parent) {
        console.log(`Creating nametag for ${Text}`);

        const textDiv = document.createElement('div');
        textDiv.className = 'label';
        textDiv.textContent = Text;
        textDiv.style.backgroundColor = 'transparent';
        textDiv.style.fontFamily = 'Roboto';
        textDiv.style.color = 'white';

        const textLabel = new CSS2DObject(textDiv);
        textLabel.position.set(0, 1, 0);
        //textLabel.center.set(0, 1);
        Parent.add(textLabel);
        //textLabel.layers.set(1);

        return textLabel;
    }

    destroy() {
        this.removeFromParent();
        this.element.remove();
    }
}

class Display {
    constructor(renderer, textRenderer) {
        this.renderer = renderer;
        this.textRenderer = textRenderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 3500000 );

        this.controls = new OrbitControls( this.camera, textRenderer.domElement );
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

            if (PartId in nametagCache) {
                nametagCache[PartId].destroy();
                delete nametagCache[PartId];
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

            if (PartInfo?.Tags?.Player && PartInfo.Shape == 'Head' && !nametagCache[PartId]) {
                const nametag = new TextLabel(PartInfo.Tags.Player, NewPart.mesh);
                //nametag.position.set(0, 1, 0);
                nametagCache[PartId] = nametag;
            }

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