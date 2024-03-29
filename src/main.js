import * as THREE from "three";

// import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

import { KTX2Loader } from "three/addons/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

let camera, scene, renderer, orbit, transform, screenDiagonal;
let isTouch;

const raycaster = new THREE.Raycaster();
const object = new THREE.Group();
object.position.y = -1;

const INPUT = {
  start: null,
  last: null,
  current: null,
  history: [],
  speed: 0,
  isDown: false,
  distance: 0,
};

const SOUND = {
  flame: {
    name: "flame",
    start: 0,
    volume: 0.6,
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
    start: 0,
    // volume: 0.5,
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

  const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLight2.position.set(6, 0, -5);
  dirLight2.castShadow = true;
  dirLight2.shadow.bias = -0.00006;
  dirLight2.shadow.normalBias = 0.01;
  scene.add(dirLight2);

  const dirLight3 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLight3.position.set(-5, 0, -6);
  dirLight3.castShadow = true;
  dirLight3.shadow.bias = -0.00006;
  dirLight3.shadow.normalBias = 0.01;
  scene.add(dirLight3);

  const dirLight4 = new THREE.DirectionalLight(0xffffff, 0.08);
  dirLight4.position.set(-5, 0, 5);
  dirLight4.castShadow = true;
  dirLight4.shadow.bias = -0.00006;
  dirLight4.shadow.normalBias = 0.01;
  scene.add(dirLight4);

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
  sound.audio.play().catch(() => {});
  sound.audio.volume = sound.volume || 0.6;

  sound.playing = true;

  console.debug("play", sound.name, sound.audio.currentTime);

  const currentPlayId = {};
  sound.audio.currentPlayId = currentPlayId;

  once(sound.audio, "ended", () => {
    if (sound.playing && sound.audio.currentPlayId === currentPlayId) {
      console.debug("ended", sound.name);
      sound.playing = false;
      cb();
    }
  });

  return () => {
    if (sound.playing && sound.audio.currentPlayId === currentPlayId) {
      console.debug("stop", sound.name);
      sound.audio.pause();
      sound.audio.loop = false;
      cb();
    }
  };
}

function stopSound(sound) {
  console.debug("stop", sound.name);
  sound.audio.pause();
  sound.audio.loop = false;
}

function raycast(logDebug) {
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

    if (logDebug !== false) {
      console.debug("intersects:", ...intersects.map((i) => i.object.name));
    }

    return intersects;
  }

  return [];
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

  // const lastInput = INPUT.history && INPUT.history[INPUT.history.length - 1];
  if (INPUT.isDown) {
    INPUT.history.push(INPUT.current);
  }

  const wheel1 = scene.getObjectByName("Cylinder011", true);
  const wheel2 = scene.getObjectByName("Cylinder011_1", true);
  if (wheel1 && INPUT.history[INPUT.history.length - 1]) {
    const dt = 1000 / 60;
    // const distance = lastInput.sub(INPUT.current);
    // const speed = Math.PI * (distance.x / screenDiagonal) * 10;
    const speed = Math.PI * 0.3;
    if (SOUND.wheelRotate.inAction) {
      wheel1.rotation.y_ = speed;
    } else if (wheel1.rotation.y_ > 0) {
      wheel1.rotation.y_ -= wheel1.rotation.y_ / 20 + speed / 100;
    } else {
      wheel1.rotation.y_ = 0;
    }

    wheel1.rotation.y += wheel1.rotation.y_ / dt;
    wheel2.rotation.y = wheel1.rotation.y;
  }

  function easeOutQuint(x) {
    return 1 - Math.pow(1 - x, 5);
  }

  function easeInOutQuint(x) {
    return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
  }

  if (!object.position.y_) {
    object.position.y_ = 0;
  }

  if (INPUT.over) {
    if (object.position.y_ < 1) {
      const delta = easeOutQuint(object.position.y_, object.position.y_ + 0.03);
      object.position.y_ += 0.03;
      object.position.y = -1 + delta * 0.5;
    } else {
      object.position.y_ = 1;
    }
  } else {
    if (object.position.y_ > 0) {
      const delta = easeOutQuint(object.position.y_, object.position.y_ - 0.03);
      object.position.y_ -= 0.01;
      object.position.y = -1 + delta * 0.5;
    } else {
      object.position.y_ = 0;
    }
  }

  const tube = scene.getObjectByName("Tube", true);
  if (tube) {
    const pos1 = new THREE.Vector3();
    const pos2 = new THREE.Vector3();
    tube.getWorldPosition(pos1);
    camera.getWorldPosition(pos2);
    const dist = pos1.distanceTo(pos2);
    const min = 13;
    const max = 24;
    const normalDist = (dist - min) / (max - min);

    SOUND.gasRunning.volume = 1 - normalDist;
    SOUND.gasRunning.audio.volume = SOUND.gasRunning.volume;
    SOUND.flame.volume = 1 - normalDist;
    SOUND.flame.audio.volume = SOUND.flame.volume;
  }

  render();
}

function render() {
  renderer.render(scene, camera);
}

////////////////////////////////////////////////////////////

