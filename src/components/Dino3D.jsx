import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Stylized 3D theropod built from primitives, facing +x, whose body/flank,
// belly and horns/claws materials follow the editor's chosen zone colors.
// Drag to orbit, scroll to zoom.
export default function Dino3D({ bodyColor, bellyColor, hornColor, className = "" }) {
  const mountRef = useRef(null);
  const matsRef = useRef(null);

  // Live color updates on the shared materials
  useEffect(() => {
    const mats = matsRef.current;
    if (!mats) return;
    mats.bodyMat.color.set(bodyColor);
    mats.bellyMat.color.set(bellyColor);
    mats.hornMat.color.set(hornColor);
  }, [bodyColor, bellyColor, hornColor]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(7, 3, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, -0.5, 0);
    controls.minDistance = 5;
    controls.maxDistance = 18;

    // Lighting: warm key + the page's pink/blue rim lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.DirectionalLight(0xfff1dd, 1.1);
    key.position.set(6, 8, 4);
    scene.add(key);
    const rimPink = new THREE.DirectionalLight(0xff2e7b, 0.7);
    rimPink.position.set(-8, 2, -6);
    scene.add(rimPink);
    const rimBlue = new THREE.DirectionalLight(0x66aaff, 0.5);
    rimBlue.position.set(4, -2, -8);
    scene.add(rimBlue);

    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.8 });
    const bellyMat = new THREE.MeshStandardMaterial({ color: bellyColor, roughness: 0.9 });
    const hornMat = new THREE.MeshStandardMaterial({ color: hornColor, roughness: 0.35, metalness: 0.15 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x0a0f0d, roughness: 0.3 });
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    matsRef.current = { bodyMat, bellyMat, hornMat };

    const dino = new THREE.Group();
    const add = (geo, mat, pos, rot, scale) => {
      const mesh = new THREE.Mesh(geo, mat);
      if (pos) mesh.position.set(...pos);
      if (rot) mesh.rotation.set(...rot);
      if (scale) mesh.scale.set(...scale);
      dino.add(mesh);
      return mesh;
    };

    // Torso (facing +x)
    add(new THREE.SphereGeometry(2, 32, 24), bodyMat, [0, 0, 0], null, [1.35, 1, 1]);
    // Belly / underside panel
    add(new THREE.SphereGeometry(1.55, 32, 24), bellyMat, [0.35, -0.85, 0], null, [1.05, 0.75, 0.88]);
    // Neck
    add(new THREE.CylinderGeometry(0.55, 0.8, 2.4, 16), bodyMat, [1.9, 1.5, 0], [0, 0, -0.9]);
    // Head + snout
    add(new THREE.SphereGeometry(0.9, 24, 18), bodyMat, [3.1, 2.3, 0], null, [1.35, 0.85, 0.95]);
    add(new THREE.BoxGeometry(1.1, 0.55, 0.8), bellyMat, [3.9, 2.05, 0]);
    // Eyes
    add(new THREE.SphereGeometry(0.14, 12, 12), eyeMat, [3.35, 2.55, 0.45]);
    add(new THREE.SphereGeometry(0.14, 12, 12), eyeMat, [3.35, 2.55, -0.45]);
    // Horns
    add(new THREE.ConeGeometry(0.22, 0.9, 12), hornMat, [2.75, 3.2, 0.45], [0, 0, 0.25]);
    add(new THREE.ConeGeometry(0.22, 0.9, 12), hornMat, [2.75, 3.2, -0.45], [0, 0, 0.25]);
    // Tail (tapering cone pointing back)
    add(new THREE.ConeGeometry(0.95, 5, 20), bodyMat, [-3.6, 0.5, 0], [0, 0, Math.PI / 2 + 0.12]);
    // Legs + feet
    add(new THREE.CylinderGeometry(0.5, 0.42, 2.6, 14), bodyMat, [0.85, -2.3, 0]);
    add(new THREE.CylinderGeometry(0.5, 0.42, 2.6, 14), bodyMat, [-0.85, -2.3, 0]);
    add(new THREE.BoxGeometry(1.5, 0.4, 1.0), bodyMat, [1.1, -3.7, 0]);
    add(new THREE.BoxGeometry(1.5, 0.4, 1.0), bodyMat, [-0.6, -3.7, 0]);
    // Claws on the feet (tip forward)
    for (const fx of [1.1, -0.6]) {
      for (let i = -1; i <= 1; i++) {
        add(new THREE.ConeGeometry(0.09, 0.35, 8), hornMat, [fx + 0.9, -3.85, i * 0.3], [0, 0, -Math.PI / 2]);
      }
    }
    // Small arms + hand claws
    add(new THREE.CylinderGeometry(0.18, 0.15, 0.9, 10), bodyMat, [1.7, -0.8, 0.7], [0, 0, 0.6]);
    add(new THREE.CylinderGeometry(0.18, 0.15, 0.9, 10), bodyMat, [1.7, -0.8, -0.7], [0, 0, 0.6]);
    add(new THREE.ConeGeometry(0.07, 0.3, 8), hornMat, [2.0, -1.35, 0.7], [0, 0, -Math.PI / 2]);
    add(new THREE.ConeGeometry(0.07, 0.3, 8), hornMat, [2.0, -1.35, -0.7], [0, 0, -Math.PI / 2]);
    scene.add(dino);

    // Soft ground shadow
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -4;
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
      dino.position.y = Math.sin(t / 900) * 0.12;
      dino.rotation.y = Math.sin(t / 4000) * 0.06;
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