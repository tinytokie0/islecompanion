import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Realistic 3D theropod, facing +x: a smooth swept spine body (tail, torso,
// neck) with vertex-colored zones — the underside takes the belly color, the
// back the body color (with darker stripes for the brindle pattern) — plus a
// sculpted head with jaws and teeth, legs with clawed toes and hornColor
// horns, teeth and claws. Drag to orbit, scroll to zoom.
export default function Dino3D({ bodyColor, bellyColor, hornColor, pattern = "default", className = "" }) {
  const mountRef = useRef(null);
  const refs = useRef({});

  // Spine centerline: tail tip -> hips -> torso -> neck. r = body radius.
  const SPINE = [
    { x: -8.2, y: 0.7, r: 0.06 },
    { x: -7.2, y: 0.65, r: 0.3 },
    { x: -5.8, y: 0.55, r: 0.65 },
    { x: -4.2, y: 0.5, r: 1.0 },
    { x: -2.4, y: 0.55, r: 1.45 },
    { x: -0.4, y: 0.55, r: 1.85 },
    { x: 1.2, y: 0.75, r: 1.6 },
    { x: 2.2, y: 1.2, r: 1.25 },
    { x: 2.9, y: 1.9, r: 0.85 },
    { x: 3.4, y: 2.8, r: 0.68 },
    { x: 3.8, y: 3.6, r: 0.55 },
  ];

  // hex -> [r,g,b] in 0..1; a darker/lighter accent for the stripes
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

  // Live recolor of the swept body (zone + stripes) and the solid parts
  useEffect(() => {
    const r = refs.current;
    if (!r.geo) return;
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
    r.bodyMat.color.set(bodyColor);
    r.bellyMat.color.set(bellyColor);
    r.hornMat.color.set(hornColor);
  }, [bodyColor, bellyColor, hornColor, pattern]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(7, 2.5, 11);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);
    controls.minDistance = 6;
    controls.maxDistance = 26;

    // Lighting: warm key + the page's pink/blue rim lights
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

    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.9 });
    const hornMat = new THREE.MeshStandardMaterial({ color: hornColor, roughness: 0.35, metalness: 0.15 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0f0d, roughness: 0.25 });
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    refs.current = { ...refs.current, bodyMat, bellyMat, hornMat };

    const dino = new THREE.Group();
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
    for (const p of SPINE) {
      for (let j = 0; j < RADIAL; j++) {
        const th = (j / RADIAL) * Math.PI * 2;
        positions.push(p.x, p.y + Math.cos(th) * p.r, Math.sin(th) * p.r * 0.88);
        const bottom = Math.max(0, -Math.cos(th));
        bellyFactor.push(Math.min(1, Math.max(0, (bottom - 0.25) / 0.45)));
      }
    }
    const R = SPINE.length;
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
    // Tail tip cap
    const tipIndex = positions.length / 3;
    positions.push(SPINE[0].x - 0.25, SPINE[0].y, 0);
    bellyFactor.push(0);
    for (let j = 0; j < RADIAL; j++) indices.push(tipIndex, j, (j + 1) % RADIAL);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    const bodySweepMat = new THREE.MeshStandardMaterial({
      roughness: 0.78,
      vertexColors: true,
      side: THREE.DoubleSide,
    });
    refs.current = { ...refs.current, geo, belly: bellyFactor };
    dino.add(new THREE.Mesh(geo, bodySweepMat));

    // ---- Head: skull, snout, jaw, teeth, eyes, horns --------------------
    add(new THREE.SphereGeometry(0.75, 24, 18), bodyMat, [4.9, 3.9, 0], null, [1.25, 0.75, 0.8]);
    add(new THREE.BoxGeometry(1.7, 0.6, 0.65), bodyMat, [5.8, 3.85, 0]);
    add(new THREE.BoxGeometry(1.5, 0.22, 0.55), bellyMat, [5.75, 3.5, 0]);
    for (let t = 0; t < 5; t++) {
      const tx = 5.35 + t * 0.25;
      add(new THREE.ConeGeometry(0.05, 0.22, 6), hornMat, [tx, 3.6, 0.28], [Math.PI, 0, 0]);
      add(new THREE.ConeGeometry(0.05, 0.22, 6), hornMat, [tx, 3.6, -0.28], [Math.PI, 0, 0]);
    }
    add(new THREE.SphereGeometry(0.11, 12, 12), eyeMat, [4.75, 4.15, 0.42]);
    add(new THREE.SphereGeometry(0.11, 12, 12), eyeMat, [4.75, 4.15, -0.42]);
    add(new THREE.ConeGeometry(0.2, 0.85, 12), hornMat, [4.5, 4.85, 0.3], [0, 0, 0.2]);
    add(new THREE.ConeGeometry(0.2, 0.85, 12), hornMat, [4.5, 4.85, -0.3], [0, 0, 0.2]);

    // ---- Legs with clawed toes + small arms -----------------------------
    for (const z of [0.95, -0.95]) {
      add(new THREE.CapsuleGeometry(0.55, 1.3, 6, 12), bodyMat, [-1.1, -1.7, z], [0, 0, 0.25]);
      add(new THREE.CapsuleGeometry(0.3, 1.5, 6, 12), bodyMat, [-0.75, -3.0, z]);
      add(new THREE.BoxGeometry(1.4, 0.3, 0.8), bodyMat, [-0.3, -4.05, z]);
      for (const tz of [-0.25, 0, 0.25]) {
        add(new THREE.CapsuleGeometry(0.11, 0.5, 4, 8), bodyMat, [0.05, -4.05, z + tz], [0, 0, Math.PI / 2]);
        add(new THREE.ConeGeometry(0.08, 0.3, 8), hornMat, [0.45, -4.0, z + tz], [0, 0, -Math.PI / 2]);
      }
      add(new THREE.CapsuleGeometry(0.16, 0.6, 4, 10), bodyMat, [2.2, 0.4, z * 0.74], [0, 0, 0.9]);
      add(new THREE.ConeGeometry(0.06, 0.25, 8), hornMat, [2.55, -0.05, z * 0.74], [0, 0, -Math.PI / 2]);
    }
    scene.add(dino);

    // Soft ground shadow
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(4, 32), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -4.3;
    scene.add(shadow);

    // Size to the mount and keep it in sync
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

    // Gentle idle bob
    let raf;
    const tick = (t) => {
      dino.position.y = Math.sin(t / 900) * 0.1;
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
  }, []);

  return <div ref={mountRef} className={className} style={{ cursor: "grab" }} />;
}