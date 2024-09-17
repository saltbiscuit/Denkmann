import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import lights from './_modules/lights.js';
import { Raycaster } from 'three';

//import Stats from 'three/examples/jsm/libs/stats.module.js'



const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x111111 );
lights(scene);

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(3, 3, 5);


const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.enabled = true


const threejs_canvas = document.getElementById("three");
threejs_canvas.appendChild(renderer.domElement);


// Modify the OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.target = new THREE.Vector3(0, 0.5, 0); // Adjust target to center of cube group
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI; // Allow full rotation
controls.minPolarAngle = 0; // Allow camera to go below the plane
controls.minDistance = 1; // Allow closer zoom
controls.maxDistance = 20;
controls.enablePan = true;
controls.listenToKeyEvents(window);

// ... (cube creation code remains the same)

// Modify the ground plane
const ground_plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide // Make the plane visible from both sides
    })
);
ground_plane.receiveShadow = true;
ground_plane.rotateX(-Math.PI / 2);
ground_plane.position.y = -0.05; // Lower it a bit more
scene.add(ground_plane);

// ... (rest of the code remains the same)

const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555)
scene.add(gridHelper)


const material_1 = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const material_blue = new THREE.MeshLambertMaterial({ color: 0x4444ff });
const material_red = new THREE.MeshLambertMaterial({ color: 0xff4444 });
const material_hover = new THREE.MeshLambertMaterial({ color: 0x888888 }); // Darker color for hover

// Remove the single cube
// const cube = new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1 ), material_1 );
// cube.castShadow = true;
// cube.position.y = 1;
// scene.add( cube );

// Create a 4x4x4 array of small cubes, but only the outer layer
const cubeSize = 0.2;
const gap = 0.05;
const gridSize = 4;
const totalSize = gridSize * (cubeSize + gap) - gap;

const cubeGroup = new THREE.Group();

for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
            // Only create cubes if they're on the outer layer
            if (x === 0 || x === gridSize - 1 || 
                y === 0 || y === gridSize - 1 || 
                z === 0 || z === gridSize - 1) {
                const smallCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), material_1);
                smallCube.castShadow = true;
                smallCube.position.set(
                    x * (cubeSize + gap) - totalSize / 2 + cubeSize / 2,
                    y * (cubeSize + gap) + cubeSize / 2,
                    z * (cubeSize + gap) - totalSize / 2 + cubeSize / 2
                );
                cubeGroup.add(smallCube);
            }
        }
    }
}

cubeGroup.position.y = 0.5;
scene.add(cubeGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let isPlayerOneTurn = true; // true for Player 1 (blue), false for Player 2 (red)
let hoveredCube = null;

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubeGroup.children);

    if (intersects.length > 0) {
        const intersectedCube = intersects[0].object;
        if (intersectedCube !== hoveredCube) {
            if (hoveredCube) resetHoverEffect(hoveredCube);
            if (intersectedCube.material === material_1) {
                hoveredCube = intersectedCube;
                applyHoverEffect(hoveredCube);
            }
        }
    } else if (hoveredCube) {
        resetHoverEffect(hoveredCube);
        hoveredCube = null;
    }
}

function applyHoverEffect(cube) {
    cube.material = material_hover;
    cube.scale.set(1.1, 1.1, 1.1);
}

function resetHoverEffect(cube) {
    if (cube.material === material_hover) {
        cube.material = material_1;
    }
    cube.scale.set(1, 1, 1);
}

function onMouseClick(event) {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(cubeGroup.children);

    if (intersects.length > 0) {
        const cube = intersects[0].object;
        if (cube.material === material_1 || cube.material === material_hover) {
            if (isPlayerOneTurn) {
                cube.material = material_blue;
            } else {
                cube.material = material_red;
            }
            cube.scale.set(1, 1, 1); // Reset scale when selected
            isPlayerOneTurn = !isPlayerOneTurn; // Switch turns
            hoveredCube = null;
        }
    }
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('click', onMouseClick, false);

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // This line is crucial for smooth orbiting
    renderer.render(scene, camera);
    //stats.update()
}

animate();





window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
})





