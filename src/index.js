import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import lights from './_modules/lights.js';
import { Raycaster } from 'three';

// Error handling
window.addEventListener('error', function(event) {
    console.error('Caught error:', event.error);
});

// Global variables
let scene, camera, renderer, controls, cubeGroup;
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let isPlayerOneTurn = true;
let hoveredCube = null;

const cubeSize = 0.2;
const gap = 0.05;
const gridSize = 4;
const totalSize = gridSize * (cubeSize + gap) - gap;

// Materials
const material_1 = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const material_blue = new THREE.MeshLambertMaterial({ color: 0x4444ff });
const material_red = new THREE.MeshLambertMaterial({ color: 0xff4444 });
const material_hover = new THREE.MeshLambertMaterial({ color: 0x888888 });

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.01, 1000);
    camera.position.set(3, 3, 5);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;

    const threejs_canvas = document.getElementById("three");
    threejs_canvas.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 0.5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI;
    controls.minPolarAngle = 0;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.enablePan = true;
    controls.listenToKeyEvents(window);

    lights(scene);

    createGroundPlane();
    createGridHelper();
    createCubes();

    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);
    window.addEventListener('resize', onWindowResize, false);
}

function createGroundPlane() {
    const ground_plane = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({
            color: 0xaaaaaa,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        })
    );
    ground_plane.receiveShadow = true;
    ground_plane.rotateX(-Math.PI / 2);
    ground_plane.position.y = -0.05;
    scene.add(ground_plane);
}

function createGridHelper() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x555555);
    scene.add(gridHelper);
}

function getCubeCoordinate(x, y, z) {
    const faces = {
        front: [ // z = 0
            ['1D', '2D', '3D', '4D'],
            ['1C', '3C', '2C', '4C'],
            ['1B', '2B', '3B', '4B'],
            ['1A', '2A', '3A', '4A']
        ],
        back: [ // z = 3
            ['13D', '14D', '15D', '16D'],
            ['13C', '14C', '15C', '16C'],
            ['13B', '14B', '15B', '16B'],
            ['13A', '14A', '15A', '16A']
        ],
        left: [ // x = 0
            ['1A', '5D', '9D', '13A'],
            ['1C', '5C', '9C', '13B'],
            ['1B', '5B', '9B', '13C'],
            ['FF', '5A', '9A', '13D']
        ],
        right: [ // x = 3
            ['16A', '12D', '8D', '4A'],
            ['16B', '12C', '8C', '4B'],
            ['16C', '12B', '8B', '4C'],
            ['16D', '12A', '8A', '4D']
        ],
        top: [ // y = 3
            ['1A', 'CC', 'XX', '4A'],
            ['5A', '6A', '10A', '8A'],
            ['9A', '7A', '11A', '12A'],
            ['13A', '14A', '15A', '16A']
        ],
        bottom: [ // y = 0
            ['13D', '14D', '15D', '16D'],
            ['AD', '10D', '6D', '12D'],
            ['5D', '11D', '7D', '8D'],
            ['1D', '2D', '3D', '4A']
        ]
    };

    if (z === 0) return faces.front[y][x];
    if (z === 3) return faces.back[y][x];
    if (x === 0) return faces.left[y][z];
    if (x === 3) return faces.right[y][3 - z];
    if (y === 3) return faces.top[x][z];
    if (y === 0) return faces.bottom[x][3 - z];

    // For inner cubes that are not on any face
    return null;
}

function createTextTexture(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    context.fillStyle = 'rgba(255, 255, 255, 0)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = '24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    return new THREE.CanvasTexture(canvas);
}

