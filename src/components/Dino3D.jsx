import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Realistic 3D Evrima species display: each species gets its own body plan —
// theropods (heavy-tailed rex, tiny-armed carno, crested dilo, long-necked
// raptors and ornithomimids), ceratopsians with frills and brow horns,
// stegosaurs with plates and tail spikes, a spread-winged Pteranodon and a
// low Deinosuchus. The swept spine body carries the zone colors as vertex
// colors (belly below, body above, brindle stripes on the back); horns,
// claws and teeth take the horn color. Drag to orbit, scroll to zoom.

// ---- body-plan spines: tail tip -> hips -> torso -> neck -> head base ----
const BODY = [
  { x: -8.2, y: 0.7, r: 0.06 },
  { x: -7.2, y: 0.65, r: 0.3 },
  { x: -5.8, y: 0.55, r: 0.65 },
  { x: -4.2, y: 0.5, r: 1.0 },
  { x: -2.4, y: 0.55, r: 1.45 },
  { x: -0.4, y: 0.55, r: 1.85 },
  { x: 1.2, y: 0.75, r: 1.6 },
  { x: 2.2, y: 1.2, r: 1.25 },
];
const NECK = [
  { x: 2.9, y: 1.9, r: 0.85 },
  { x: 3.4, y: 2.8, r: 0.68 },
  { x: 3.8, y: 3.6, r: 0.55 },
];
const NECK_LONG = [
  { x: 2.9, y: 1.8, r: 0.75 },
  { x: 3.3, y: 2.6, r: 0.62 },
  { x: 3.7, y: 3.3, r: 0.52 },
  { x: 4.1, y: 3.95, r: 0.44 },
  { x: 4.4, y: 4.45, r: 0.4 },
];
const QUAD = [
  { x: -7.5, y: 1.0, r: 0.1 },
  { x: -6.0, y: 1.0, r: 0.55 },
  { x: -4.5, y: 0.95, r: 0.95 },
  { x: -3.0, y: 1.0, r: 1.3 },
  { x: -1.5, y: 1.0, r: 1.55 },
  { x: 0.0, y: 1.0, r: 1.7 },
  { x: 1.5, y: 1.0, r: 1.55 },
  { x: 2.6, y: 1.0, r: 1.2 },
  { x: 3.5, y: 1.05, r: 0.85 },
  { x: 4.1, y: 1.1, r: 0.65 },
];
const CROC = [
  { x: -8.0, y: 0.4, r: 0.08 },
  { x: -6.5, y: 0.42, r: 0.35 },
  { x: -4.5, y: 0.5, r: 0.62 },
  { x: -2.5, y: 0.55, r: 0.78 },
  { x: -0.5, y: 0.55, r: 0.85 },
  { x: 1.2, y: 0.5, r: 0.72 },
  { x: 2.6, y: 0.45, r: 0.52 },
  { x: 3.4, y: 0.42, r: 0.4 },
];
const PTERO = [
  { x: -3.6, y: 1.3, r: 0.12 },
  { x: -2.2, y: 1.32, r: 0.38 },
  { x: -0.8, y: 1.38, r: 0.55 },
  { x: 0.6, y: 1.42, r: 0.52 },
  { x: 1.6, y: 1.55, r: 0.42 },
  { x: 2.3, y: 1.85, r: 0.32 },
  { x: 2.7, y: 2.15, r: 0.26 },
];

const FAMILIES = {
  theropod: { ground: -4.2, shadowR: 4 },
  quadruped: { ground: -2.6, shadowR: 3.4 },
  croc: { ground: -1.5, shadowR: 2.6 },
  pterosaur: { ground: -1.3, shadowR: 2.2 },
};

