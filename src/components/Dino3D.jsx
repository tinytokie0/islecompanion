import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Realistic 3D Evrima species display. Theropods (rex, raptors, carno, dilo...)
// use a fully rigged, ANIMATED model: swinging legs with a walk cycle, a
// swaying segmented tail, breathing chest, bobbing head and a jaw that snaps
// open — not a static blob. Ceratopsians, stegosaurs, the Pteranodon and the
// Deinosuchus keep their swept-body display. All body plans take the zone
// colors (body/flank, belly, horns/claws) live; drag to orbit, scroll to zoom.

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

// ---- swept body spines for the non-theropod display ------------------------
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

function spineFor(m) {
  if (m.family === "quadruped") return QUAD;
  if (m.family === "croc") return CROC;
  if (m.family === "pterosaur") return PTERO;
  return QUAD;
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
const accentHex = (hex) => {
  const [r, g, b] = accentOf(hex);
  const c = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
};

export default function Dino3D({ species, bodyColor, bellyColor, hornColor, pattern = "default", className = "" }) {
  const mountRef = useRef(null);
  const matsRef = useRef(null);
  const legacyRef = useRef(null); // { geo, belly } for the swept-body vertex colors
  const stripesRef = useRef([]); // brindle stripe meshes

  // Live color updates: materials + (legacy) vertex colors + stripe visibility
  useEffect(() => {
    const m = matsRef.current;
    if (!m) return;
    m.bodyMat.color.set(bodyColor);
    m.bellyMat.color.set(bellyColor);
    m.hornMat.color.set(hornColor);
    m.stripeMat.color.set(accentHex(bodyColor));
    const brindle = pattern === "brindle";
    for (const s of stripesRef.current) s.visible = brindle;

    const l = legacyRef.current;
    if (l && l.geo) {
      const body = hexRgb(bodyColor);
      const bly = hexRgb(bellyColor);
      const acc = accentOf(bodyColor);
      const pos = l.geo.attributes.position;
      const count = pos.count;
      const colors = new Float32Array(count * 3);
      const striped = pattern === "brindle";
      for (let i = 0; i < count; i++) {
        const f = l.belly[i];
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
      l.geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      l.geo.attributes.color.needsUpdate = true;
    }
  }, [bodyColor, bellyColor, hornColor, pattern]);

  // Build the scene for the current species
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const morph = morphFor(species);
    const scene = new THREE.Scene();
    const isRig = morph.family === "theropod";
    const s = morph.scale;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

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
    const stripeMat = new THREE.MeshStandardMaterial({ color: accentHex(bodyColor), roughness: 0.85 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0f0d, roughness: 0.25 });
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    matsRef.current = { bodyMat, bellyMat, hornMat, stripeMat };
    stripesRef.current = [];
    legacyRef.current = null;

    const root = new THREE.Group();
    scene.add(root);

    const add = (parent, geo, mat, pos, rot, scale) => {
      const mesh = new THREE.Mesh(geo, mat);
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      if (scale) mesh.scale.set(...scale);
      parent.add(mesh);
      return mesh;
    };

    const anim = { mode: "legacy" };

    if (isRig) {
      // ================= RIGGED, ANIMATED THEROPOD =================
      camera.position.set(8.5 * s, 3.6 * s, 11.5 * s);
      controls.target.set(0.8 * s, 2.6 * s, 0);
      controls.minDistance = 5 * s;
      controls.maxDistance = 32 * s;

      root.scale.setScalar(s);

      // Pelvis / torso
      const pelvis = new THREE.Group();
      pelvis.position.set(0, 2.75, 0);
      root.add(pelvis);
      add(pelvis, new THREE.SphereGeometry(1.0, 24, 18), bodyMat, [0, 0.35, 0], null, [1.1, 1.05, 0.85]);
      const chest = add(pelvis, new THREE.SphereGeometry(1.05, 24, 18), bodyMat, [1.35, 0.5, 0], null, [1.0, 1.1, 0.9]);
      // Belly underside
      add(pelvis, new THREE.SphereGeometry(0.9, 20, 14), bellyMat, [0.5, -0.25, 0], null, [1.35, 0.5, 0.72]);

      // Neck + head
      const longNeck = morph.neck === "long";
      const neckLen = longNeck ? 1.35 : 1.0;
      const neckBase = longNeck ? -1.0 : -0.85;
      const headBase = longNeck ? 1.0 : 0.8;
      const neckPivot = new THREE.Group();
      neckPivot.position.set(2.1, 0.85, 0);
      neckPivot.rotation.z = neckBase;
      pelvis.add(neckPivot);
      add(neckPivot, new THREE.CapsuleGeometry(0.3, neckLen, 6, 12), bodyMat, [0, neckLen / 2, 0]);
      const headPivot = new THREE.Group();
      headPivot.position.y = neckLen;
      headPivot.rotation.z = headBase;
      neckPivot.add(headPivot);

      const hs = morph.headScale || 1;
      const variant = morph.head || (morph.beak ? "beak" : "theropod");

      if (variant === "beak") {
        add(headPivot, new THREE.SphereGeometry(0.5 * hs, 20, 16), bodyMat, [0.75 * hs, 0.35 * hs, 0]);
        add(headPivot, new THREE.BoxGeometry(0.9 * hs, 0.4 * hs, 0.45 * hs), bodyMat, [1.3 * hs, 0.3 * hs, 0]);
        add(headPivot, new THREE.ConeGeometry(0.22 * hs, 0.5 * hs, 10), hornMat, [1.85 * hs, 0.28 * hs, 0], [0, 0, -Math.PI / 2]);
        const jaw = new THREE.Group();
        jaw.position.set(0.55 * hs, -0.02 * hs, 0);
        headPivot.add(jaw);
        add(jaw, new THREE.BoxGeometry(0.85 * hs, 0.2 * hs, 0.4 * hs), bellyMat, [0.8 * hs, -0.08 * hs, 0]);
        add(headPivot, new THREE.SphereGeometry(0.08 * hs, 10, 10), eyeMat, [0.7 * hs, 0.5 * hs, 0.28 * hs]);
        add(headPivot, new THREE.SphereGeometry(0.08 * hs, 10, 10), eyeMat, [0.7 * hs, 0.5 * hs, -0.28 * hs]);
        anim.jaw = jaw;
      } else if (variant === "dome") {
        add(headPivot, new THREE.SphereGeometry(0.55 * hs, 20, 16), bodyMat, [0.75 * hs, 0.3 * hs, 0]);
        add(headPivot, new THREE.SphereGeometry(0.3 * hs, 16, 12), hornMat, [0.6 * hs, 0.7 * hs, 0]);
        add(headPivot, new THREE.BoxGeometry(0.8 * hs, 0.35 * hs, 0.4 * hs), bodyMat, [1.3 * hs, 0.25 * hs, 0]);
        const jaw = new THREE.Group();
        jaw.position.set(0.6 * hs, -0.05 * hs, 0);
        headPivot.add(jaw);
        add(jaw, new THREE.BoxGeometry(0.75 * hs, 0.2 * hs, 0.36 * hs), bellyMat, [0.7 * hs, -0.08 * hs, 0]);
        add(headPivot, new THREE.SphereGeometry(0.08 * hs, 10, 10), eyeMat, [0.85 * hs, 0.4 * hs, 0.26 * hs]);
        add(headPivot, new THREE.SphereGeometry(0.08 * hs, 10, 10), eyeMat, [0.85 * hs, 0.4 * hs, -0.26 * hs]);
        anim.jaw = jaw;
      } else {
        // True theropod skull: deep skull, boxy snout, toothed jaws
        add(headPivot, new THREE.SphereGeometry(0.72 * hs, 22, 16), bodyMat, [0.95 * hs, 0.25 * hs, 0], null, [1.25, 0.72, 0.78]);
        add(headPivot, new THREE.BoxGeometry(1.5 * hs, 0.55 * hs, 0.6 * hs), bodyMat, [1.7 * hs, 0.2 * hs, 0]);
        add(headPivot, new THREE.BoxGeometry(0.5 * hs, 0.25 * hs, 0.66 * hs), bodyMat, [0.8 * hs, 0.55 * hs, 0]);
        // Upper teeth (pointing down)
        for (let t = 0; t < 6; t++) {
          const tx = (1.05 + t * 0.25) * hs;
          add(headPivot, new THREE.ConeGeometry(0.045 * hs, 0.18 * hs, 6), hornMat, [tx, -0.08 * hs, 0.27 * hs], [Math.PI, 0, 0]);
          add(headPivot, new THREE.ConeGeometry(0.045 * hs, 0.18 * hs, 6), hornMat, [tx, -0.08 * hs, -0.27 * hs], [Math.PI, 0, 0]);
        }
        // Lower jaw
        const jaw = new THREE.Group();
        jaw.position.set(0.55 * hs, -0.05 * hs, 0);
        headPivot.add(jaw);
        add(jaw, new THREE.BoxGeometry(1.45 * hs, 0.22 * hs, 0.5 * hs), bellyMat, [0.85 * hs, -0.1 * hs, 0]);
        for (let t = 0; t < 5; t++) {
          const tx = (0.5 + t * 0.25) * hs;
          add(jaw, new THREE.ConeGeometry(0.04 * hs, 0.15 * hs, 6), hornMat, [tx, 0.05 * hs, 0.22 * hs]);
          add(jaw, new THREE.ConeGeometry(0.04 * hs, 0.15 * hs, 6), hornMat, [tx, 0.05 * hs, -0.22 * hs]);
        }
        add(headPivot, new THREE.SphereGeometry(0.11 * hs, 12, 12), eyeMat, [0.55 * hs, 0.45 * hs, 0.4 * hs]);
        add(headPivot, new THREE.SphereGeometry(0.11 * hs, 12, 12), eyeMat, [0.55 * hs, 0.45 * hs, -0.4 * hs]);
        const features = morph.features || [];
        if (features.includes("crests")) {
          add(headPivot, new THREE.ConeGeometry(0.16 * hs, 0.8 * hs, 10), hornMat, [0.5 * hs, 0.85 * hs, 0.2 * hs], [0, 0, -0.2]);
          add(headPivot, new THREE.ConeGeometry(0.16 * hs, 0.8 * hs, 10), hornMat, [0.5 * hs, 0.85 * hs, -0.2 * hs], [0, 0, -0.2]);
        }
        if (features.includes("nasalHorn")) {
          add(headPivot, new THREE.ConeGeometry(0.12 * hs, 0.35 * hs, 8), hornMat, [1.8 * hs, 0.6 * hs, 0], [0, 0, -0.3]);
        }
        if (features.includes("browHorns")) {
          add(headPivot, new THREE.ConeGeometry(0.14 * hs, 0.45 * hs, 8), hornMat, [0.8 * hs, 0.7 * hs, 0.42 * hs], [0, 0, -0.5]);
          add(headPivot, new THREE.ConeGeometry(0.14 * hs, 0.45 * hs, 8), hornMat, [0.8 * hs, 0.7 * hs, -0.42 * hs], [0, 0, -0.5]);
        }
        anim.jaw = jaw;
      }

      // Segmented tail (sways while walking)
      const tail = [];
      const tailRadii = [0.6, 0.48, 0.36, 0.25, 0.16, 0.09].map((r) => r * (morph.tail === "heavy" ? 1.25 : 1));
      let tailParent = pelvis;
      for (let i = 0; i < tailRadii.length; i++) {
        const g = new THREE.Group();
        if (i === 0) g.position.set(-0.95, 0.35, 0);
        else g.position.set(-0.8, 0, 0);
        tailParent.add(g);
        const r = tailRadii[i];
        add(g, new THREE.CapsuleGeometry(r, 0.6, 6, 14), bodyMat, [-0.35, 0, 0], [0, 0, Math.PI / 2]);
        if (i < 4) {
          const st = add(g, new THREE.BoxGeometry(0.16, 0.05, r * 1.7), stripeMat, [-0.35, r * 0.92, 0]);
          st.visible = pattern === "brindle";
          stripesRef.current.push(st);
        }
        tail.push(g);
        tailParent = g;
      }
      // Back stripes for brindle
      for (const [bx, by] of [[-0.7, 1.35], [0.1, 1.42], [0.9, 1.6], [1.7, 1.55]]) {
        const st = add(pelvis, new THREE.BoxGeometry(0.18, 0.06, 1.5), stripeMat, [bx, by, 0]);
        st.visible = pattern === "brindle";
        stripesRef.current.push(st);
      }

      // Legs: hip -> knee -> ankle -> foot with toes and claws
      const legs = [];
      for (const sgn of [1, -1]) {
        const thigh = new THREE.Group();
        thigh.position.set(-0.2, -0.5, 0.72 * sgn);
        pelvis.add(thigh);
        add(thigh, new THREE.CapsuleGeometry(0.4, 1.0, 6, 12), bodyMat, [0, -0.55, 0]);
        const knee = new THREE.Group();
        knee.position.y = -1.15;
        thigh.add(knee);
        add(knee, new THREE.CapsuleGeometry(0.2, 0.9, 6, 12), bodyMat, [0, -0.5, 0]);
        const ankle = new THREE.Group();
        ankle.position.y = -1.05;
        knee.add(ankle);
        add(ankle, new THREE.BoxGeometry(0.85, 0.2, 0.45), bodyMat, [0.2, -0.12, 0]);
        for (const tz of [-0.14, 0, 0.14]) {
          add(ankle, new THREE.CapsuleGeometry(0.08, 0.3, 4, 8), bodyMat, [0.62, -0.14, tz], [0, 0, Math.PI / 2]);
          add(ankle, new THREE.ConeGeometry(0.05, 0.16, 8), hornMat, [0.82, -0.14, tz], [0, 0, -Math.PI / 2]);
        }
        legs.push({ thigh, knee, ankle, phase: sgn > 0 ? 0 : Math.PI });
      }

      // Small arms
      const arms = [];
      const armLen = morph.arms === "tiny" ? 0.35 : 0.55;
      for (const sgn of [1, -1]) {
        const g = new THREE.Group();
        g.position.set(1.15, 0.45, 0.72 * sgn);
        pelvis.add(g);
        add(g, new THREE.CapsuleGeometry(0.09, armLen, 4, 8), bodyMat, [0, -armLen / 2, 0]);
        add(g, new THREE.SphereGeometry(0.1, 8, 8), bodyMat, [0, -armLen - 0.05, 0]);
        for (const cz of [-0.05, 0.05]) {
          add(g, new THREE.ConeGeometry(0.03, 0.12, 6), hornMat, [0, -armLen - 0.14, cz], [Math.PI, 0, 0]);
        }
        g.rotation.z = 0.5;
        arms.push(g);
      }

      // Ground shadow
      const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.2 * s, 32), shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.02;
      scene.add(shadow);

      anim.mode = "rig";
      anim.root = root;
      anim.pelvis = pelvis;
      anim.legs = legs;
      anim.tail = tail;
      anim.neck = neckPivot;
      anim.neckBase = neckBase;
      anim.head = headPivot;
      anim.headBase = headBase;
      anim.chest = chest;
      anim.arms = arms;
    } else {
      // ================= SWEPT-BODY DISPLAY (quadruped / croc / ptero) ========
      const fam = FAMILIES[morph.family];
      const spine = spineFor(morph);
      const features = morph.features || [];
      const k = 0.55 + 0.6 * morph.scale;
      camera.position.set(7 * k, 3 * k, 11 * k);
      controls.target.set(0, 1.2, 0);
      controls.minDistance = 4 * k;
      controls.maxDistance = 26 * k;

      const dino = new THREE.Group();
      dino.scale.setScalar(morph.scale);
      dino.position.y = -fam.ground;
      root.add(dino);

      // Swept spine body with per-vertex belly zone
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
      legacyRef.current = { geo, belly: bellyFactor };
      dino.add(new THREE.Mesh(geo, sweepMat));

      // Head at the spine's end
      const base = spine[spine.length - 1];
      const hx = base.x;
      const hy = base.y;
      const hs = morph.headScale || 1;
      const variant = morph.head || (morph.beak ? "beak" : "theropod");

      if (variant === "frill") {
        add(dino, new THREE.SphereGeometry(0.7 * hs, 20, 16), bodyMat, [hx + 0.7 * hs, hy + 0.4 * hs, 0]);
        add(dino, new THREE.SphereGeometry(0.85 * hs, 20, 16), bodyMat, [hx + 0.25 * hs, hy + 0.85 * hs, 0], null, [0.25, 1.05, 0.95]);
        if (features.includes("frillHorns")) {
          add(dino, new THREE.ConeGeometry(0.12 * hs, 0.5 * hs, 8), hornMat, [hx + 0.15 * hs, hy + 1.6 * hs, 0.3 * hs], [0, 0, -0.3]);
          add(dino, new THREE.ConeGeometry(0.12 * hs, 0.5 * hs, 8), hornMat, [hx + 0.15 * hs, hy + 1.6 * hs, -0.3 * hs], [0, 0, -0.3]);
        }
        add(dino, new THREE.BoxGeometry(0.9 * hs, 0.5 * hs, 0.55 * hs), bodyMat, [hx + 1.5 * hs, hy + 0.35 * hs, 0]);
        add(dino, new THREE.ConeGeometry(0.25 * hs, 0.45 * hs, 10), hornMat, [hx + 2.0 * hs, hy + 0.3 * hs, 0], [0, 0, -Math.PI / 2]);
        add(dino, new THREE.ConeGeometry(0.2 * hs, 0.85 * hs, 10), hornMat, [hx + 0.65 * hs, hy + 1.0 * hs, 0.35 * hs], [0, 0, -0.4]);
        add(dino, new THREE.ConeGeometry(0.2 * hs, 0.85 * hs, 10), hornMat, [hx + 0.65 * hs, hy + 1.0 * hs, -0.35 * hs], [0, 0, -0.4]);
        add(dino, new THREE.ConeGeometry(0.15 * hs, 0.45 * hs, 8), hornMat, [hx + 1.55 * hs, hy + 0.75 * hs, 0], [0, 0, -0.2]);
        add(dino, new THREE.SphereGeometry(0.1 * hs, 10, 10), eyeMat, [hx + 1.0 * hs, hy + 0.55 * hs, 0.4 * hs]);
        add(dino, new THREE.SphereGeometry(0.1 * hs, 10, 10), eyeMat, [hx + 1.0 * hs, hy + 0.55 * hs, -0.4 * hs]);
      } else if (variant === "croc") {
        add(dino, new THREE.SphereGeometry(0.5, 20, 16), bodyMat, [hx + 0.4, hy + 0.3, 0]);
        add(dino, new THREE.BoxGeometry(2.2, 0.4, 0.55), bodyMat, [hx + 1.5, hy + 0.3, 0]);
        add(dino, new THREE.BoxGeometry(2.0, 0.16, 0.45), bellyMat, [hx + 1.45, hy + 0.08, 0]);
        for (let t = 0; t < 6; t++) {
          add(dino, new THREE.ConeGeometry(0.04, 0.16, 6), hornMat, [hx + 0.7 + t * 0.28, hy + 0.12, 0.25], [Math.PI, 0, 0]);
          add(dino, new THREE.ConeGeometry(0.04, 0.16, 6), hornMat, [hx + 0.7 + t * 0.28, hy + 0.12, -0.25], [Math.PI, 0, 0]);
        }
        add(dino, new THREE.SphereGeometry(0.08, 10, 10), eyeMat, [hx + 0.45, hy + 0.62, 0.22]);
        add(dino, new THREE.SphereGeometry(0.08, 10, 10), eyeMat, [hx + 0.45, hy + 0.62, -0.22]);
      } else if (variant === "pterosaur") {
        add(dino, new THREE.SphereGeometry(0.45, 20, 16), bodyMat, [hx + 0.5, hy + 0.3, 0]);
        add(dino, new THREE.ConeGeometry(0.22, 1.0, 10), bodyMat, [hx + 0.3, hy + 0.6, 0], [0, 0, 0.55]);
        add(dino, new THREE.BoxGeometry(1.3, 0.15, 0.26), hornMat, [hx + 1.25, hy + 0.28, 0]);
        add(dino, new THREE.SphereGeometry(0.07, 10, 10), eyeMat, [hx + 0.6, hy + 0.42, 0.22]);
        add(dino, new THREE.SphereGeometry(0.07, 10, 10), eyeMat, [hx + 0.6, hy + 0.42, -0.22]);
      } else if (variant === "beak") {
        add(dino, new THREE.SphereGeometry(0.5 * hs, 20, 16), bodyMat, [hx + 0.8 * hs, hy + 0.35 * hs, 0]);
        add(dino, new THREE.BoxGeometry(0.9 * hs, 0.4 * hs, 0.45 * hs), bodyMat, [hx + 1.35 * hs, hy + 0.3 * hs, 0]);
        add(dino, new THREE.ConeGeometry(0.22 * hs, 0.5 * hs, 10), hornMat, [hx + 1.85 * hs, hy + 0.28 * hs, 0], [0, 0, -Math.PI / 2]);
        add(dino, new THREE.SphereGeometry(0.09 * hs, 10, 10), eyeMat, [hx + 0.75 * hs, hy + 0.55 * hs, 0.3 * hs]);
        add(dino, new THREE.SphereGeometry(0.09 * hs, 10, 10), eyeMat, [hx + 0.75 * hs, hy + 0.55 * hs, -0.3 * hs]);
      } else {
        add(dino, new THREE.SphereGeometry(0.75 * hs, 24, 18), bodyMat, [hx + 1.1 * hs, hy + 0.3 * hs, 0], null, [1.25, 0.75, 0.8]);
        add(dino, new THREE.BoxGeometry(1.7 * hs, 0.6 * hs, 0.65 * hs), bodyMat, [hx + 2.0 * hs, hy + 0.25 * hs, 0]);
        add(dino, new THREE.BoxGeometry(1.5 * hs, 0.22 * hs, 0.55 * hs), bellyMat, [hx + 1.95 * hs, hy - 0.1 * hs, 0]);
        for (let t = 0; t < 5; t++) {
          add(dino, new THREE.ConeGeometry(0.05 * hs, 0.22 * hs, 6), hornMat, [hx + (1.55 + t * 0.25) * hs, hy + 0.05 * hs, 0.28 * hs], [Math.PI, 0, 0]);
          add(dino, new THREE.ConeGeometry(0.05 * hs, 0.22 * hs, 6), hornMat, [hx + (1.55 + t * 0.25) * hs, hy + 0.05 * hs, -0.28 * hs], [Math.PI, 0, 0]);
        }
        add(dino, new THREE.SphereGeometry(0.11 * hs, 12, 12), eyeMat, [hx + 0.95 * hs, hy + 0.55 * hs, 0.42 * hs]);
        add(dino, new THREE.SphereGeometry(0.11 * hs, 12, 12), eyeMat, [hx + 0.95 * hs, hy + 0.55 * hs, -0.42 * hs]);
      }
      if (features.includes("crest") && variant !== "theropod") {
        add(dino, new THREE.ConeGeometry(0.16, 0.6, 8), hornMat, [hx + 0.2, hy + 0.9, 0], [0, 0, 0.5]);
      }

      // Legs
      const LEGS = {
        quadRear: { zs: [0.95, -0.95], leg: { hx: -1.2, thy: -1.3, tilt: 0.2, tr: 0.5, tl: 1.0, sx: -1.0, sy: -2.1, sr: 0.27, sl: 0.9, fx: -0.7, fy: -2.45, fl: 1.1, fh: 0.28, fw: 0.7, tx: -0.05, cx: 0.25, toeZ: [-0.22, 0, 0.22], toeR: 0.1, toeL: 0.35, clawR: 0.07, clawL: 0.26 } },
        quadFront: { zs: [0.75, -0.75], leg: { hx: 1.3, thy: -1.25, tilt: 0.15, tr: 0.42, tl: 0.9, sx: 1.1, sy: -2.05, sr: 0.24, sl: 0.9, fx: 1.75, fy: -2.45, fl: 1.0, fh: 0.26, fw: 0.65, tx: 2.4, cx: 2.65, toeZ: [-0.2, 0, 0.2], toeR: 0.09, toeL: 0.3, clawR: 0.06, clawL: 0.24 } },
        crocRear: { zs: [0.6, -0.6], leg: { hx: -2.0, thy: -0.6, tilt: 0, tr: 0.2, tl: 0.4, sx: -2.05, sy: -1.05, sr: 0.13, sl: 0.4, fx: -2.1, fy: -1.4, fl: 0.7, fh: 0.16, fw: 0.4, tx: -1.8, cx: -1.6, toeZ: [-0.14, 0, 0.14], toeR: 0.07, toeL: 0.2, clawR: 0.05, clawL: 0.15 } },
        crocFront: { zs: [0.55, -0.55], leg: { hx: 1.8, thy: -0.55, tilt: 0, tr: 0.18, tl: 0.4, sx: 1.75, sy: -1.0, sr: 0.12, sl: 0.4, fx: 1.7, fy: -1.35, fl: 0.65, fh: 0.16, fw: 0.38, tx: 2.0, cx: 2.2, toeZ: [-0.13, 0, 0.13], toeR: 0.07, toeL: 0.2, clawR: 0.05, clawL: 0.15 } },
        ptero: { zs: [0.3, -0.3], leg: { hx: 0.4, thy: 0.6, tilt: 0, tr: 0.13, tl: 0.5, sx: 0.3, sy: -0.25, sr: 0.09, sl: 0.7, fx: 0.2, fy: -1.2, fl: 0.45, fh: 0.14, fw: 0.28, tx: 0.55, cx: 0.75, toeZ: [0], toeR: 0.06, toeL: 0.15, clawR: 0.05, clawL: 0.12 } },
      };
      const legSets = {
        quadruped: [LEGS.quadRear, LEGS.quadFront],
        croc: [LEGS.crocRear, LEGS.crocFront],
        pterosaur: [LEGS.ptero],
      };
      const addLeg = (L, z) => {
        add(dino, new THREE.CapsuleGeometry(L.tr, L.tl, 6, 12), bodyMat, [L.hx, L.thy, z], [0, 0, L.tilt || 0]);
        add(dino, new THREE.CapsuleGeometry(L.sr, L.sl, 6, 12), bodyMat, [L.sx, L.sy, z]);
        add(dino, new THREE.BoxGeometry(L.fl, L.fh, L.fw), bodyMat, [L.fx, L.fy, z]);
        for (const tz of L.toeZ) {
          add(dino, new THREE.CapsuleGeometry(L.toeR, L.toeL, 4, 8), bodyMat, [L.tx, L.fy, z + tz], [0, 0, Math.PI / 2]);
          add(dino, new THREE.ConeGeometry(L.clawR, L.clawL, 8), hornMat, [L.cx, L.fy + 0.03, z + tz], [0, 0, -Math.PI / 2]);
        }
      };
      for (const set of legSets[morph.family]) {
        for (const z of set.zs) addLeg(set.leg, z);
      }

      // Plates / spikes for thyreophorans
      if (features.includes("plates") || features.includes("spikes")) {
        const spikeMode = features.includes("spikes");
        for (let i = 0; i < 8; i++) {
          const x = -4.0 + i * 0.75;
          const h = spikeMode ? (i % 2 ? 0.5 : 0.9) : i % 2 ? 0.7 : 1.1;
          const mesh = add(dino, new THREE.ConeGeometry(h * 0.55, h, 4), hornMat, [x, topAt(spine, x) - 0.2 + h * 0.35, 0]);
          mesh.scale.z = spikeMode ? 0.5 : 0.18;
        }
        if (features.includes("tailSpikes")) {
          for (const sz of [1, -1]) {
            add(dino, new THREE.ConeGeometry(0.16, 0.9, 8), hornMat, [-6.3, topAt(spine, -6.3) + 0.2, 0.4 * sz], [0, 0, 0.9]);
          }
        }
      }

      // Spread wings for the Pteranodon
      if (morph.family === "pterosaur") {
        const addMembrane = (a, b, c) => {
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute([...a, ...b, ...c], 3));
          g.setIndex([0, 1, 2]);
          g.computeVertexNormals();
          dino.add(new THREE.Mesh(g, bodyMat));
        };
        for (const sg of [1, -1]) {
          addMembrane([1.8, 1.9, 0.35 * sg], [-0.4, 2.9, 3.6 * sg], [1.0, 1.0, 2.0 * sg]);
          const a = new THREE.Vector3(1.8, 1.9, 0.35 * sg);
          const b = new THREE.Vector3(-0.4, 2.8, 3.4 * sg);
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

      anim.mode = "legacy";
      anim.dino = dino;
      anim.ground = fam.ground;
    }

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

    let raf;
    const tick = (t) => {
      if (anim.mode === "rig") {
        const ph0 = t * 0.0018;
        // Walk cycle: legs stride, body bobs and sways
        anim.root.position.y = Math.abs(Math.sin(ph0)) * 0.09;
        anim.pelvis.rotation.y = Math.sin(ph0) * 0.04;
        for (const leg of anim.legs) {
          const ph = ph0 + leg.phase;
          leg.thigh.rotation.z = 0.35 + Math.sin(ph) * 0.45;
          leg.knee.rotation.z = -0.8 - Math.max(0, Math.sin(ph - 1.2)) * 0.6;
          leg.ankle.rotation.z = 0.45 - Math.sin(ph) * 0.25;
        }
        // Tail sway rippling down the segments
        for (let i = 0; i < anim.tail.length; i++) {
          anim.tail[i].rotation.y = Math.sin(t * 0.0014 - i * 0.55) * 0.08;
          anim.tail[i].rotation.x = Math.sin(t * 0.0011 - i * 0.4) * 0.03;
        }
        // Head bob, breathing chest, occasional jaw snap, arm swing
        anim.neck.rotation.z = anim.neckBase + Math.sin(t * 0.0013) * 0.05;
        anim.head.rotation.z = anim.headBase + Math.sin(t * 0.0009) * 0.04;
        anim.jaw.rotation.z = -0.04 - Math.max(0, Math.sin(t * 0.0005) - 0.88) * 3;
        const br = 1 + Math.sin(t * 0.0016) * 0.02;
        anim.chest.scale.set(br, 1.1 * br, 0.9 * br);
        for (const arm of anim.arms) arm.rotation.z = 0.5 + Math.sin(ph0 + Math.PI) * 0.07;
      } else {
        anim.dino.position.y = -anim.ground + Math.sin(t / 900) * 0.1;
        anim.dino.rotation.y = Math.sin(t / 4500) * 0.05;
      }
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

  return <div ref={mountRef} className={className} style={{ cursor: "grab" }} />;
}