function createCubes() {
    cubeGroup = new THREE.Group();

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                if (x === 0 || x === gridSize - 1 ||
                    y === 0 || y === gridSize - 1 ||
                    z === 0 || z === gridSize - 1) {
                    const coordinate = getCubeCoordinate(x, y, z);
                    const textTexture = createTextTexture(coordinate);

                    const cubeMaterial = new THREE.MeshLambertMaterial({
                        color: 0xaaaaaa,
                        transparent: true,
                        opacity: 1
                    });

                    const smallCube = new THREE.Mesh(new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize), cubeMaterial);
                    smallCube.castShadow = true;
                    smallCube.position.set(
                        x * (cubeSize + gap) - totalSize / 2 + cubeSize / 2,
                        y * (cubeSize + gap) + cubeSize / 2,
                        z * (cubeSize + gap) - totalSize / 2 + cubeSize / 2
                    );
                    smallCube.userData.coordinate = coordinate;

                    // Create label planes for each visible face
                    const labelGeometry = new THREE.PlaneGeometry(cubeSize * 0.9, cubeSize * 0.9);
                    const labelMaterial = new THREE.MeshBasicMaterial({
                        map: textTexture,
                        transparent: true,
                        opacity: 0, // was 1, set to zero to reval later
                        side: THREE.DoubleSide
                    });
                    const labelOffsetFactor = 0.501;

                    const labelPositions = [
                        { position: new THREE.Vector3(labelOffsetFactor * cubeSize, 0, 0), rotation: [0, Math.PI / 2, 0] },
                        { position: new THREE.Vector3(-labelOffsetFactor * cubeSize, 0, 0), rotation: [0, -Math.PI / 2, 0] },
                        { position: new THREE.Vector3(0, labelOffsetFactor * cubeSize, 0), rotation: [-Math.PI / 2, 0, 0] },
                        { position: new THREE.Vector3(0, -labelOffsetFactor * cubeSize, 0), rotation: [Math.PI / 2, 0, 0] },
                        { position: new THREE.Vector3(0, 0, labelOffsetFactor * cubeSize), rotation: [0, 0, 0] },
                        { position: new THREE.Vector3(0, 0, -labelOffsetFactor * cubeSize), rotation: [0, Math.PI, 0] }
                    ];

                    labelPositions.forEach(({position, rotation}) => {
                        const labelPlane = new THREE.Mesh(labelGeometry, labelMaterial);
                        labelPlane.position.copy(position);
                        labelPlane.rotation.setFromVector3(new THREE.Vector3(...rotation));
                        labelPlane.userData.isLabel = true; // Add this line
                        smallCube.add(labelPlane);
                    });

                    cubeGroup.add(smallCube);
                }
            }
        }
    }

    cubeGroup.position.y = 0.5;
    scene.add(cubeGroup);
}

function applyHoverEffect(cube) {
    if (cube.material) {
        cube.material.color.setHex(0x888888);
    }
    cube.scale.set(1.1, 1.1, 1.1);
    
    // Set label opacity to 1 on hover
    cube.children.forEach(child => {
        if (child.userData.isLabel) {
            child.material.opacity = 1; // Show label
        }
    });
}

function resetHoverEffect(cube) {
    if (cube.material) {
        cube.material.color.setHex(0xaaaaaa);
    }
    cube.scale.set(1, 1, 1);
    
    // Set label opacity back to 0 when not hovering
    cube.children.forEach(child => {
        if (child.userData.isLabel) {
            child.material.opacity = 0; // Hide label
        }
    });
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubeGroup.children, true)
        .filter(intersect => !intersect.object.userData.isLabel);

    if (intersects.length > 0) {
        const intersectedCube = intersects[0].object;
        if (intersectedCube !== hoveredCube) {
            if (hoveredCube) {
                resetHoverEffect(hoveredCube);
            }
            if (!intersectedCube.userData.selected) {
                hoveredCube = intersectedCube;
                applyHoverEffect(hoveredCube);
            }
        }
    } else if (hoveredCube) {
        resetHoverEffect(hoveredCube);
        hoveredCube = null;
    }
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(cubeGroup.children, true)
        .filter(intersect => !intersect.object.userData.isLabel);

    if (intersects.length > 0) {
        const cube = intersects[0].object;
        if (!cube.userData.selected) {
            const newColor = isPlayerOneTurn ? 0x4444ff : 0xff4444;
            if (cube.material) {
                cube.material.color.setHex(newColor);
            }
            cube.userData.selected = true;
            isPlayerOneTurn = !isPlayerOneTurn;

            // Keep label visible on click
            cube.children.forEach(child => {
                if (child.userData.isLabel) {
                    child.material.opacity = 1; // Show label
                }
            });

            if (hoveredCube === cube) {
                hoveredCube = null;
            }
        }
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Main execution
try {
    init();
    animate();
} catch (error) {
    console.error('Error in main code:', error);
}
