// three-scene.js — CO-SYNCHRO Hero · Enhanced Globe + Particle System
// Three.js r160 via importmap

import * as THREE from 'three';

let renderer, scene, camera;
let globe, globeWire, globeAtmo;
let particleSystem, arcSystem;
let mouseX = 0, mouseY = 0;
let animFrameId = null;
let lastTime = 0;
let phase = 0, phaseTime = 0;

const PARTICLE_COUNT = 600;
const ARC_COUNT = 28;
const PHASE_DUR = [4, 3.5, 2.5];

const C_BLUE  = new THREE.Color(0x0057FF);
const C_TEAL  = new THREE.Color(0x00D4B5);
const C_WHITE = new THREE.Color(0xCCDDFF);
const C_GLOW  = new THREE.Color(0x002299);

let positions, colors, sizes, velocities, basePositions;
let arcPositions, arcColors, arcOpacities;

// ---------- helpers ----------

function randOnSphere(r) {
  const u = Math.random(), v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi   = Math.acos(2 * v - 1);
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi)
  );
}

function latLonToVec3(lat, lon, r) {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
}

// Major airports / cities around the world for arc endpoints
const NODES = [
  [35.77,  140.39], // Narita
  [51.48,  -0.45],  // London
  [40.64,  -73.78], // NYC
  [1.35,   103.99], // Singapore
  [25.25,  55.36],  // Dubai
  [-33.94, 151.18], // Sydney
  [48.11,   2.36],  // Paris
  [37.62,  -122.38],// SF
  [19.07,  72.87],  // Mumbai
  [55.97,  37.41],  // Moscow
  [-23.43, -46.47], // São Paulo
  [33.94,  -118.41],// LA
  [22.31,  113.91], // HK
  [59.65,  17.92],  // Stockholm
  [41.80,  12.24],  // Rome
];

// ---------- Globe ----------

