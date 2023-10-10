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

function GetShape(Shape, Size) {
  switch(Shape) {
    case 'Block':
      return new THREE.BoxGeometry(...Size);
    case 'Ball':
      return new THREE.SphereGeometry(Size[0]/2);
    case 'Cylinder':
      let Dominant = Math.min(Size[1], Size[2]);
      return new THREE.CylinderGeometry(Dominant/2, Dominant/2, Size[0], 16).rotateZ(Math.PI/2);
    case 'Wedge':
      // 15, 5, 10
      const Wedge = new PrismGeometry([
        new THREE.Vector2(-Size[2]/2, -Size[1]/2),
        new THREE.Vector2(Size[2]/2, -Size[1]/2),
        new THREE.Vector2(Size[2]/2, Size[1]/2),
      ], Size[0]); // make this negative and see what happens
      Wedge.rotateY(-Math.PI/2);
      Wedge.center();
      
      // Wedge.translate(Size[0]/2, 0, 0);
      return Wedge;
  }
}

function GetPlayerPart(Shape, Size) {
  switch(Shape) {
    case 'Head':
      return HeadGeometry.clone().center().scale(1.25,1.25,1.25);
    case 'Torso':
      return LimbUnitGeometry.clone().center().scale(2, 1, 1);
    case 'LeftArm':
    case 'RightArm':
    case 'LeftLeg':
    case 'RightLeg':
      return LimbUnitGeometry.clone().center();
  }
}

function GetGeometry(Shape, Size) {
  return GetShape(Shape, Size) || GetPlayerPart(Shape, Size) || new THREE.BoxGeometry(...Size);;
}

export { GetGeometry }