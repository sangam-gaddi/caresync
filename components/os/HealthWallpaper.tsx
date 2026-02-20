"use client";

import { Suspense, useRef, useEffect, useMemo } from "react";
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
                        mat.emissiveIntensity = (data?.glowIntensity as number) ?? 0.35;
                        mat.transparent = true;
                        mat.opacity = 0.94;
                        mat.roughness = 0.4;
                        mat.metalness = 0.1;
                        obj.material = mat;
                        break;
                    }
                }
            }
        });
    }, [avatarState, cloned]);

    // Subtle idle breathing
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Larger scale, positioned higher — model sits in the upper portion of the screen */}
            <primitive object={cloned} scale={[3.2, 3.2, 3.2]} position={[0, -1.4, 0]} />
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

    const geo = useMemo(() => {
        const count = 1800;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const t = (i / count) * Math.PI * 20;
            const r = 5.0;
            if (i % 2 === 0) {
                positions[i * 3] = Math.cos(t) * r;
                positions[i * 3 + 1] = t * 0.2 - 20;
                positions[i * 3 + 2] = Math.sin(t) * r - 1;
            } else {
                positions[i * 3] = Math.cos(t + Math.PI) * r;
                positions[i * 3 + 1] = t * 0.2 - 20;
                positions[i * 3 + 2] = Math.sin(t + Math.PI) * r - 1;
            }
            const c = primaryColor.clone().lerp(new THREE.Color(0x7c3aed), Math.random() * 0.5);
            colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        return g;
    }, [primaryColor]);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.04;
            pointsRef.current.position.y = (state.clock.elapsedTime * 0.06) % 4 - 2;
        }
    });

    return (
        <points ref={pointsRef} geometry={geo}>
            <pointsMaterial size={0.025} vertexColors transparent opacity={0.6}
                blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation />
        </points>
    );
}

export default function DesktopWallpaper() {
    const { isDarkMode } = useOSStore();

    const bgColor = isDarkMode ? "#040810" : "#e8ecf0";
    const lightColor1 = isDarkMode ? "#00e5ff" : "#0088cc";
    const lightColor2 = isDarkMode ? "#7c3aed" : "#6d28d9";
    const lightColor3 = isDarkMode ? "#00e676" : "#059669";
    const ambientIntensity = isDarkMode ? 0.3 : 0.6;
    const starsCount = isDarkMode ? 3000 : 800;

    return (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0, background: bgColor }}>
            {/* ── Looping wallpaper video (no audio) ── */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ zIndex: 0 }}
                src="/wallpaper-video.mp4"
            />
            {/* ── Tint overlay so 3D model remains readable ── */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    zIndex: 1,
                    background: isDarkMode
                        ? "rgba(4,8,16,0.55)"
                        : "rgba(230,235,240,0.40)",
                }}
            />

            <Canvas
                camera={{ position: [0, 1.8, 5.5], fov: 42, near: 0.1, far: 200 }}
                gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping }}
                style={{ width: "100%", height: "100%", display: "block", position: "relative", zIndex: 2, background: "transparent" }}
            >
                {/* Camera looks at upper-body area — pushes model into upper 60% of viewport */}

                {/* Lighting */}
                <ambientLight intensity={ambientIntensity} />
                <pointLight position={[3, 6, 4]} intensity={2.8} color={lightColor1} />
                <pointLight position={[-4, 3, -3]} intensity={1.8} color={lightColor2} />
                <pointLight position={[0, -2, 4]} intensity={1.2} color={lightColor3} />
                <pointLight position={[0, 10, 0]} intensity={0.8} color="#ffffff" />
                {/* Rim light for better model readability */}
                <directionalLight position={[-2, 4, -4]} intensity={0.6} color="#ffffff" />
                <directionalLight position={[2, 4, 4]} intensity={0.4} color={lightColor1} />

                {/* Starfield */}
                <Stars radius={100} depth={80} count={starsCount} factor={4} saturation={isDarkMode ? 0.1 : 0.3} fade speed={0.3} />

                {/* Helix particles */}
                <HelixParticles />

                {/* 3D Body — draggable via OrbitControls */}
                <Suspense fallback={null}>
                    <BodyMesh />
                    <Environment preset={isDarkMode ? "night" : "city"} />
                </Suspense>

                {/* OrbitControls: target shifted up so model renders in upper screen area */}
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
                    target={[0, 1.0, 0]}
                />
            </Canvas>

            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none" style={{
                background: isDarkMode
                    ? "radial-gradient(ellipse at center, transparent 40%, rgba(4,8,16,0.70) 100%)"
                    : "radial-gradient(ellipse at center, transparent 50%, rgba(200,210,220,0.55) 100%)",
                zIndex: 3
            }} />
            {/* Bottom fade for dock clearance */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
                background: isDarkMode
                    ? "linear-gradient(to top, rgba(4,8,16,0.95), transparent)"
                    : "linear-gradient(to top, rgba(220,225,230,0.9), transparent)",
                zIndex: 3
            }} />
            {/* Top fade for menubar */}
            <div className="absolute top-0 left-0 right-0 h-14 pointer-events-none" style={{
                background: isDarkMode
                    ? "linear-gradient(to bottom, rgba(4,8,16,0.75), transparent)"
                    : "linear-gradient(to bottom, rgba(220,225,230,0.6), transparent)",
                zIndex: 3
            }} />
        </div>
    );
}

useGLTF.preload("/models/anatomy_lowquality_lowpoly.glb");
