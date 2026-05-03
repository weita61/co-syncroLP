import * as THREE from "three";

let renderer;
let scene;
let camera;
let frameId;
let phones;
let rings;
let particles;
let resizeObserver;
let scrollProgress = 0;
let pulseClock = 0;

const blue = new THREE.Color(0x0057ff);
const teal = new THREE.Color(0x00d4b5);

export function initScene(canvas) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.15, 7);

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  addLights();
  addParticles();
  phones = createPhones();
  rings = createPulseRings();
  onResize();

  window.addEventListener("scroll", onScroll, { passive: true });
  resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(canvas);

  frameId = requestAnimationFrame(animate);
}

function addLights() {
  scene.add(new THREE.AmbientLight(0xffffff, 0.42));

  const blueLight = new THREE.PointLight(0x0057ff, 4.4, 11);
  blueLight.position.set(-3.2, 2.8, 3.4);
  scene.add(blueLight);

  const tealLight = new THREE.PointLight(0x00d4b5, 3.6, 10);
  tealLight.position.set(3.2, -1.2, 3.2);
  scene.add(tealLight);

  const rim = new THREE.DirectionalLight(0xffffff, 1.4);
  rim.position.set(0, 3, 4);
  scene.add(rim);
}

function addParticles() {
  const count = 560;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 12;
    positions[i3 + 1] = (Math.random() - 0.5) * 7;
    positions[i3 + 2] = -2.5 - Math.random() * 3.5;

    const color = Math.random() > 0.46 ? blue : teal;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  particles = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.034,
      vertexColors: true,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(particles);
}

function createPhones() {
  const group = new THREE.Group();
  scene.add(group);

  const phoneA = createPhone(blue);
  const phoneB = createPhone(teal);
  group.add(phoneA, phoneB);

  return { group, phoneA, phoneB };
}

function createPhone(screenColor) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.02, 2.08, 0.13, 5, 8, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0x151b2b,
      roughness: 0.16,
      metalness: 0.82,
      transmission: 0.03,
      thickness: 0.5,
      clearcoat: 0.7,
      clearcoatRoughness: 0.18,
      envMapIntensity: 1.2,
    }),
  );
  group.add(body);

  const bevel = new THREE.Mesh(
    new THREE.BoxGeometry(0.94, 1.88, 0.15, 4, 8, 1),
    new THREE.MeshPhysicalMaterial({
      color: 0x050916,
      roughness: 0.24,
      metalness: 0.48,
      clearcoat: 0.9,
    }),
  );
  bevel.position.z = 0.025;
  group.add(bevel);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.82, 1.64),
    new THREE.MeshStandardMaterial({
      color: 0x02050c,
      emissive: screenColor,
      emissiveIntensity: 0.44,
      roughness: 0.35,
      metalness: 0.08,
    }),
  );
  screen.position.z = 0.104;
  group.add(screen);

  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(0.26, 48),
    new THREE.MeshBasicMaterial({
      color: screenColor,
      transparent: true,
      opacity: 0.48,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.set(0, 0.06, 0.11);
  group.add(glow);

  group.userData.screen = screen;
  group.userData.glow = glow;
  return group;
}

function createPulseRings() {
  const group = new THREE.Group();
  const ringList = [];

  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.26, 0.275, 96),
      new THREE.MeshBasicMaterial({
        color: 0x00d4b5,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.userData.offset = i * 0.28;
    group.add(ring);
    ringList.push(ring);
  }

  scene.add(group);
  return ringList;
}

function onScroll() {
  const solution = document.getElementById("solution");
  if (!solution) return;

  const rect = solution.getBoundingClientRect();
  const total = window.innerHeight + rect.height;
  scrollProgress = THREE.MathUtils.clamp((window.innerHeight - rect.top) / total, 0, 1);
}

function onResize() {
  if (!renderer || !camera) return;
  const canvas = renderer.domElement;
  const width = canvas.clientWidth || window.innerWidth;
  const height = canvas.clientHeight || window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function animate(now) {
  frameId = requestAnimationFrame(animate);
  const t = now * 0.001;
  const eased = smoothstep(scrollProgress);
  const gap = THREE.MathUtils.lerp(1.72, 0.32, eased);
  const contact = THREE.MathUtils.smoothstep(eased, 0.72, 1);

  phones.phoneA.position.set(-gap, Math.sin(t * 0.95) * 0.08, 0);
  phones.phoneB.position.set(gap, Math.sin(t * 0.95 + Math.PI) * 0.08, 0);
  phones.phoneA.rotation.set(0.05, THREE.MathUtils.lerp(-0.28, 0.5, eased) + Math.sin(t * 0.4) * 0.06, -0.12);
  phones.phoneB.rotation.set(-0.05, THREE.MathUtils.lerp(0.28, -0.5, eased) - Math.sin(t * 0.4) * 0.06, 0.12);

  phones.group.rotation.y = Math.sin(t * 0.2) * 0.08;
  phones.group.position.y = Math.sin(t * 0.62) * 0.05;

  const screenIntensity = THREE.MathUtils.lerp(0.44, 1.35, contact);
  phones.phoneA.userData.screen.material.emissiveIntensity = screenIntensity;
  phones.phoneB.userData.screen.material.emissiveIntensity = screenIntensity;
  phones.phoneA.userData.glow.material.opacity = THREE.MathUtils.lerp(0.42, 0.82, contact);
  phones.phoneB.userData.glow.material.opacity = THREE.MathUtils.lerp(0.42, 0.82, contact);

  animateRings(contact, t);

  if (particles) {
    particles.rotation.y = t * 0.025;
    particles.rotation.x = Math.sin(t * 0.18) * 0.025;
  }

  camera.position.x = Math.sin(t * 0.16) * 0.16;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

function animateRings(contact, t) {
  if (contact < 0.18) {
    rings.forEach((ring) => {
      ring.material.opacity = 0;
    });
    pulseClock = t;
    return;
  }

  rings.forEach((ring) => {
    const local = ((t - pulseClock) * 0.55 + ring.userData.offset) % 1;
    const scale = THREE.MathUtils.lerp(0.35, 3.6, local);
    ring.scale.setScalar(scale);
    ring.material.opacity = (1 - local) * 0.75 * contact;
  });
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

export function destroyScene() {
  if (frameId) cancelAnimationFrame(frameId);
  window.removeEventListener("scroll", onScroll);
  if (resizeObserver) resizeObserver.disconnect();
  if (!scene) return;

  scene.traverse((object) => {
    if (object.geometry) object.geometry.dispose();
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });

  if (renderer) renderer.dispose();
  renderer = null;
  scene = null;
  camera = null;
}
