import * as THREE from 'three';
import { GetGeometry } from './CustomGeometry.js';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

class Skybox extends THREE.Mesh {
    constructor(Size = 1000000) {
        super(new THREE.BoxGeometry( Size, Size, Size ));
        const skyboxFileNames = ['ft', 'bk', 'up', 'dn', 'rt', 'lf'];
        const skyboxMaterialArray = skyboxFileNames.map(texture => {
            //const textureLoader = new THREE.TextureLoader();
            const material = new THREE.TextureLoader().load(`../texture/skybox/${texture}.png`);
    
            return new THREE.MeshBasicMaterial({ map: material, side: THREE.BackSide });
        });

        this.material = skyboxMaterialArray;
    }

    destroy() {
        this.material.dispose();
    }
}

class Lighting extends THREE.Group {
    constructor() {
        super();

        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.sun.castShadow = true;
        this.sun.shadow.camera.top = this.sun.shadow.camera.right = 1000;
        this.sun.shadow.camera.bottom = this.sun.shadow.camera.left = -1000;
        this.sun.shadow.mapSize.width = 8192;
        this.sun.shadow.mapSize.height = 8192;
        this.sun.shadow.camera.near = 0.1;
        this.sun.shadow.camera.far = 2000000;
        
        this.sun.position.set(0, 100, 0);
        

        this.ambient = new THREE.AmbientLight(0xffffff, 0.25);

        this.add(this.sun, this.ambient);
    }

    destroy() {
        this.sun.dispose();
        this.ambient.dispose();

        this.removeFromParent();
    }
}

class TextLabel extends CSS2DObject {
    constructor(Text, Parent) {
        const textDiv = document.createElement('div');
        textDiv.className = 'label';
        textDiv.textContent = Text;
        textDiv.style.backgroundColor = 'transparent';
        textDiv.style.fontFamily = 'Roboto';
        textDiv.style.color = 'white';

        super(textDiv);
        console.log(`Creating nametag for ${Text}`);

        this.layers.set(1);
        this.position.set(0, 1, 0);
        Parent.add(this);
    }

    destroy() {
        this.removeFromParent();
        this.element.remove();
    }
}

class Part {
    constructor(PartInfo, Group) {
        const Geometry = GetGeometry(PartInfo.Shape, PartInfo.Size);
        const Material = new THREE.MeshPhysicalMaterial( { 
            color: PartInfo.Color, 
            roughness: 0.5,
            opacity: PartInfo.Transparency > 0 ? 1 - PartInfo.Transparency : 1,
            transparent: PartInfo.Transparency > 0,
        } );

        this.tags = PartInfo.Tags;
        this.id = PartInfo.Id;

        this.mesh = new THREE.Mesh( Geometry, Material );

        this.mesh.position.set(...PartInfo.Position);
        this.mesh.rotation.set(...PartInfo.Rotation, 'YXZ');
        this.mesh.scale.set(...PartInfo.Size);

        if (PartInfo.Tags?.Player && PartInfo.Shape == 'Head') {
            this.label = new TextLabel(PartInfo.Tags.Player, this.mesh);
        }

        Group.add( this.mesh );
    }

    update(PartInfo) {
        //console.log('update called');
        this.mesh.position.set(...PartInfo.Position);
        this.mesh.rotation.set(...PartInfo.Rotation, 'YXZ');

        this.tags = PartInfo.Tags;
        //this.mesh.material.color.set(PartInfo.Color);
    }

    destroy() {
        console.log('destroying' + this.id);
        this.label?.destroy();

        this.mesh.geometry.dispose();
        this.mesh.material.dispose();
        this.mesh.removeFromParent();
    }
}

export { Part, Lighting, Skybox, TextLabel }