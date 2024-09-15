import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import lights from './_modules/lights.js';

//import Stats from 'three/examples/jsm/libs/stats.module.js'

const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x111111 );

const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true

const threejs_canvas = document.getElementById("three");
threejs_canvas.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI/2;
controls.minPolarAngle = .01;
controls.minDistance = 4;
controls.maxDistance = 52;
controls.enablePan = true;
controls.listenToKeyEvents( window )

lights(scene); // Example module

const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555);
scene.add(gridHelper);

// Create a texture loader
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('path/to/your/texture.jpg'); // Replace with your texture path

// Create materials for each face with very light pastel colors and the same texture
const materials = [
  new THREE.MeshStandardMaterial({ color: 0xFFE5E5, map: texture }), // Very Light Pink
  new THREE.MeshStandardMaterial({ color: 0xFFF0E0, map: texture }), // Very Light Peach
  new THREE.MeshStandardMaterial({ color: 0xE5FFE5, map: texture }), // Very Light Mint
  new THREE.MeshStandardMaterial({ color: 0xE5F0FF, map: texture }), // Very Light Sky Blue
  new THREE.MeshStandardMaterial({ color: 0xF0E5FF, map: texture }), // Very Light Lavender
  new THREE.MeshStandardMaterial({ color: 0xFFE5F5, map: texture })  // Very Light Rose
];

// Increase the metalness and roughness to make the colors more visible
materials.forEach(material => {
  material.metalness = 0.1;
  material.roughness = 0.8;
});

// Reduce the size of individual cubes and the grid
const cubeSize = 0.6; // Reduced from 0.9
const gap = 0.07; // Reduced from 0.1
const gridSize = 4; // Keep this the same for a 4x4x4 structure

const cubeGroup = new THREE.Group();

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    for (let z = 0; z < gridSize; z++) {
      const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
      const cube = new THREE.Mesh(geometry, materials);
      cube.position.set(
        x * (cubeSize + gap) - (gridSize - 1) * (cubeSize + gap) / 2,
        y * (cubeSize + gap) - (gridSize - 1) * (cubeSize + gap) / 2,
        z * (cubeSize + gap) - (gridSize - 1) * (cubeSize + gap) / 2
      );
      cube.castShadow = true;
      cube.receiveShadow = true;
      cubeGroup.add(cube);
    }
  }
}

// Adjust the position to sit on top of the plane
cubeGroup.position.y = (gridSize * (cubeSize + gap)) / 2;

scene.add(cubeGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(cubeGroup.children);

  if (intersects.length > 0) {
    const selectedCube = intersects[0].object;
    // Randomly change the color of the clicked face
    const faceIndex = intersects[0].faceIndex;
    const materialIndex = Math.floor(faceIndex / 2);
    selectedCube.material[materialIndex].color.setHex(Math.random() * 0xffffff);
  }
}

window.addEventListener('click', onMouseClick, false);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});




