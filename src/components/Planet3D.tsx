"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

// Daraja oshgani sari sayyora boyib boradi: rang, atmosfera, halqa, yo'ldoshlar.
function palette(level: number) {
  const hue = (200 + level * 23) % 360;
  return {
    body: new THREE.Color().setHSL(hue / 360, 0.65, 0.45),
    glow: new THREE.Color().setHSL(((hue + 40) % 360) / 360, 0.9, 0.6),
    ring: new THREE.Color().setHSL(((hue + 120) % 360) / 360, 0.5, 0.7),
  };
}

function makeTexture(level: number) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  const hue = (200 + level * 23) % 360;
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, `hsl(${hue}, 60%, 55%)`);
  grad.addColorStop(0.5, `hsl(${(hue + 30) % 360}, 55%, 38%)`);
  grad.addColorStop(1, `hsl(${(hue + 60) % 360}, 60%, 30%)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 256);
  // Doimiy (deterministik) "kontinent" dog'lari
  let seed = level * 9301 + 49297;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const blobs = 14 + Math.min(level, 20);
  for (let i = 0; i < blobs; i++) {
    g.fillStyle = `hsla(${(hue + 100 + rnd() * 60) % 360}, 55%, ${40 + rnd() * 25}%, ${0.25 + rnd() * 0.4})`;
    g.beginPath();
    g.ellipse(rnd() * 512, rnd() * 256, 20 + rnd() * 60, 8 + rnd() * 26, rnd() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function Planet({ level }: { level: number }) {
  const body = useRef<THREE.Mesh>(null);
  const moons = useRef<THREE.Group>(null);
  const pal = useMemo(() => palette(level), [level]);
  const tex = useMemo(() => makeTexture(level), [level]);
  const moonCount = Math.min(3, Math.floor(level / 5));
  const hasRing = level >= 5;

  useFrame((_, dt) => {
    if (body.current) body.current.rotation.y += dt * 0.15;
    if (moons.current) moons.current.rotation.y += dt * 0.5;
  });

  return (
    <group rotation={[0.35, 0, 0.15]}>
      <mesh ref={body}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshStandardMaterial map={tex} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* atmosfera */}
      <mesh scale={1.12}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshBasicMaterial color={pal.glow} transparent opacity={0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
      </mesh>
      {hasRing && (
        <mesh rotation={[Math.PI / 2.2, 0, 0]}>
          <ringGeometry args={[2.1, 2.9, 128]} />
          <meshBasicMaterial color={pal.ring} transparent opacity={0.45} side={THREE.DoubleSide} />
        </mesh>
      )}
      <group ref={moons}>
        {Array.from({ length: moonCount }, (_, i) => (
          <mesh key={i} position={[Math.cos((i * Math.PI * 2) / moonCount) * 3.3, 0.3 * i, Math.sin((i * Math.PI * 2) / moonCount) * 3.3]}>
            <sphereGeometry args={[0.18 + i * 0.04, 24, 24]} />
            <meshStandardMaterial color="#cbd5e1" roughness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function Planet3D({ level = 1, className = "" }: { level?: number; className?: string }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6.2], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.55} />
        <directionalLight position={[5, 3, 5]} intensity={2.4} color="#ffffff" />
        <pointLight position={[-6, -2, -3]} intensity={18} color="#9065FF" />
        <Stars radius={60} depth={30} count={1500} factor={3} fade speed={0.6} />
        <Planet level={level} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
      </Canvas>
    </div>
  );
}