function once(object, eventName, cb) {
  let eventList = Array.isArray(eventName) ? eventName : [eventName];

  function handler(event) {
    eventList.forEach((name) => {
      object.removeEventListener(name, handler);
    });
    cb(event);
  }

  eventList.forEach((name) => {
    object.addEventListener(name, handler);
  });
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

function finishActionLightUp(successful) {
  if (!SOUND.wheelRotate.inAction) {
    return;
  }

  SOUND.wheelRotate.inAction = false;

  if (successful) {
    playSound(SOUND.wheelTouch);
    SOUND.lightUp.inAction = false;
  } else {
    tid = setTimeout(
      () => {
        SOUND.lightUp.inAction = false;
      },
      isTouch ? 900 : 400
    );
  }
}

function startActionLightUp() {
  clearTimeout(tid);

  console.log("mouse down ActionLightUp", orbit.enabled, transform.enabled);
  if (orbit.enabled) {
    orbit.enabled = false;
    transform.enabled = false;
  }

  SOUND.lightUp.inAction = true;
  SOUND.wheelRotate.inAction = true;

  const stop1 = playSound(SOUND.wheelRotate, true);
  const startTime = Date.now();

  once(window, ["mouseup", "touchend"], () => {
    console.log("mouse up ActionLightUp", orbit.enabled, transform.enabled);
    if (!transform.enabled) {
      orbit.enabled = true;
      transform.enabled = true;
    }
    stop1();
    finishActionLightUp(Date.now() - startTime < 80);
  });
}

function startActionGas() {
  SOUND.gasRunning.inAction = true;

  const stop = playSound(SOUND.gasRunning, true);

  const lever = scene.getObjectByName("Lever", true);
  lever.rotation.z = Math.PI * 0.02;
  const wheel1 = scene.getObjectByName("Cylinder011", true);
  wheel1.rotation.y_ *= 10;

  once(window, ["mouseup", "touchend"], () => {
    stop();
    playSound(SOUND.gasStop);
    SOUND.gasRunning.inAction = false;
    lever.rotation.z = 0;
  });
}

function finishActionFlame() {
  if (!SOUND.flame.inAction) {
    return;
  }

  SOUND.flame.inAction = false;
  playSound(SOUND.gasStop);
  const lever = scene.getObjectByName("Lever", true);
  lever.rotation.z = 0;
}

function startActionFlame() {
  SOUND.flame.inAction = true;
  SOUND.flame.startedByDragging = false;

  playSound(SOUND.lightUp);
  const stop = playSound(SOUND.flame, true);

  const lever = scene.getObjectByName("Lever", true);
  lever.rotation.z = Math.PI * 0.03;

  once(window, ["mouseup", "touchend"], () => {
    stop();
    finishActionFlame();
  });
}

///////////////

window.addEventListener("mousedown", (event) => {
  INPUT.current = new THREE.Vector2(event.clientX, event.clientY);
  onMouseDown();
});

window.addEventListener("touchstart", (event) => {
  isTouch = true;
  window.removeEventListener("contextmenu", onContextmenu);

  INPUT.current = new THREE.Vector2(
    event.touches[0].clientX,
    event.touches[0].clientY
  );
  onMouseDown();
});

function onMouseDown() {
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
}

window.addEventListener("mousemove", (event) => {
  INPUT.current = new THREE.Vector2(event.clientX, event.clientY);
  onMouseMove();
});

window.addEventListener("touchmove", (event) => {
  INPUT.current = new THREE.Vector2(
    event.touches[0].clientX,
    event.touches[0].clientY
  );
  onMouseMove();
});

function onMouseMove() {
  // mousemove is trigger before mousedown
  INPUT.start = INPUT.start || INPUT.current;

  INPUT.distance = getDistance(INPUT.current, INPUT.start);

  if (
    transform.enabled &&
    !orbit.enabled &&
    !(
      SOUND.moveShake.playing ||
      SOUND.moveShake2.playing ||
      SOUND.moveSimple.playing ||
      SOUND.moveTwice.playing
    )
  ) {
    if (INPUT.history.length > 60) {
      if (isShaking(INPUT.history.splice(INPUT.history.length - 50))) {
        playSound(randomElement([SOUND.moveShake, SOUND.moveShake2]));
      }
    }

    if (INPUT.history.length > 6 && Math.random() > 0.94) {
      const dist = getDistance(
        INPUT.current,
        INPUT.history[INPUT.history.length - 5]
      );

      if (dist > screenDiagonal * 0.05) {
        playSound(randomElement([SOUND.moveTwice, SOUND.moveSimple]));
      }
    }
  }

  const intersects = raycast(false);
  if (!isTouch) {
    // Over the object
    INPUT.over = intersects.some((i) => i.object.castShadow);
  }

  if (INPUT.isDown) {
    if (intersects.length > 0 && intersects[0].object.name === "LeverHandle") {
      if (
        SOUND.lightUp.inAction &&
        !SOUND.flame.inAction &&
        !SOUND.gasRunning.inAction
      ) {
        stopSound(SOUND.wheelRotate);
        finishActionLightUp(true);
        startActionFlame();
        SOUND.flame.startedByDragging = true;
        // once(window, ["mouseup", "touchend"], () => {
        //   orbit.enabled = true;
        //   transform.enabled = true;
        // });
      }
    } else {
      if (SOUND.flame.inAction && SOUND.flame.startedByDragging) {
        stopSound(SOUND.flame);
        finishActionFlame();
      }
    }
  }
}

window.addEventListener("mouseup", (event) => {
  INPUT.current = new THREE.Vector2(event.clientX, event.clientY);
  INPUT.isDown = false;
  INPUT.start = null;
});

window.addEventListener("touchend", () => {
  INPUT.isDown = false;
  INPUT.start = null;
});

window.addEventListener("click", () => {
  const intersects = raycast();
  if (
    intersects.length > 0 &&
    Math.random() > 0.5 &&
    ["Tank", "Cylinder011_1"].includes(intersects[0].object.name)
  ) {
    playSound(
      randomElement([
        SOUND.moveTwice,
        SOUND.moveSimple,
        SOUND.moveSimple,
        SOUND.moveSimple,
      ])
    );
  }
});

window.addEventListener("contextmenu", onContextmenu);

function onContextmenu() {
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
}

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    scene.traverse((obj) => {
      if (obj.receiveShadow) {
        obj.visible = true;
      }
    });
  }
});
