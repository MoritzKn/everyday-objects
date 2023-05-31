import * as THREE from "three";

// import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

let camera, scene, renderer, controls, object;
let mousePos = new THREE.Vector2(0, 0);

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
  controls.update();
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#C79492");

  // const environment = new RoomEnvironment();
  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // scene.environment = pmremGenerator.fromScene(environment).texture;
  // environment.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.right = 6;
  dirLight.shadow.camera.left = -6;
  dirLight.shadow.camera.top = 6;
  dirLight.shadow.camera.bottom = -6;

  dirLight.shadow.mapSize.width = 1024 * 1;
  dirLight.shadow.mapSize.height = 1024 * 1;
  scene.add(dirLight);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 1, 1),
    new THREE.ShadowMaterial({
      color: 0x000000,
      opacity: 0.25,
    })
  );

  ground.rotation.x = -Math.PI / 2; // rotates X/Y to X/Z
  ground.position.y = -4;
  ground.receiveShadow = true;
  scene.add(ground);

  const ground2 = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 1, 1),
    new THREE.MeshStandardMaterial({
      color: "#C95A54",
      roughness: 1,
      shadowSide: THREE.DoubleSide,
      side: THREE.DoubleSide,
    })
  );

  ground2.rotation.x = -Math.PI / 2; // rotates X/Y to X/Z
  ground2.position.y = -4;
  ground2.receiveShadow = true;
  scene.add(ground2);

  // const test = new THREE.Mesh(
  //   new THREE.BoxGeometry(2, 2, 2),
  //   new THREE.MeshStandardMaterial({
  //     color: "#BC413A",
  //     metalness: 0.1,
  //     roughness: 0.75,
  //     clipShadows: true,
  //     shadowSide: THREE.DoubleSide,
  //   })
  // );
  // test.position.y = 3;
  // test.castShadow = true;
  // scene.add(test);
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
    object = new THREE.Group();

    // const material = new THREE.MeshStandardMaterial({
    //   color: "#C9B403",
    //   metalness: 0.1,
    //   roughness: 0.75,
    //   clipShadows: true,
    //   shadowSide: THREE.DoubleSide,
    // });

    gltf.scene.traverse((mesh) => {
      if (mesh.material) {
        mesh.material.roughness = 0.75;
      }
      mesh.castShadow = true;
    });
    object.add(gltf.scene);

    scene.add(object);
    window.object = object;
  });
}

function init() {
  initRenderer();
  initScene();
  initModel();
  initCamera();

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("mousemove", onMouseMove);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
  mousePos = new THREE.Vector2(event.clientX, event.clientY);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  object.rotation.x =
    -Math.PI + Math.PI * 2 * (mousePos.y / window.innerHeight);
  object.rotation.y = Math.PI * 2 * (mousePos.x / window.innerWidth);

  render();
}

function render() {
  renderer.render(scene, camera);
}
