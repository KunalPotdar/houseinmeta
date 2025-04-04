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
		child.visible = false;
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
if (Object.keys(floorBoxes).length === 0) {
        console.warn("Model not loaded yet!");
        return;
    }

    // Hide all boxes
    Object.values(floorBoxes).forEach((box) => {
        box.visible = false;
        box.material.color.set(0x00ff00);
    });

    // Show and highlight selected floor
    if (floorBoxes[floorNumber]) {
        const box = floorBoxes[floorNumber];
        box.visible = true;
        box.material.color.set(0xff0000); // Highlight red
    }
}

// Reset highlight when mouse leaves
function resetHighlight() {
  Object.values(floorBoxes).forEach((box) => {
        box.visible = false;
        box.material.color.set(0x00ff00);
    });
}

window.showFloorOptions = function(floorNumber) {
  highlightFloor(floorNumber);
  const panel = document.getElementById("floorOptionsPanel");
  const label = document.getElementById("floorLabel");

  label.textContent = `Apartments on ${floorNumber}`;
  panel.style.display = "block";
};

window.hideFloorOptions = function () {
  document.getElementById("floorOptionsPanel").style.display = "none";
  resetHighlight();
};


window.highlightFloor = highlightFloor;
window.resetHighlight = resetHighlight;


// Responsive Canvas
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
