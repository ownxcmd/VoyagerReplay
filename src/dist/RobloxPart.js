import * as THREE from 'three';
import { GetGeometry } from './CustomGeometry.js';

const addVector = (a, b) => a.map((x, i) => x + b[i]);

class RobloxPart {
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
            if (typeof value === RobloxPart.ValidSettings[key]) {
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

export { RobloxPart }