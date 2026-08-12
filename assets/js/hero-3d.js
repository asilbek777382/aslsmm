/**
 * Full-page animated 3D background (Three.js)
 * Distinct from the "particle network" look used on the portfolio site:
 * a single warm-lit organic blob that morphs continuously, plus a
 * handful of soft glowing embers drifting around it.
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg-3d');

if (canvas && window.WebGLRenderingContext) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 26);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const pink = new THREE.Color(0xff4d8d);
  const orange = new THREE.Color(0xffb020);

  // ---- Lighting ----
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const lightA = new THREE.PointLight(0xff4d8d, 3, 80);
  lightA.position.set(-14, 8, 14);
  scene.add(lightA);
  const lightB = new THREE.PointLight(0xffb020, 3, 80);
  lightB.position.set(14, -6, 10);
  scene.add(lightB);

  // ---- Organic blob ----
  const blobGeometry = new THREE.IcosahedronGeometry(8.5, 3);
  const posAttr = blobGeometry.attributes.position;
  const baseVertices = Float32Array.from(posAttr.array);

  const colorArray = new Float32Array(posAttr.count * 3);
  blobGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

  const blobMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.35,
    metalness: 0.15,
    transparent: true,
    opacity: 0.92,
  });

  const blob = new THREE.Mesh(blobGeometry, blobMaterial);
  scene.add(blob);

  function warp(x, y, z, t) {
    return (
      Math.sin(x * 0.42 + t) * 0.6 +
      Math.cos(y * 0.38 - t * 0.8) * 0.6 +
      Math.sin(z * 0.5 + t * 0.6) * 0.6
    );
  }

  function updateBlob(t) {
    const pos = blobGeometry.attributes.position;
    const col = blobGeometry.attributes.color;
    for (let i = 0; i < pos.count; i++) {
      const ix = i * 3;
      const bx = baseVertices[ix];
      const by = baseVertices[ix + 1];
      const bz = baseVertices[ix + 2];
      const len = Math.sqrt(bx * bx + by * by + bz * bz) || 1;
      const nx = bx / len, ny = by / len, nz = bz / len;

      const disp = warp(bx, by, bz, t);
      pos.setXYZ(i, bx + nx * disp, by + ny * disp, bz + nz * disp);

      const mixFactor = (disp + 1.8) / 3.6;
      const c = pink.clone().lerp(orange, THREE.MathUtils.clamp(mixFactor, 0, 1));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    blobGeometry.computeVertexNormals();
  }

  // ---- Drifting embers ----
  const EMBER_COUNT = 70;
  const emberPositions = new Float32Array(EMBER_COUNT * 3);
  for (let i = 0; i < EMBER_COUNT; i++) {
    const radius = 20 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    emberPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    emberPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    emberPositions[i * 3 + 2] = radius * Math.cos(phi) - 10;
  }
  const emberGeometry = new THREE.BufferGeometry();
  emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
  const emberMaterial = new THREE.PointsMaterial({
    color: 0xffb020,
    size: 0.5,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const embers = new THREE.Points(emberGeometry, emberMaterial);
  scene.add(embers);

  // ---- Mouse parallax + scroll drift ----
  const mouse = { x: 0, y: 0 };
  const targetCamera = { x: 0, y: 0 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  let scrollFactor = 0;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollFactor = max > 0 ? window.scrollY / max : 0;
  }, { passive: true });

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    updateBlob(t * 0.6);
    blob.rotation.y = t * 0.12;
    blob.rotation.x = Math.sin(t * 0.15) * 0.15;

    embers.rotation.y = t * 0.03;

    targetCamera.x += (mouse.x * 3 - targetCamera.x) * 0.03;
    targetCamera.y += (-mouse.y * 2 - targetCamera.y - scrollFactor * 6) * 0.03;
    camera.position.x = targetCamera.x;
    camera.position.y = targetCamera.y;
    camera.lookAt(0, -scrollFactor * 3, 0);

    renderer.render(scene, camera);
  }

  animate();
}
