import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Get model from URL (either ?model= or #)
function getModelFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('model') || window.location.hash.replace('#', '') || 'project1';
}

let floorBoxes = {}; // Store references to each box

// Scene, Camera, Renderer setup
const scene = new THREE.Scene();
 scene.background = new THREE.Color(0xffffff); 
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 50;
// Create an orthographic camera
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2 ,  // left
  frustumSize * aspect / 2,   // right
  frustumSize / 2 ,            // top
  -frustumSize / 2  ,           // bottom
  1,                        // near
  1000                        // far
);

camera.position.set(-10,0,-20); // Higher and farther back
camera.lookAt(0, 0, 0);


const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("threejsCanvas") });
renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);

  // Controls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minZoom = 0.5;   // Minimum zoom (farthest view)
controls.maxZoom = 3.0;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 0.9;
controls.autoRotate = false;
controls.target = new THREE.Vector3(1, 1, 1);
controls.update();
camera.updateProjectionMatrix();  
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
		

// Lighting
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const dirLight = new THREE.DirectionalLight(0xffffff, 1); // Strong white light
dirLight.position.set(100, 200, 100); // Position in 3D space
dirLight.castShadow = true;           // Enable shadows
dirLight.shadow.mapSize.width = 1024; // Shadow quality
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 500;
scene.add(dirLight);
		

// Load Model
const loader = new GLTFLoader();
const modelName = getModelFromURL();  // Get model name from URL
//document.getElementById("model-name").textContent = `Loading: ${modelName}`;

// Dynamic path based on URL
const modelPath = `./client/${modelName}/model.glb`;

loader.load(
    modelPath,
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
        gltf.scene.traverse((child) => {
	    if (child.isMesh && child.name.includes("Box_Floor")) {
		let floorNumber = child.name.replace("Box_Floor", ""); // Extract floor number
		    console.log("Box_Floor found");
		floorBoxes[floorNumber] = child;
		child.material = new THREE.MeshBasicMaterial({
		    color: 0x00ff00, 
		    transparent: true,
		    opacity: 0.3 // Default semi-transparent
		});
	    }});
	    
        animate();
    },
    (error) => console.error('Error loading model:', error)
);

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
	 controls.update();
    renderer.render(scene, camera);
}

// Highlight the selected floor when hovering over a button
function highlightFloor(floorNumber) {
    Object.values(floors).forEach((floor) => floor.box.material.color.set(0x00ff00)); // Reset all to green
    if (floors[floorNumber]) {
        floors[floorNumber].box.material.color.set(0xff0000); // Change to red
    }
}

// Reset highlight when mouse leaves
function resetHighlight() {
    Object.values(floors).forEach((floor) => floor.box.material.color.set(0x00ff00)); // Reset all to green
}
// Responsive Canvas
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
