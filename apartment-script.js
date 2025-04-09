import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;

renderer.setSize(window.innerWidth, window.innerHeight);
//renderer.setSize(rightPanel.clientWidth, rightPanel.clientHeight);
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();


const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 100;

// Create an orthographic camera
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2,  // left
  frustumSize * aspect / 2,   // right
  frustumSize / 2,            // top
  -frustumSize / 2,           // bottom
  0.1,                        // near
  3000                        // far
);

// Position the camera above the scene to get an aerial view
camera.position.set(0, 5, 0); // X, Y, Z (Y is up)
camera.lookAt(0, 0, 0); // Point the camera at the center of the scene


//camera.lookAt(new THREE.Vector3(1.0,1.0,0));
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = true;
controls.minDistance = 5;
controls.maxDistance = 20;
controls.minPolarAngle = 1;
controls.maxPolarAngle = 0.9;
controls.autoRotate = false;
controls.target = new THREE.Vector3(0, 1, 0);
controls.update();


// LIGHTS

// Ambient Light 
const hlight = new THREE.AmbientLight (0xffffff,0.9);
scene.add(hlight);

// Directional Light 
const directionalLight = new THREE.DirectionalLight(0xffffff,1.5);
directionalLight.position.set(100,1,7.5);
directionalLight.target.position.set(0,0,0);
directionalLight.castShadow = true;
scene.add(directionalLight);
scene.add(directionalLight.target);


const light = new THREE.DirectionalLight(0xffffff,1.5);
light.position.set(10, 10, 110);
scene.add(light);
const light2 = new THREE.DirectionalLight(0xffffff,1.5);
light2.position.set(1,1,-10);
scene.add(light2);
const light3 = new THREE.DirectionalLight(0xffffff,1.5);
light3.position.set(-100,1,0);
scene.add(light3);
const light4 = new THREE.PointLight(0xc4c4c4,1.0);
light4.position.set(-500,300,500);
scene.add(light4);

const loader = new GLTFLoader().setPath('client/project2/apts');
loader.load('1.glb', (gltf) => {
  console.log('Apartment model');
  const mesh = gltf.scene;
  scene.add(mesh);
  animate();
  document.getElementById('progress-container').style.display = 'none';
}, (xhr) => {
  console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
}, (error) => {
  console.error(error);
});


function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
 }


