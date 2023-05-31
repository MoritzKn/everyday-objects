import * as THREE from "three";

// import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

let camera, scene, renderer, controls;

let object = new THREE.Group();

init();
animate();

function initRenderer() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(6, 4, 8);
  const distance = 18;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = distance;
  controls.maxDistance = distance;
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  // controls.enableRotate = false;
  // controls.autoRotate = true;
  controls.update();

  const transform = new TransformControls(camera, renderer.domElement);
  transform.attach(object);
  transform.setMode("rotate");
  transform.visible = false;

  transform.addEventListener("dragging-changed", function (event) {
    transform.axis = "XYZE";
    controls.enabled = !event.value;

    // transform.visible = event.value;

    // if (event.value) {
    // controls.enabled = true;
    //   clearTimeout(tid);
    // } else {
    //   tid = setTimeout(() => (transform.visible = false), 250);
    // }
  });
  scene.add(transform);
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#E27266");

  // const environment = new RoomEnvironment();
  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // scene.environment = pmremGenerator.fromScene(environment).texture;
  // environment.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 15, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512 * 2;
  dirLight.shadow.mapSize.height = 512 * 2;
  dirLight.shadow.bias = -0.00006;
  dirLight.shadow.normalBias = 0.01;

  scene.add(dirLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 1, 1),
    new THREE.MeshPhongMaterial({
      color: "#C95A54",
      // specular: "#C95A54",
      side: THREE.DoubleSide,
      shininess: 0,
      reflectivity: 0,
    })
  );

  ground.rotation.x = -Math.PI / 2; // rotates X/Y to X/Z
  ground.position.y = -3.9;
  ground.receiveShadow = true;
  scene.add(ground);

  const test = new THREE.Mesh(
    new THREE.SphereGeometry(1),
    new THREE.MeshPhongMaterial({
      color: "#A83A21",
      roughness: 0.75,
      shininess: 0,
      reflectivity: 0,
    })
  );
  test.position.y = 3;
  test.castShadow = true;
  test.receiveShadow = true;
  scene.add(test);

  scene.add(object);
}

function initModel() {
  const ktx2Loader = new KTX2Loader()
    .setTranscoderPath("https://threejs.org/examples/jsm/libs/basis/")
    .detectSupport(renderer);

  const loader = new GLTFLoader();
  loader.setKTX2Loader(ktx2Loader);
  loader.setMeshoptDecoder(MeshoptDecoder);

  const url = new URL("./models/Lighter.glb", import.meta.url).href;
  loader.load(url, function (gltf) {
    gltf.scene.traverse((mesh) => {
      if (mesh.material) {
        // mesh.material = new THREE.MeshPhongMaterial({
        //   color: mesh.material.color,
        // });
        mesh.material.roughness = 0.75;
        // mesh.material.shadowSide = THREE.BackSide;
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    object.add(gltf.scene);

    window.object = object;
  });
}

function init() {
  initRenderer();
  initScene();
  initModel();
  initCamera();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  render();
}

function render() {
  renderer.render(scene, camera);
}
