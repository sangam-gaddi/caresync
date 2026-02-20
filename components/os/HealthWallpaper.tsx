"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useOSStore } from "@/lib/store";

function BodyMesh() {
    const { scene } = useGLTF("/models/anatomy_lowquality_lowpoly.glb");
    const cloned = useRef(scene.clone()).current;
    const meshRef = useRef<THREE.Group>(null);
    const { avatarState } = useOSStore();

    // Apply organ colors from avatarState
    useEffect(() => {
        const organs = (avatarState?.organs as Record<string, { color?: string; emissiveColor?: string; glowIntensity?: number }> | undefined);
        const organMeshMap: Record<string, string[]> = {
            heart: ["Heart", "heart", "Myocardium", "Aorta"],
            liver: ["Liver", "liver"],
            lungs: ["Lungs", "lungs", "Lung", "lung", "Right_Lung", "Left_Lung"],
            kidneys: ["Kidney", "kidney", "Kidneys"],
            brain: ["Brain", "brain"],
            stomach: ["Stomach", "stomach"],
        };

        cloned.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                for (const [organ, meshNames] of Object.entries(organMeshMap)) {
                    if (meshNames.some((n) => obj.name.includes(n))) {
                        const data = organs?.[organ];
                        const mat = new THREE.MeshStandardMaterial();
                        mat.color.set(data?.color || "#00e676");
                        mat.emissive.set(data?.emissiveColor || "#00e676");
                        mat.emissiveIntensity = (data?.glowIntensity as number) ?? 0.3;
                        mat.transparent = true;
                        mat.opacity = 0.92;
                        obj.material = mat;
                        break;
                    }
                }
            }
        });
    }, [avatarState, cloned]);

    // Subtle idle breathing (only when not being dragged — OrbitControls handles drag)
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.04;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Scale to fill viewport: model is ~1.7m tall, we scale to ~3 units */}
            <primitive object={cloned} scale={[2.6, 2.6, 2.6]} position={[0, -2.2, 0]} />
        </group>
    );
}

function HelixParticles() {
    const pointsRef = useRef<THREE.Points>(null);
    const { healthScore } = useOSStore();

    const primaryColor =
        healthScore >= 80 ? new THREE.Color(0x00e5ff)
            : healthScore >= 60 ? new THREE.Color(0x00e676)
                : healthScore >= 40 ? new THREE.Color(0xffab40)
                    : new THREE.Color(0xff1744);

    const geo = useRef<THREE.BufferGeometry | null>(null);
    if (!geo.current) {
        const count = 1400;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 18;
            const r = 4.5;
            if (i % 2 === 0) {
                positions[i * 3] = Math.cos(t) * r;
                positions[i * 3 + 1] = t * 0.22 - 20;
                positions[i * 3 + 2] = Math.sin(t) * r - 1;
            } else {
                positions[i * 3] = Math.cos(t + Math.PI) * r;
                positions[i * 3 + 1] = t * 0.22 - 20;
                positions[i * 3 + 2] = Math.sin(t + Math.PI) * r - 1;
            }
            const c = primaryColor.clone().lerp(new THREE.Color(0x7c3aed), Math.random() * 0.5);
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        geo.current = g;
    }

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
            pointsRef.current.position.y = (state.clock.elapsedTime * 0.08) % 4 - 2;
        }
    });

    return (
        <points ref={pointsRef} geometry={geo.current}>
            <pointsMaterial size={0.022} vertexColors transparent opacity={0.65}
                blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
        </points>
    );
}

export default function DesktopWallpaper() {
    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0, background: "#040810" }}>
            <Canvas
                camera={{ position: [0, 0.5, 5], fov: 45, near: 0.1, far: 200 }}
                gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ width: "100%", height: "100%", display: "block", background: "#040810" }}
            >
                {/* Lighting */}
                <ambientLight intensity={0.3} />
                <pointLight position={[3, 5, 4]} intensity={2.5} color="#00e5ff" />
                <pointLight position={[-4, 2, -3]} intensity={1.5} color="#7c3aed" />
                <pointLight position={[0, -3, 4]} intensity={1.0} color="#00e676" />
                <pointLight position={[0, 10, 0]} intensity={0.6} color="#ffffff" />

                {/* ── Starfield ── */}
                <Stars radius={100} depth={80} count={3000} factor={4} saturation={0.1} fade speed={0.3} />

                {/* ── Helix particles ── */}
                <HelixParticles />

                {/* ── 3D Body — draggable via OrbitControls ── */}
                <Suspense fallback={null}>
                    <BodyMesh />
                    <Environment preset="night" />
                </Suspense>

                {/* OrbitControls: user can rotate/drag the entire scene */}
                <OrbitControls
                    enableZoom={true}
                    enablePan={false}
                    minDistance={3}
                    maxDistance={9}
                    minPolarAngle={Math.PI * 0.15}
                    maxPolarAngle={Math.PI * 0.85}
                    dampingFactor={0.08}
                    enableDamping
                    autoRotate={false}
                    target={[0, 0, 0]}
                />
            </Canvas>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(4,8,16,0.70) 100%)", zIndex: 1 }} />
            {/* Bottom fade for dock */}
            <div className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(4,8,16,0.9), transparent)", zIndex: 1 }} />
            {/* Top fade for menubar */}
            <div className="absolute top-0 left-0 right-0 h-14 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(4,8,16,0.75), transparent)", zIndex: 1 }} />
        </div>
    );
}

useGLTF.preload("/models/anatomy_lowquality_lowpoly.glb");
