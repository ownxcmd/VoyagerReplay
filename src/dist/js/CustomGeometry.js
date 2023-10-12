import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
// import fs from 'fs';

// const objMeshes = fs.readdirSync('./mesh').filter(file => file.endsWith('.obj'));

class PrismGeometry extends THREE.ExtrudeGeometry {
  constructor(vertices, height) {
    super(new THREE.Shape(vertices), {depth: height, bevelEnabled: false});
  }
}

const Loader = new OBJLoader();
const Head = await Loader.loadAsync('../mesh/Head.obj');
const Limb = await Loader.loadAsync('../mesh/Limb.obj');
const LimbUnit = await Loader.loadAsync('../mesh/LimbUnit.obj');

const HeadGeometry = Head.children[0].geometry;
const LimbGeometry = Limb.children[0].geometry;
const LimbUnitGeometry = LimbUnit.children[0].geometry;

function GetPlayerPart(Shape, Size) {
  switch(Shape) {
    case 'Head':
      return HeadGeometry.clone().center().scale(0.625,1.25,1.25);
    case 'Torso':
      return LimbUnitGeometry.clone().center().scale(1, 0.5, 1);
    case 'LeftArm':
    case 'RightArm':
    case 'LeftLeg':
    case 'RightLeg':
      return LimbUnitGeometry.clone().center().scale(1, 0.5, 1);
    default:
      return new THREE.BoxGeometry(1,1,1);
  }
}

function GetGeometry(Shape, Size) {
  switch(Shape) {
    case 'Block':
      return new THREE.BoxGeometry(1,1,1);
    case 'Ball':
      return new THREE.SphereGeometry(0.5);
    case 'Cylinder':
      let Dominant = Math.min(Size[1], Size[2]);
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 16).rotateZ(Math.PI/2);
    case 'Wedge':
      const Wedge = new PrismGeometry([
        new THREE.Vector2(-0.5, -0.5),
        new THREE.Vector2(0.5, -0.5),
        new THREE.Vector2(0.5, 0.5),
      ], 1); // make this negative and see what happens
      Wedge.rotateY(-Math.PI/2);
      Wedge.center();
      return Wedge;
    default:
      return GetPlayerPart(Shape, Size);
  }
}

export { GetGeometry }