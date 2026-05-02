// three-scene.js — CO-SYNCHRO Hero Particle Scene
// Three.js r160 via importmap
import * as THREE from 'three';

let renderer, scene, camera, particleSystem;
let mouseX = 0, mouseY = 0;
let animFrameId = null;
let phase = 0;
let phaseTime = 0;
let lastTime = 0;

const PARTICLE_COUNT = 400;
const CLUSTER_A_COUNT = 150;
const CLUSTER_B_COUNT = 150;
const NEUTRAL_COUNT   = 100;

const COLOR_A   = new THREE.Color(0x0057FF);
const COLOR_B   = new THREE.Color(0x00D4B5);
const COLOR_N   = new THREE.Color(0xE2E6EF);

// Phase durations (seconds)
const PHASE_DUR = [3, 3, 2]; // idle, approach, burst

let positions, colors, velocities, targets, originA, originB;

export function initScene(canvas) {
  // Check WebGL support first
  const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!testCtx) {
    throw new Error('WebGL not supported');
  }

  // Renderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, context: testCtx });
  } catch (e) {
    throw new Error('WebGL context creation failed');
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  // Geometry
  const geometry = new THREE.BufferGeometry();
  positions  = new Float32Array(PARTICLE_COUNT * 3);
  colors     = new Float32Array(PARTICLE_COUNT * 3);
  velocities = new Array(PARTICLE_COUNT).fill(null).map(() => new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    0
  ));
  targets = new Float32Array(PARTICLE_COUNT * 3);
  originA = [];
  originB = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    let x, y, z, col;

    if (i < CLUSTER_A_COUNT) {
      // Cluster A: left cluster (blue)
      x = -1.4 + (Math.random() - 0.5) * 1.8;
      y = (Math.random() - 0.5) * 1.8;
      z = (Math.random() - 0.5) * 0.4;
      col = COLOR_A;
      originA.push(i);
    } else if (i < CLUSTER_A_COUNT + CLUSTER_B_COUNT) {
      // Cluster B: right cluster (teal)
      x = 1.4 + (Math.random() - 0.5) * 1.8;
      y = (Math.random() - 0.5) * 1.8;
      z = (Math.random() - 0.5) * 0.4;
      col = COLOR_B;
      originB.push(i);
    } else {
      // Neutral: scattered
      x = (Math.random() - 0.5) * 5;
      y = (Math.random() - 0.5) * 3.5;
      z = (Math.random() - 0.5) * 0.5;
      col = COLOR_N;
    }

    positions[i3]     = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    targets[i3]     = x;
    targets[i3 + 1] = y;
    targets[i3 + 2] = z;
    colors[i3]     = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

  // Material
  const material = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // Mouse
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);

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
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

function setPhaseTargets() {
  const spread = 1.6;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    if (phase === 0) {
      // Gentle drift — keep near origins
      targets[i3]     = positions[i3]     + (Math.random() - 0.5) * 0.5;
      targets[i3 + 1] = positions[i3 + 1] + (Math.random() - 0.5) * 0.5;
      targets[i3 + 2] = 0;
    } else if (phase === 1) {
      // Approach — clusters move toward center
      if (i < CLUSTER_A_COUNT) {
        targets[i3]     = -0.3 + (Math.random() - 0.5) * 0.7;
        targets[i3 + 1] = (Math.random() - 0.5) * spread;
        targets[i3 + 2] = (Math.random() - 0.5) * 0.3;
      } else if (i < CLUSTER_A_COUNT + CLUSTER_B_COUNT) {
        targets[i3]     =  0.3 + (Math.random() - 0.5) * 0.7;
        targets[i3 + 1] = (Math.random() - 0.5) * spread;
        targets[i3 + 2] = (Math.random() - 0.5) * 0.3;
      } else {
        targets[i3]     = (Math.random() - 0.5) * 4;
        targets[i3 + 1] = (Math.random() - 0.5) * 3;
        targets[i3 + 2] = 0;
      }
    } else {
      // Burst / scatter then reform
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 2.5;
      targets[i3]     = Math.cos(angle) * radius;
      targets[i3 + 1] = Math.sin(angle) * radius;
      targets[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
  }
}

function animate(now) {
  animFrameId = requestAnimationFrame(animate);

  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime  = now;
  phaseTime += dt;

  // Phase transitions
  if (phaseTime > PHASE_DUR[phase]) {
    phaseTime = 0;
    phase = (phase + 1) % 3;
    setPhaseTargets();
  }

  // Update positions toward targets + mouse influence
  const attr = particleSystem.geometry.attributes.position;
  const mx = mouseX * 1.2;
  const my = -mouseY * 1.2;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const tx = targets[i3]     + mx * 0.08 * (1 - i / PARTICLE_COUNT);
    const ty = targets[i3 + 1] + my * 0.08 * (1 - i / PARTICLE_COUNT);
    const tz = targets[i3 + 2];

    const lerpSpeed = phase === 2 ? 0.06 : 0.015;
    positions[i3]     += (tx - positions[i3])     * lerpSpeed;
    positions[i3 + 1] += (ty - positions[i3 + 1]) * lerpSpeed;
    positions[i3 + 2] += (tz - positions[i3 + 2]) * lerpSpeed;

    // Subtle idle drift
    if (phase === 0) {
      positions[i3]     += velocities[i].x;
      positions[i3 + 1] += velocities[i].y;
    }

    attr.array[i3]     = positions[i3];
    attr.array[i3 + 1] = positions[i3 + 1];
    attr.array[i3 + 2] = positions[i3 + 2];
  }
  attr.needsUpdate = true;

  // Slow camera drift
  camera.position.x += (mouseX * 0.15 - camera.position.x) * 0.02;
  camera.position.y += (-mouseY * 0.15 - camera.position.y) * 0.02;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

export function destroyScene() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);
  if (renderer) renderer.dispose();
}
