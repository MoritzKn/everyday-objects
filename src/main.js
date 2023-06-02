import * as THREE from "three";

// import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

let camera,
  scene,
  renderer,
  orbit,
  transform,
  screenDiagonal = 0;

const INPUT = {
  start: null,
  last: null,
  current: null,
  history: [],
  speed: 0,
  isDown: false,
  distance: 0,
};

const raycaster = new THREE.Raycaster();

const object = new THREE.Group();
object.position.y = -1;

const SOUND = {
  flame: {
    name: "flame",
    start: 0,
    volume: 1,
    audio: new Audio(new URL("./sounds/flame.m4a", import.meta.url)),
  },
  gasStart: {
    name: "gasStart",
    start: 840,
    audio: new Audio(new URL("./sounds/gasStart.m4a", import.meta.url)),
  },
  gasStop: {
    name: "gasStop",
    start: 750,
    volume: 1,
    audio: new Audio(new URL("./sounds/gasStop.m4a", import.meta.url)),
  },
  gasRunning: {
    name: "gasRunning",
    start: 0.9,
    audio: new Audio(new URL("./sounds/gasRunning.m4a", import.meta.url)),
  },
  lightUp: {
    name: "lightUp",
    start: 200,
    volume: 0.2,
    audio: new Audio(new URL("./sounds/lightUp.m4a", import.meta.url)),
  },
  moveLight: {
    name: "moveLight",
    start: 400,
    audio: new Audio(new URL("./sounds/moveLight.m4a", import.meta.url)),
  },
  moveShake: {
    name: "moveShake",
    start: 1040,
    audio: new Audio(new URL("./sounds/moveShake.m4a", import.meta.url)),
  },
  moveShake2: {
    name: "moveShake2",
    start: 1050,
    audio: new Audio(new URL("./sounds/moveShake2.m4a", import.meta.url)),
  },
  moveSimple: {
    name: "moveSimple",
    start: 1040,
    audio: new Audio(new URL("./sounds/moveSimple.m4a", import.meta.url)),
  },
  moveTwice: {
    name: "moveTwice",
    start: 440,
    audio: new Audio(new URL("./sounds/moveTwice.m4a", import.meta.url)),
  },
  wheelRotate: {
    name: "wheelRotate",
    start: 380,
    volume: 0.8,
    audio: new Audio(new URL("./sounds/wheelRotate.m4a", import.meta.url)),
  },
  wheelTouch: {
    name: "wheelTouch",
    start: 160,
    volume: 1,
    audio: new Audio(new URL("./sounds/wheelTouch.m4a", import.meta.url)),
  },
};

window.SOUND = SOUND;
window.INPUT = INPUT;

init();
animate();

function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  const container = document.querySelector("main");
  container.innerHTML = "";
  container.appendChild(renderer.domElement);
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(6, 2, 8);
  const distance = 18;

  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = distance;
  orbit.maxDistance = distance;
  orbit.enableDamping = false;
  orbit.enableZoom = false;
  orbit.enablePan = false;
  orbit.minPolarAngle = 0;
  orbit.maxPolarAngle = Math.PI * 0.582;
  // orbit.enableRotate = false;
  orbit.autoRotate = true;
  orbit.update();

  transform = new TransformControls(camera, renderer.domElement);
  transform.attach(object);
  transform.setMode("rotate");
  transform.visible = false;

  transform.addEventListener("dragging-changed", function (event) {
    if (transform.axis !== "XYZE" || transform.axis !== "E") {
      transform.axis = "XYZE";
    }

    orbit.enabled = !event.value;

    if (event.value) {
      const stop = playSound(SOUND.moveLight, true);
      once(window, "mouseup", () => stop());
    }

    // transform.visible = event.value;

    // if (event.value) {
    // orbit.enabled = true;
    //   clearTimeout(tid);
    // } else {
    //   tid = setTimeout(() => (transform.visible = false), 250);
    // }
  });

  scene.add(transform);
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#d46157");

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
  dirLigh2.position.set(6, 0, -5);
  dirLigh2.castShadow = true;
  dirLigh2.shadow.bias = -0.00006;
  dirLigh2.shadow.normalBias = 0.01;
  scene.add(dirLigh2);

  const dirLigh3 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLigh3.position.set(-5, 0, -6);
  dirLigh3.castShadow = true;
  dirLigh3.shadow.bias = -0.00006;
  dirLigh3.shadow.normalBias = 0.01;
  scene.add(dirLigh3);

  const dirLigh4 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLigh4.position.set(-5, 0, 5);
  dirLigh4.castShadow = true;
  dirLigh4.shadow.bias = -0.00006;
  dirLigh4.shadow.normalBias = 0.01;
  scene.add(dirLigh4);

  // Make the ground lighter in the center
  const light = new THREE.PointLight("#dddddd", 1, 30);
  light.position.set(0, 8, 0);
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
  ground.position.y = -5.8;
  ground.receiveShadow = true;
  scene.add(ground);

  // const test = new THREE.Mesh(
  //   new THREE.SphereGeometry(3),
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