// Evrima roster -> morphology
const SPECIES_MORPHS = [
  ["tyrannosaurus", { family: "theropod", scale: 1.35, headScale: 1.2, arms: "tiny" }],
  ["allosaurus", { family: "theropod", scale: 1.15, arms: "normal" }],
  ["ceratosaurus", { family: "theropod", scale: 1.05, features: ["nasalHorn"] }],
  ["carnotaurus", { family: "theropod", scale: 1.05, features: ["browHorns"], arms: "tiny" }],
  ["dilophosaurus", { family: "theropod", scale: 0.9, features: ["crests"] }],
  ["herrerasaurus", { family: "theropod", scale: 0.8, arms: "normal" }],
  ["austroraptor", { family: "theropod", scale: 0.8, neck: "long", headScale: 0.7, arms: "normal" }],
  ["omniraptor", { family: "theropod", scale: 0.65, neck: "long", headScale: 0.65, arms: "normal" }],
  ["troodon", { family: "theropod", scale: 0.55, neck: "long", headScale: 0.6, arms: "normal" }],
  ["gallimimus", { family: "theropod", scale: 0.95, neck: "long", headScale: 0.55, beak: true }],
  ["dryosaurus", { family: "theropod", scale: 0.7, neck: "long", headScale: 0.55, beak: true }],
  ["hypsilophodon", { family: "theropod", scale: 0.5, neck: "long", headScale: 0.5, beak: true }],
  ["tenontosaurus", { family: "theropod", scale: 1.0, neck: "long", headScale: 0.6, beak: true, tail: "heavy" }],
  ["maiasaura", { family: "quadruped", scale: 1.15, features: ["crest"] }],
  ["pachycephalosaurus", { family: "theropod", scale: 0.85, head: "dome" }],
  ["triceratops", { family: "quadruped", scale: 1.25, head: "frill", headScale: 1.1 }],
  ["diabloceratops", { family: "quadruped", scale: 1.15, head: "frill", headScale: 1.05, features: ["frillHorns"] }],
  ["stegosaurus", { family: "quadruped", scale: 1.3, features: ["plates"] }],
  ["kentrosaurus", { family: "quadruped", scale: 1.0, features: ["spikes", "tailSpikes"] }],
  ["pteranodon", { family: "pterosaur", scale: 1.0 }],
  ["deinosuchus", { family: "croc", scale: 1.4 }],
];
const DEFAULT_MORPH = { family: "theropod", scale: 1.0, arms: "normal" };

function morphFor(species) {
  const s = String(species || "").toLowerCase();
  for (const [key, morph] of SPECIES_MORPHS) if (s.includes(key)) return morph;
  return DEFAULT_MORPH;
}

function spineFor(m) {
  if (m.family === "quadruped") return QUAD;
  if (m.family === "croc") return CROC;
  if (m.family === "pterosaur") return PTERO;
  let s = [...BODY, ...(m.neck === "long" ? NECK_LONG : NECK)];
  if (m.tail === "heavy") {
    s = s.map((p, i) => (i < 4 ? { ...p, r: p.r * 1.3, y: p.y + 0.15 } : p));
  }
  return s;
}

// Spine top surface height at a given x (for placing plates/spikes)
function topAt(spine, x) {
  for (let i = 0; i < spine.length - 1; i++) {
    const a = spine[i];
    const b = spine[i + 1];
    if (x >= a.x && x <= b.x) {
      const t = (x - a.x) / (b.x - a.x || 1);
      return a.y + (b.y - a.y) * t + a.r + (b.r - a.r) * t;
    }
  }
  const last = spine[spine.length - 1];
  return last.y + last.r;
}