function buildGlobe() {
  const R = 1.5;

  // Core sphere — subtle fill
  const geoSphere = new THREE.SphereGeometry(R, 64, 64);
  const matSphere = new THREE.MeshPhongMaterial({
    color: 0x000820,
    emissive: 0x000820,
    transparent: true,
    opacity: 0.85,
    depthWrite: true,
  });
  globe = new THREE.Mesh(geoSphere, matSphere);
  scene.add(globe);

  // Wireframe latitude/longitude lines
  const geoWire = new THREE.SphereGeometry(R * 1.002, 36, 18);
  const matWire = new THREE.MeshBasicMaterial({
    color: 0x0057FF,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
  });
  globeWire = new THREE.Mesh(geoWire, matWire);
  scene.add(globeWire);

  // Atmosphere glow — additive outer shell
  const geoAtmo = new THREE.SphereGeometry(R * 1.18, 32, 32);
  const matAtmo = new THREE.MeshBasicMaterial({
    color: 0x0033AA,
    transparent: true,
    opacity: 0.07,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  globeAtmo = new THREE.Mesh(geoAtmo, matAtmo);
  scene.add(globeAtmo);

  // Rings — thin equatorial accent
  const geoRing1 = new THREE.TorusGeometry(R * 1.22, 0.003, 6, 120);
  const matRing  = new THREE.MeshBasicMaterial({
    color: 0x00D4B5,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const ring1 = new THREE.Mesh(geoRing1, matRing);
  ring1.rotation.x = Math.PI / 2.4;
  scene.add(ring1);

  const geoRing2 = new THREE.TorusGeometry(R * 1.30, 0.002, 6, 120);
  const ring2 = new THREE.Mesh(geoRing2, new THREE.MeshBasicMaterial({
    color: 0x0057FF,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }));
  ring2.rotation.x = Math.PI / 1.8;
  ring2.rotation.z = 0.3;
  scene.add(ring2);

  // Node dots on globe surface
  const nodeMat = new THREE.MeshBasicMaterial({
    color: 0x00D4B5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  NODES.forEach(([lat, lon]) => {
    const pos = latLonToVec3(lat, lon, R * 1.012);
    const geo = new THREE.SphereGeometry(0.018, 8, 8);
    const mesh = new THREE.Mesh(geo, nodeMat);
    mesh.position.copy(pos);
    globe.add(mesh);

    // Tiny pulse ring per node
    const ringGeo = new THREE.RingGeometry(0.02, 0.04, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00D4B5,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    ring.userData = { pulse: Math.random() * Math.PI * 2 };
    globe.add(ring);
  });
}

// ---------- Arc connections ----------

function buildArcs() {
  const R = 1.5;
  const totalPts = ARC_COUNT * 60;
  arcPositions = new Float32Array(totalPts * 3);
  arcColors    = new Float32Array(totalPts * 3);

  const geo = new THREE.BufferGeometry();

  for (let a = 0; a < ARC_COUNT; a++) {
    const iA = Math.floor(Math.random() * NODES.length);
    let   iB = Math.floor(Math.random() * NODES.length);
    while (iB === iA) iB = Math.floor(Math.random() * NODES.length);

    const pA = latLonToVec3(...NODES[iA], R * 1.01);
    const pB = latLonToVec3(...NODES[iB], R * 1.01);

    // Great-circle arc with a lift
    const mid = pA.clone().add(pB).multiplyScalar(0.5);
    const lift = 0.25 + Math.random() * 0.55;
    mid.normalize().multiplyScalar(R * (1.01 + lift));

    const col = Math.random() > 0.5 ? C_BLUE : C_TEAL;
    const pts = 60;

    for (let p = 0; p < pts; p++) {
      const t  = p / (pts - 1);
      const t2 = 1 - t;
      // Quadratic bezier
      const x = t2 * t2 * pA.x + 2 * t2 * t * mid.x + t * t * pB.x;
      const y = t2 * t2 * pA.y + 2 * t2 * t * mid.y + t * t * pB.y;
      const z = t2 * t2 * pA.z + 2 * t2 * t * mid.z + t * t * pB.z;

      const idx = (a * pts + p) * 3;
      arcPositions[idx]     = x;
      arcPositions[idx + 1] = y;
      arcPositions[idx + 2] = z;

      // Fade opacity toward tips
      const fade = Math.sin(t * Math.PI);
      arcColors[idx]     = col.r * fade;
      arcColors[idx + 1] = col.g * fade;
      arcColors[idx + 2] = col.b * fade;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(arcColors,    3));

  const mat = new THREE.PointsMaterial({
    size: 0.022,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  arcSystem = new THREE.Points(geo, mat);
  globe.add(arcSystem);
}

// ---------- Ambient particles ----------

function buildParticles() {
  const geo = new THREE.BufferGeometry();
  positions     = new Float32Array(PARTICLE_COUNT * 3);
  colors        = new Float32Array(PARTICLE_COUNT * 3);
  sizes         = new Float32Array(PARTICLE_COUNT);
  basePositions = new Float32Array(PARTICLE_COUNT * 3);
  velocities    = [];

  const SHELL_INNER = 1.9, SHELL_OUTER = 4.2;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3  = i * 3;
    const r   = SHELL_INNER + Math.random() * (SHELL_OUTER - SHELL_INNER);
    const pos = randOnSphere(r);

    positions[i3]     = pos.x;
    positions[i3 + 1] = pos.y;
    positions[i3 + 2] = pos.z;
    basePositions[i3]     = pos.x;
    basePositions[i3 + 1] = pos.y;
    basePositions[i3 + 2] = pos.z;

    const t = Math.random();
    const col = t < 0.45 ? C_BLUE : t < 0.75 ? C_TEAL : C_WHITE;
    colors[i3]     = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;

    sizes[i] = 0.02 + Math.random() * 0.05;
    velocities.push({
      x: (Math.random() - 0.5) * 0.0008,
      y: (Math.random() - 0.5) * 0.0008,
      z: (Math.random() - 0.5) * 0.0008,
      phase: Math.random() * Math.PI * 2,
    });
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  const mat = new THREE.PointsMaterial({
    size: 0.035,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  particleSystem = new THREE.Points(geo, mat);
  scene.add(particleSystem);
}

// ---------- Lights ----------

function buildLights() {
  const ambient = new THREE.AmbientLight(0x101030, 1.5);
  scene.add(ambient);

  const blueLight = new THREE.PointLight(0x0057FF, 2.5, 12);
  blueLight.position.set(-3, 2, 4);
  scene.add(blueLight);

  const tealLight = new THREE.PointLight(0x00D4B5, 2, 10);
  tealLight.position.set(3, -2, 3);
  scene.add(tealLight);
}

// ---------- Main export ----------

export function initScene(canvas) {
  const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!testCtx) throw new Error('WebGL not supported');

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  scene  = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(52, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0.4, 5.2);

  buildLights();
  buildGlobe();
  buildArcs();
  buildParticles();

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize',    onResize);

  lastTime = performance.now();
  animate(lastTime);
}

function onMouseMove(e) {
  mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
}

function onResize() {
  if (!renderer) return;
  const canvas = renderer.domElement;
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
}

function animate(now) {
  animFrameId = requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime  = now;
  phaseTime += dt;

  const t = now * 0.001;

  // Globe slow rotation
  if (globe) {
    globe.rotation.y += 0.0018;
    globe.rotation.x  = Math.sin(t * 0.07) * 0.06;
  }
  if (globeWire) {
    globeWire.rotation.y += 0.0018;
    globeWire.rotation.x = globe.rotation.x;
  }
  if (globeAtmo) {
    globeAtmo.rotation.y -= 0.0006;
  }

  // Pulse node rings
  if (globe) {
    globe.children.forEach(child => {
      if (child.userData && child.userData.pulse !== undefined) {
        child.userData.pulse += dt * 1.4;
        const s = 1 + Math.sin(child.userData.pulse) * 0.5;
        child.scale.setScalar(s);
        child.material.opacity = 0.3 + 0.3 * Math.cos(child.userData.pulse);
      }
    });
  }

  // Ambient particles drift
  if (particleSystem) {
    const attr = particleSystem.geometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const v  = velocities[i];
      v.phase += dt * 0.5;

      positions[i3]     = basePositions[i3]     + Math.sin(v.phase + i) * 0.18 + v.x * t * 8;
      positions[i3 + 1] = basePositions[i3 + 1] + Math.cos(v.phase + i * 0.7) * 0.18 + v.y * t * 8;
      positions[i3 + 2] = basePositions[i3 + 2] + Math.sin(v.phase * 0.8 + i * 1.2) * 0.18 + v.z * t * 8;

      // Wrap drift
      for (let axis = 0; axis < 3; axis++) {
        if (Math.abs(positions[i3 + axis]) > 5) {
          basePositions[i3 + axis] *= -0.92;
        }
      }

      attr.array[i3]     = positions[i3];
      attr.array[i3 + 1] = positions[i3 + 1];
      attr.array[i3 + 2] = positions[i3 + 2];
    }
    attr.needsUpdate = true;
  }

  // Camera follows mouse gently
  camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.025;
  camera.position.y += (-mouseY * 0.3 + 0.4 - camera.position.y) * 0.025;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

export function destroyScene() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize',    onResize);
  if (renderer) renderer.dispose();
  renderer = scene = camera = globe = particleSystem = arcSystem = null;
}
