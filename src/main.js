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

const object = new THREE.Group();
object.position.y = -1;

const SOUND = {
  test: {
    name: "test",
    start: 800,
    audio: new Audio(new URL("./sounds/test.m4a", import.meta.url)),
  },
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
    start: 400,
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
    volume: 0.4,
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
    start: 300,
    audio: new Audio(new URL("./sounds/wheelRotate.m4a", import.meta.url)),
  },
  wheelTouch: {
    name: "wheelTouch",
    start: 160,
    audio: new Audio(new URL("./sounds/wheelTouch.m4a", import.meta.url)),
  },
};

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

  // if (loop) {
  //   const handler = () => {
  //     if (sound.playing && sound.audio.currentPlayId === currentPlayId) {
  //       sound.audio.currentTime = (sound.start || 0) / 1000;
  //       sound.audio.play();
  //     }
  //   };
  //   const cbOrg = cb;
  //   cb = () => {
  //     sound.audio.removeEventListener("ended", handler);
  //     cbOrg();
  //   };
  //   sound.audio.addEventListener("ended", handler);
  // }
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

  render();
}

function render() {
  renderer.render(scene, camera);
}

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

window.addEventListener("mousedown", (event) => {
  INPUT.current = { x: event.clientX, y: event.clientY };
  INPUT.history = [INPUT.current];
  INPUT.start = INPUT.current;
  INPUT.last = INPUT.current;
  INPUT.isDown = true;
  INPUT.distance = 0;
});

function isShaking(points) {
  let lastPike = points[0];
  let lastDistance = 0;
  // let totalDistance = 0;
  let pikes = [];

  points.forEach((point) => {
    const dist = getDistance(lastPike, point);

    // We are moving closer again
    if (dist < lastDistance) {
      // totalDistance += lastDistance;
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

window.addEventListener("mouseup", () => {
  if (!SOUND.lightUp.inAction) {
    playSound(SOUND.lightUp);
    SOUND.lightUp.inAction = true;

    const tid = setTimeout(() => {
      SOUND.lightUp.inAction = false;
    }, 100);

    once(window, "mousedown", () => {
      if (!SOUND.lightUp.inAction) return;

      clearTimeout(tid);

      playSound(SOUND.gasStart);
      const stop1 = playSound(SOUND.flame, true);
      const stop2 = playSound(SOUND.gasRunning, true);

      once(window, "mouseup", () => {
        stop1();
        stop2();
        playSound(SOUND.gasStop);

        setTimeout(() => {
          SOUND.lightUp.inAction = false;
        }, 10);
      });
    });
  }
});