const hexRgb = (hex) => {
  const n = parseInt(String(hex).replace("#", ""), 16) || 0x888888;
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const accentOf = (hex) => {
  const [r, g, b] = hexRgb(hex);
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  const d = lum > 0.5 ? -0.28 : 0.28;
  const c = (v) => Math.max(0, Math.min(1, v + d));
  return [c(r), c(g), c(b)];
};

export default function Dino3D({ species, bodyColor, bellyColor, hornColor, pattern = "default", className = "" }) {
  const mountRef = useRef(null);
  const refs = useRef({});

  const applyColors = (r) => {
    if (!r || !r.geo) return;
    const body = hexRgb(bodyColor);
    const bly = hexRgb(bellyColor);
    const acc = accentOf(bodyColor);
    const pos = r.geo.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);
    const striped = pattern === "brindle";
    for (let i = 0; i < count; i++) {
      const f = r.belly[i];
      let cr = body[0] * (1 - f) + bly[0] * f;
      let cg = body[1] * (1 - f) + bly[1] * f;
      let cb = body[2] * (1 - f) + bly[2] * f;
      if (striped) {
        const top = 1 - f;
        const x = pos.getX(i);
        const band = Math.max(0, Math.sin(x * 1.4) * 0.5 + 0.5 - 0.5) / 0.5;
        const s = Math.min(1, band) * top;
        cr = cr * (1 - s) + acc[0] * s;
        cg = cg * (1 - s) + acc[1] * s;
        cb = cb * (1 - s) + acc[2] * s;
      }
      colors[i * 3] = cr;
      colors[i * 3 + 1] = cg;
      colors[i * 3 + 2] = cb;
    }
    r.geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    r.geo.attributes.color.needsUpdate = true;
    r.bodyMat.color.set(bodyColor);
    r.bellyMat.color.set(bellyColor);
    r.hornMat.color.set(hornColor);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const morph = morphFor(species);
    const fam = FAMILIES[morph.family];
    const spine = spineFor(morph);
    const features = morph.features || [];

    const scene = new THREE.Scene();
    const k = 0.55 + 0.6 * morph.scale;
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(7 * k, 3 * k, 11 * k);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 1.2, 0);
    controls.minDistance = 4 * k;
    controls.maxDistance = 26 * k;

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.DirectionalLight(0xfff1dd, 1.1);
    key.position.set(6, 9, 5);
    scene.add(key);
    const rimPink = new THREE.DirectionalLight(0xff2e7b, 0.7);
    rimPink.position.set(-9, 3, -6);
    scene.add(rimPink);
    const rimBlue = new THREE.DirectionalLight(0x66aaff, 0.55);
    rimBlue.position.set(5, -1, -9);
    scene.add(rimBlue);

    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8, side: THREE.DoubleSide });
    const bellyMat = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.9 });
    const hornMat = new THREE.MeshStandardMaterial({ color: hornColor, roughness: 0.35, metalness: 0.15 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0f0d, roughness: 0.25 });
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    const M = { bodyMat, bellyMat, hornMat, eyeMat };
    refs.current = { ...refs.current, bodyMat, bellyMat, hornMat };

    const dino = new THREE.Group();
    dino.scale.setScalar(morph.scale);
    dino.position.y = -fam.ground;
    scene.add(dino);

    const add = (geo, mat, pos, rot, scale) => {
      const mesh = new THREE.Mesh(geo, mat);
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      if (scale) mesh.scale.set(...scale);
      dino.add(mesh);
      return mesh;
    };

    // ---- Swept spine body with per-vertex belly zone -------------------
    const RADIAL = 28;
    const positions = [];
    const bellyFactor = [];
    for (const p of spine) {
      for (let j = 0; j < RADIAL; j++) {
        const th = (j / RADIAL) * Math.PI * 2;
        positions.push(p.x, p.y + Math.cos(th) * p.r, Math.sin(th) * p.r * 0.88);
        const bottom = Math.max(0, -Math.cos(th));
        bellyFactor.push(Math.min(1, Math.max(0, (bottom - 0.25) / 0.45)));
      }
    }
    const R = spine.length;
    const indices = [];
    for (let i = 0; i < R - 1; i++) {
      for (let j = 0; j < RADIAL; j++) {
        const a = i * RADIAL + j;
        const b = i * RADIAL + ((j + 1) % RADIAL);
        const c = (i + 1) * RADIAL + j;
        const d = (i + 1) * RADIAL + ((j + 1) % RADIAL);
        indices.push(a, b, d, a, d, c);
      }
    }
    const tipIndex = positions.length / 3;
    positions.push(spine[0].x - 0.25, spine[0].y, 0);
    bellyFactor.push(0);
    for (let j = 0; j < RADIAL; j++) indices.push(tipIndex, j, (j + 1) % RADIAL);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const sweepMat = new THREE.MeshStandardMaterial({ roughness: 0.78, vertexColors: true, side: THREE.DoubleSide });
    refs.current = { ...refs.current, geo, belly: bellyFactor };
    dino.add(new THREE.Mesh(geo, sweepMat));

    // ---- Head at the spine's end ---------------------------------------
    const base = spine[spine.length - 1];
    const hx = base.x;
    const hy = base.y;
    const hs = morph.headScale || 1;
    const variant = morph.head || (morph.beak ? "beak" : "theropod");

    if (variant === "frill") {
      add(new THREE.SphereGeometry(0.7 * hs, 20, 16), bodyMat, [hx + 0.7 * hs, hy + 0.4 * hs, 0]);
      add(new THREE.SphereGeometry(0.85 * hs, 20, 16), bodyMat, [hx + 0.25 * hs, hy + 0.85 * hs, 0], null, [0.25, 1.05, 0.95]);
      if (features.includes("frillHorns")) {
        add(new THREE.ConeGeometry(0.12 * hs, 0.5 * hs, 8), hornMat, [hx + 0.15 * hs, hy + 1.6 * hs, 0.3 * hs], [0, 0, -0.3]);
        add(new THREE.ConeGeometry(0.12 * hs, 0.5 * hs, 8), hornMat, [hx + 0.15 * hs, hy + 1.6 * hs, -0.3 * hs], [0, 0, -0.3]);
      }
      add(new THREE.BoxGeometry(0.9 * hs, 0.5 * hs, 0.55 * hs), bodyMat, [hx + 1.5 * hs, hy + 0.35 * hs, 0]);
      add(new THREE.ConeGeometry(0.25 * hs, 0.45 * hs, 10), hornMat, [hx + 2.0 * hs, hy + 0.3 * hs, 0], [0, 0, -Math.PI / 2]);
      add(new THREE.ConeGeometry(0.2 * hs, 0.85 * hs, 10), hornMat, [hx + 0.65 * hs, hy + 1.0 * hs, 0.35 * hs], [0, 0, -0.4]);
      add(new THREE.ConeGeometry(0.2 * hs, 0.85 * hs, 10), hornMat, [hx + 0.65 * hs, hy + 1.0 * hs, -0.35 * hs], [0, 0, -0.4]);
      add(new THREE.ConeGeometry(0.15 * hs, 0.45 * hs, 8), hornMat, [hx + 1.55 * hs, hy + 0.75 * hs, 0], [0, 0, -0.2]);
      add(new THREE.SphereGeometry(0.1 * hs, 10, 10), eyeMat, [hx + 1.0 * hs, hy + 0.55 * hs, 0.4 * hs]);
      add(new THREE.SphereGeometry(0.1 * hs, 10, 10), eyeMat, [hx + 1.0 * hs, hy + 0.55 * hs, -0.4 * hs]);
    } else if (variant === "dome") {
      add(new THREE.SphereGeometry(0.55 * hs, 20, 16), bodyMat, [hx + 0.75 * hs, hy + 0.3 * hs, 0]);
      add(new THREE.SphereGeometry(0.32 * hs, 16, 12), hornMat, [hx + 0.6 * hs, hy + 0.7 * hs, 0]);
      add(new THREE.BoxGeometry(0.8 * hs, 0.35 * hs, 0.4 * hs), bodyMat, [hx + 1.3 * hs, hy + 0.25 * hs, 0]);
      add(new THREE.SphereGeometry(0.09 * hs, 10, 10), eyeMat, [hx + 0.9 * hs, hy + 0.4 * hs, 0.32 * hs]);
      add(new THREE.SphereGeometry(0.09 * hs, 10, 10), eyeMat, [hx + 0.9 * hs, hy + 0.4 * hs, -0.32 * hs]);
    } else if (variant === "croc") {
      add(new THREE.SphereGeometry(0.5, 20, 16), bodyMat, [hx + 0.4, hy + 0.3, 0]);
      add(new THREE.BoxGeometry(2.2, 0.4, 0.55), bodyMat, [hx + 1.5, hy + 0.3, 0]);
      add(new THREE.BoxGeometry(2.0, 0.16, 0.45), bellyMat, [hx + 1.45, hy + 0.08, 0]);
      for (let t = 0; t < 6; t++) {
        add(new THREE.ConeGeometry(0.04, 0.16, 6), hornMat, [hx + 0.7 + t * 0.28, hy + 0.12, 0.25], [Math.PI, 0, 0]);
        add(new THREE.ConeGeometry(0.04, 0.16, 6), hornMat, [hx + 0.7 + t * 0.28, hy + 0.12, -0.25], [Math.PI, 0, 0]);
      }
      add(new THREE.SphereGeometry(0.08, 10, 10), eyeMat, [hx + 0.45, hy + 0.62, 0.22]);
      add(new THREE.SphereGeometry(0.08, 10, 10), eyeMat, [hx + 0.45, hy + 0.62, -0.22]);
    } else if (variant === "pterosaur") {
      add(new THREE.SphereGeometry(0.45, 20, 16), bodyMat, [hx + 0.5, hy + 0.3, 0]);
      add(new THREE.ConeGeometry(0.22, 1.0, 10), bodyMat, [hx + 0.3, hy + 0.6, 0], [0, 0, 0.55]);
      add(new THREE.BoxGeometry(1.3, 0.15, 0.26), hornMat, [hx + 1.25, hy + 0.28, 0]);
      add(new THREE.SphereGeometry(0.07, 10, 10), eyeMat, [hx + 0.6, hy + 0.42, 0.22]);
      add(new THREE.SphereGeometry(0.07, 10, 10), eyeMat, [hx + 0.6, hy + 0.42, -0.22]);
    } else if (variant === "beak") {
      add(new THREE.SphereGeometry(0.5 * hs, 20, 16), bodyMat, [hx + 0.8 * hs, hy + 0.35 * hs, 0]);
      add(new THREE.BoxGeometry(0.9 * hs, 0.4 * hs, 0.45 * hs), bodyMat, [hx + 1.35 * hs, hy + 0.3 * hs, 0]);
      add(new THREE.ConeGeometry(0.22 * hs, 0.5 * hs, 10), hornMat, [hx + 1.85 * hs, hy + 0.28 * hs, 0], [0, 0, -Math.PI / 2]);
      add(new THREE.SphereGeometry(0.09 * hs, 10, 10), eyeMat, [hx + 0.75 * hs, hy + 0.55 * hs, 0.3 * hs]);
      add(new THREE.SphereGeometry(0.09 * hs, 10, 10), eyeMat, [hx + 0.75 * hs, hy + 0.55 * hs, -0.3 * hs]);
    } else {
      // theropod head
      add(new THREE.SphereGeometry(0.75 * hs, 24, 18), bodyMat, [hx + 1.1 * hs, hy + 0.3 * hs, 0], null, [1.25, 0.75, 0.8]);
      add(new THREE.BoxGeometry(1.7 * hs, 0.6 * hs, 0.65 * hs), bodyMat, [hx + 2.0 * hs, hy + 0.25 * hs, 0]);
      add(new THREE.BoxGeometry(1.5 * hs, 0.22 * hs, 0.55 * hs), bellyMat, [hx + 1.95 * hs, hy - 0.1 * hs, 0]);
      for (let t = 0; t < 5; t++) {
        add(new THREE.ConeGeometry(0.05 * hs, 0.22 * hs, 6), hornMat, [hx + (1.55 + t * 0.25) * hs, hy + 0.05 * hs, 0.28 * hs], [Math.PI, 0, 0]);
        add(new THREE.ConeGeometry(0.05 * hs, 0.22 * hs, 6), hornMat, [hx + (1.55 + t * 0.25) * hs, hy + 0.05 * hs, -0.28 * hs], [Math.PI, 0, 0]);
      }
      add(new THREE.SphereGeometry(0.11 * hs, 12, 12), eyeMat, [hx + 0.95 * hs, hy + 0.55 * hs, 0.42 * hs]);
      add(new THREE.SphereGeometry(0.11 * hs, 12, 12), eyeMat, [hx + 0.95 * hs, hy + 0.55 * hs, -0.42 * hs]);
      if (features.includes("crests")) {
        add(new THREE.ConeGeometry(0.18 * hs, 0.85 * hs, 10), hornMat, [hx + 0.5 * hs, hy + 0.8 * hs, 0.22 * hs], [0, 0, -0.2]);
        add(new THREE.ConeGeometry(0.18 * hs, 0.85 * hs, 10), hornMat, [hx + 0.5 * hs, hy + 0.8 * hs, -0.22 * hs], [0, 0, -0.2]);
      }
      if (features.includes("nasalHorn")) {
        add(new THREE.ConeGeometry(0.12 * hs, 0.35 * hs, 8), hornMat, [hx + 1.7 * hs, hy + 0.6 * hs, 0], [0, 0, -0.3]);
      }
      if (features.includes("browHorns")) {
        add(new THREE.ConeGeometry(0.14 * hs, 0.45 * hs, 8), hornMat, [hx + 0.95 * hs, hy + 0.75 * hs, 0.42 * hs], [0, 0, -0.5]);
        add(new THREE.ConeGeometry(0.14 * hs, 0.45 * hs, 8), hornMat, [hx + 0.95 * hs, hy + 0.75 * hs, -0.42 * hs], [0, 0, -0.5]);
      }
    }
    if (features.includes("crest") && variant !== "theropod") {
      add(new THREE.ConeGeometry(0.16, 0.6, 8), hornMat, [hx + 0.2, hy + 0.9, 0], [0, 0, 0.5]);
    }

    // ---- Legs ------------------------------------------------------------
    const addLeg = (L, z) => {
      add(new THREE.CapsuleGeometry(L.tr, L.tl, 6, 12), bodyMat, [L.hx, L.thy, z], [0, 0, L.tilt || 0]);
      add(new THREE.CapsuleGeometry(L.sr, L.sl, 6, 12), bodyMat, [L.sx, L.sy, z]);
      add(new THREE.BoxGeometry(L.fl, L.fh, L.fw), bodyMat, [L.fx, L.fy, z]);
      for (const tz of L.toeZ) {
        add(new THREE.CapsuleGeometry(L.toeR, L.toeL, 4, 8), bodyMat, [L.tx, L.fy, z + tz], [0, 0, Math.PI / 2]);
        add(new THREE.ConeGeometry(L.clawR, L.clawL, 8), hornMat, [L.cx, L.fy + 0.03, z + tz], [0, 0, -Math.PI / 2]);
      }
    };
    const LEGS = {
      theropod: { zs: [0.95, -0.95], leg: { hx: -1.1, thy: -1.7, tilt: 0.25, tr: 0.55, tl: 1.3, sx: -0.75, sy: -3.0, sr: 0.3, sl: 1.5, fx: -0.3, fy: -4.05, fl: 1.4, fh: 0.3, fw: 0.8, tx: 0.05, cx: 0.45, toeZ: [-0.25, 0, 0.25], toeR: 0.11, toeL: 0.5, clawR: 0.08, clawL: 0.3 } },
      quadRear: { zs: [0.95, -0.95], leg: { hx: -1.2, thy: -1.3, tilt: 0.2, tr: 0.5, tl: 1.0, sx: -1.0, sy: -2.1, sr: 0.27, sl: 0.9, fx: -0.7, fy: -2.45, fl: 1.1, fh: 0.28, fw: 0.7, tx: -0.05, cx: 0.25, toeZ: [-0.22, 0, 0.22], toeR: 0.1, toeL: 0.35, clawR: 0.07, clawL: 0.26 } },
      quadFront: { zs: [0.75, -0.75], leg: { hx: 1.3, thy: -1.25, tilt: 0.15, tr: 0.42, tl: 0.9, sx: 1.1, sy: -2.05, sr: 0.24, sl: 0.9, fx: 1.75, fy: -2.45, fl: 1.0, fh: 0.26, fw: 0.65, tx: 2.4, cx: 2.65, toeZ: [-0.2, 0, 0.2], toeR: 0.09, toeL: 0.3, clawR: 0.06, clawL: 0.24 } },
      crocRear: { zs: [0.6, -0.6], leg: { hx: -2.0, thy: -0.6, tilt: 0, tr: 0.2, tl: 0.4, sx: -2.05, sy: -1.05, sr: 0.13, sl: 0.4, fx: -2.1, fy: -1.4, fl: 0.7, fh: 0.16, fw: 0.4, tx: -1.8, cx: -1.6, toeZ: [-0.14, 0, 0.14], toeR: 0.07, toeL: 0.2, clawR: 0.05, clawL: 0.15 } },
      crocFront: { zs: [0.55, -0.55], leg: { hx: 1.8, thy: -0.55, tilt: 0, tr: 0.18, tl: 0.4, sx: 1.75, sy: -1.0, sr: 0.12, sl: 0.4, fx: 1.7, fy: -1.35, fl: 0.65, fh: 0.16, fw: 0.38, tx: 2.0, cx: 2.2, toeZ: [-0.13, 0, 0.13], toeR: 0.07, toeL: 0.2, clawR: 0.05, clawL: 0.15 } },
      ptero: { zs: [0.3, -0.3], leg: { hx: 0.4, thy: 0.6, tilt: 0, tr: 0.13, tl: 0.5, sx: 0.3, sy: -0.25, sr: 0.09, sl: 0.7, fx: 0.2, fy: -1.2, fl: 0.45, fh: 0.14, fw: 0.28, tx: 0.55, cx: 0.75, toeZ: [0], toeR: 0.06, toeL: 0.15, clawR: 0.05, clawL: 0.12 } },
    };
    const legSets = {
      theropod: [LEGS.theropod],
      quadruped: [LEGS.quadRear, LEGS.quadFront],
      croc: [LEGS.crocRear, LEGS.crocFront],
      pterosaur: [LEGS.ptero],
    };
    for (const set of legSets[morph.family]) {
      for (const z of set.zs) addLeg(set.leg, z);
    }

    // ---- Arms for bipeds --------------------------------------------------
    if (morph.family === "theropod") {
      const arm = morph.arms === "tiny" ? [0.13, 0.4] : [0.16, 0.6];
      for (const z of [0.7, -0.7]) {
        add(new THREE.CapsuleGeometry(arm[0], arm[1], 4, 10), bodyMat, [2.2, 0.4, z], [0, 0, 0.9]);
        add(new THREE.ConeGeometry(0.06, 0.25, 8), hornMat, [2.55, -0.05, z], [0, 0, -Math.PI / 2]);
      }
    }

    // ---- Plates / spikes for thyreophorans --------------------------------
    if (features.includes("plates") || features.includes("spikes")) {
      const spikeMode = features.includes("spikes");
      for (let i = 0; i < 8; i++) {
        const x = -4.0 + i * 0.75;
        const h = spikeMode ? (i % 2 ? 0.5 : 0.9) : i % 2 ? 0.7 : 1.1;
        const mesh = add(new THREE.ConeGeometry(h * 0.55, h, 4), hornMat, [x, topAt(spine, x) - 0.2 + h * 0.35, 0]);
        mesh.scale.z = spikeMode ? 0.5 : 0.18;
      }
      if (features.includes("tailSpikes")) {
        for (const s of [1, -1]) {
          add(new THREE.ConeGeometry(0.16, 0.9, 8), hornMat, [-6.3, topAt(spine, -6.3) + 0.2, 0.4 * s], [0, 0, 0.9]);
        }
      }
    }

    // ---- Spread wings for the Pteranodon ----------------------------------
    if (morph.family === "pterosaur") {
      const addMembrane = (a, b, c) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
        g.setIndex([0, 1, 2]);
        g.computeVertexNormals();
        dino.add(new THREE.Mesh(g, bodyMat));
      };
      for (const s of [1, -1]) {
        addMembrane([1.8, 1.9, 0.35 * s], [-0.4, 2.9, 3.6 * s], [1.0, 1.0, 2.0 * s]);
        const a = new THREE.Vector3(1.8, 1.9, 0.35 * s);
        const b = new THREE.Vector3(-0.4, 2.8, 3.4 * s);
        const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, a.distanceTo(b), 4, 8), bodyMat);
        bone.position.copy(a).lerp(b, 0.5);
        bone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        dino.add(bone);
      }
    }

    // Soft ground shadow
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(fam.shadowR * morph.scale, 32), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -0.02;
    scene.add(shadow);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    applyColors(refs.current);

    let raf;
    const tick = (t) => {
      dino.position.y = -fam.ground + Math.sin(t / 900) * 0.1;
      dino.rotation.y = Math.sin(t / 4500) * 0.05;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [species]);

  useEffect(() => {
    applyColors(refs.current);
  }, [bodyColor, bellyColor, hornColor, pattern]);

  return <div ref={mountRef} className={className} style={{ cursor: "grab" }} />;
}