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
  controls.enableDamping = false;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI * 0.582;
  // controls.enableRotate = false;
  controls.autoRotate = true;
  controls.update();

  const transform = new TransformControls(camera, renderer.domElement);
  transform.attach(object);
  transform.setMode("rotate");
  transform.visible = false;

  transform.addEventListener("dragging-changed", function (event) {
    if (transform.axis !== "XYZE" || transform.axis !== "E") {
      transform.axis = "XYZE";
    }
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
  scene.background = new THREE.Color("#db6a60");

  // const environment = new RoomEnvironment();
  // const pmremGenerator = new THREE.PMREMGenerator(renderer);
  // scene.environment = pmremGenerator.fromScene(environment).texture;
  // environment.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 15, 6);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 512 * 2;
  dirLight.shadow.mapSize.height = 512 * 2;
  dirLight.shadow.bias = -0.00006;
  dirLight.shadow.normalBias = 0.01;
  scene.add(dirLight);

  const dirLigh2 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLigh2.position.set(6, 4, -5);
  dirLigh2.castShadow = true;
  dirLigh2.shadow.bias = -0.00006;
  dirLigh2.shadow.normalBias = 0.01;
  scene.add(dirLigh2);

  const dirLigh3 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLigh3.position.set(-5, 4, -6);
  dirLigh3.castShadow = true;
  dirLigh3.shadow.bias = -0.00006;
  dirLigh3.shadow.normalBias = 0.01;
  scene.add(dirLigh3);

  const dirLigh4 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLigh4.position.set(-5, 4, 5);
  dirLigh4.castShadow = true;
  dirLigh4.shadow.bias = -0.00006;
  dirLigh4.shadow.normalBias = 0.01;
  scene.add(dirLigh4);

  // Make the ground lighter in the center
  const light = new THREE.PointLight("#dddddd", 1, 30);
  light.position.set(0, 10, 0);
  scene.add(light);

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
  ground.position.y = -4.8;
  ground.receiveShadow = true;
  scene.add(ground);

  // const test = new THREE.Mesh(
  //   new THREE.SphereGeometry(1),
  //   new THREE.MeshPhongMaterial({
  //     color: "#A83A21",
  //     roughness: 0.75,
  //     shininess: 0,
  //     reflectivity: 0,
  //   })
  // );
  // test.position.y = 3;
  // test.castShadow = true;
  // test.receiveShadow = true;
  // scene.add(test);

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