function playSound(sound, loop = false, cb = () => {}) {
  sound.audio.currentTime = (sound.start || 0) / 1000;
  sound.audio.loop = loop;
  sound.audio.play();
  sound.audio.volume = sound.volume || 0.6;

  sound.playing = true;

  console.log("play", sound.name, sound.audio.currentTime);

  const currentPlayId = {};
  sound.audio.currentPlayId = currentPlayId;

  once(sound.audio, "ended", () => {
    if (sound.playing && sound.audio.currentPlayId === currentPlayId) {
      console.log("ended", sound.name);
      sound.playing = false;
      cb();
    }
  });

  return () => {
    if (sound.playing && sound.audio.currentPlayId === currentPlayId) {
      console.log("stop", sound.name);
      sound.audio.pause();
      sound.audio.loop = false;
      cb();
    }
  };
}

function init() {
  initRenderer();
  initScene();
  initModel();
  initCamera();
  onWindowResize();

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  screenDiagonal = Math.hypot(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  orbit.update();

  if (INPUT.isDown) {
    INPUT.history.push(INPUT.current);
  }

  if (SOUND.wheelRotate.inAction) {
    const wheel1 = scene.getObjectByName("Cylinder011", true);
    const wheel2 = scene.getObjectByName("Cylinder011_1", true);
    wheel1.rotation.y -= Math.PI * 0.1;
    wheel2.rotation.y = wheel1.rotation.y;
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}

////////////////////////////////////////////////////////////

function once(object, eventName, cb) {
  function handler(event) {
    object.removeEventListener(eventName, handler);
    cb(event);
  }

  object.addEventListener(eventName, handler);
}

function getDistance(a, b) {
  return Math.abs(Math.hypot(a.x - b.x, a.y - b.y));
}

function randomElement(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function isShaking(points) {
  let lastPike = points[0];
  let lastDistance = 0;
  let pikes = [];

  points.forEach((point) => {
    const dist = getDistance(lastPike, point);

    // We are moving closer again
    if (dist < lastDistance) {
      lastPike = point;
      pikes.push(dist);
      lastDistance = 0;
    } else {
      lastDistance = dist;
    }
  });

  const avg = pikes.reduce((a, b) => a + b, 0) / pikes.length;

  return avg > screenDiagonal * 0.02 && pikes.length > 2;
}

let tid;
function startActionLightUp() {
  clearTimeout(tid);

  SOUND.lightUp.inAction = true;
  SOUND.wheelRotate.inAction = true;

  const stop1 = playSound(SOUND.wheelRotate);
  const startTime = Date.now();

  once(window, "mouseup", () => {
    stop1();
    SOUND.wheelRotate.inAction = false;

    if (Date.now() - startTime < 80) {
      playSound(SOUND.wheelTouch);
      SOUND.lightUp.inAction = false;
    } else {
      tid = setTimeout(() => {
        SOUND.lightUp.inAction = false;
      }, 400);
    }
  });
}

function startActionGas() {
  SOUND.gasRunning.inAction = true;

  const stop = playSound(SOUND.gasRunning, true);

  const lever = scene.getObjectByName("Lever", true);
  lever.rotation.z = Math.PI * 0.02;

  once(window, "mouseup", () => {
    stop();
    playSound(SOUND.gasStop);
    SOUND.gasRunning.inAction = false;
    lever.rotation.z = 0;
  });
}

function startActionFlame() {
  SOUND.flame.inAction = true;

  playSound(SOUND.lightUp);
  const stop = playSound(SOUND.flame, true);

  const lever = scene.getObjectByName("Lever", true);
  lever.rotation.z = Math.PI * 0.03;

  once(window, "mouseup", () => {
    stop();
    playSound(SOUND.gasStop);
    SOUND.flame.inAction = false;
    lever.rotation.z = 0;
  });
}

function raycast() {
  if (INPUT.current) {
    const pos = new THREE.Vector2(
      (INPUT.current.x / window.innerWidth) * 2 - 1,
      (INPUT.current.y / window.innerHeight) * -2 + 1
    );
    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pos, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster
      .intersectObjects(scene.children)
      .filter((i) => i.object.receiveShadow && i.object.visible);
    console.log(intersects);
    console.log(
      "intersects",
      intersects.map((i) => i.object.name)
    );

    return intersects;
  }

  return [];
}

///////////////

window.addEventListener("mousedown", (event) => {
  INPUT.current = { x: event.clientX, y: event.clientY };
  INPUT.history = [INPUT.current];
  INPUT.start = INPUT.current;
  INPUT.last = INPUT.current;
  INPUT.isDown = true;
  INPUT.distance = 0;

  const intersects = raycast();

  if (
    intersects.length > 0 &&
    ["Cylinder011", "Cylinder011_1"].includes(intersects[0].object.name)
  ) {
    startActionLightUp();
  }

  if (intersects.length > 0 && intersects[0].object.name === "LeverHandle") {
    if (SOUND.lightUp.inAction) {
      startActionFlame();
    } else {
      startActionGas();
    }
  }
});

window.addEventListener("mousemove", (event) => {
  INPUT.current = { x: event.clientX, y: event.clientY };
  // mousemove is trigger before mousedown
  INPUT.start = INPUT.start || INPUT.current;
  INPUT.distance = getDistance(INPUT.current, INPUT.start);

  if (
    !orbit.enabled &&
    !(
      SOUND.moveShake.playing ||
      SOUND.moveShake2.playing ||
      SOUND.moveSimple.playing ||
      SOUND.moveTwice.playing
    )
  ) {
    if (
      INPUT.history.length > 60 &&
      !(SOUND.moveShake.playing || SOUND.moveShake2.playing)
    ) {
      if (isShaking(INPUT.history.splice(INPUT.history.length - 50))) {
        playSound(randomElement([SOUND.moveShake, SOUND.moveShake2]));
      }
    }

    if (INPUT.history.length > 6 && INPUT.isDown && Math.random() > 0.94) {
      const dist = getDistance(
        INPUT.current,
        INPUT.history[INPUT.history.length - 5]
      );

      if (dist > screenDiagonal * 0.05) {
        playSound(randomElement([SOUND.moveTwice, SOUND.moveSimple]));
      }
    }
  }
});

window.addEventListener("mouseup", (event) => {
  INPUT.current = { x: event.clientX, y: event.clientY };
  INPUT.history.push(INPUT.current);
  INPUT.isDown = false;
  INPUT.start = null;
});

window.addEventListener("click", () => {
  const intersects = raycast();
  if (
    intersects.length > 0 &&
    ["Tank", "Cylinder011_1"].includes(intersects[0].object.name)
  ) {
    playSound(
      randomElement([SOUND.moveTwice, SOUND.moveSimple, SOUND.moveSimple])
    );
  }
});

window.addEventListener("contextmenu", () => {
  const intersects = raycast();
  for (let index = 0; index < intersects.length; index++) {
    const object = intersects[index].object;
    if (object.visible) {
      if (["Cylinder011", "Cylinder011_1"].includes(object.name)) {
        scene.getObjectByName("Cylinder011", true).visible = false;
        scene.getObjectByName("Cylinder011_1", true).visible = false;
      }
      if (["Tank", "TankBridge"].includes(object.name)) {
        scene.getObjectByName("Tank", true).visible = false;
        scene.getObjectByName("TankBridge", true).visible = false;
      }
      if (["Lever", "LeverHandle"].includes(object.name)) {
        scene.getObjectByName("Lever", true).visible = false;
        scene.getObjectByName("LeverHandle", true).visible = false;
      }
      object.visible = false;

      playSound(SOUND.moveSimple);
      break;
    }
  }
});

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    scene.traverse((obj) => {
      if (obj.receiveShadow) {
        obj.visible = true;
      }
    });
  }
});
