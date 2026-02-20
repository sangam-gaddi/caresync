"use client";

import { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { useOSStore } from "@/lib/store";

function HumanBody({ avatarState }: { avatarState: Record<string, unknown> | null }) {
    const groupRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF("/models/anatomy_lowquality_lowpoly.glb");
    const cloned = scene.clone();

    // Apply organ colors dynamically based on avatar state
    useEffect(() => {
        if (!avatarState || !cloned) return;

        const organs = avatarState.organs as Record<string, { color?: string; emissiveColor?: string; glowIntensity?: number }> | undefined;
        if (!organs) return;

        const organMeshMap: Record<string, string[]> = {
            heart: ["Heart", "heart", "Myocardium", "Aorta"],
            liver: ["Liver", "liver"],
            lungs: ["Lungs", "lungs", "Lung", "lung", "Right_Lung", "Left_Lung"],
            kidneys: ["Kidney", "kidney", "Kidneys", "Right_Kidney", "Left_Kidney"],
            brain: ["Brain", "brain"],
            stomach: ["Stomach", "stomach"],
        };

        cloned.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                const name = obj.name;
                for (const [organ, meshNames] of Object.entries(organMeshMap)) {
                    if (meshNames.some((n) => name.includes(n))) {
                        const organData = organs[organ];
                        if (organData && obj.material) {
                            const mat = (obj.material as THREE.MeshStandardMaterial).clone();
                            mat.color.set(organData.color || "#00e676");
                            mat.emissive.set(organData.emissiveColor || "#00e676");
                            mat.emissiveIntensity = (organData.glowIntensity as number) || 0.4;
                            mat.transparent = true;
                            mat.opacity = 0.92;
                            obj.material = mat;
                        }
                        break;
                    }
                }
            }
        });
    }, [avatarState, cloned]);

    // Gentle breathing animation
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.001;
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
        }
    });

    return (
        <group ref={groupRef} scale={[1.8, 1.8, 1.8]} position={[0, -1.5, 0]}>
            <primitive object={cloned} />
        </group>
    );
}

function SceneSetup() {
    const { camera } = useThree();
    useEffect(() => {
        camera.position.set(0, 0.5, 4.5);
    }, [camera]);
    return null;
}

function LoadingFallback() {
    return (
        <Html center>
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-white/60 font-mono">Loading 3D Model...</p>
            </div>
        </Html>
    );
}

export default function BodyScene() {
    const { avatarState, healthScore } = useOSStore();

    return (
        <div className="relative w-full h-full bg-[#080c14] rounded-xl overflow-hidden">
            {/* Health score overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className="os-glass rounded-xl p-3 text-center">
                    <div
                        className="text-2xl font-bold"
                        style={{
                            color:
                                healthScore >= 80 ? "#00e676" : healthScore >= 60 ? "#ffab40" : "#ff1744",
                        }}
                    >
                        {healthScore}
                    </div>
                    <div className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
                        Health Score
                    </div>
                </div>
            </div>

            {/* Organ legends */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
                {avatarState?.organs &&
                    Object.entries(avatarState.organs as Record<string, Record<string, unknown>>).map(([name, data]) => (
                        <div key={name} className="flex items-center gap-2 os-glass px-2 py-1 rounded-lg">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: (data.color as string) || "#00e676" }}
                            />
                            <span className="text-[10px] font-medium capitalize text-white/70">
                                {name}
                            </span>
                            <span
                                className="text-[9px] capitalize ml-1"
                                style={{
                                    color:
                                        data.status === "healthy"
                                            ? "#00e676"
                                            : data.status === "warning"
                                                ? "#ffab40"
                                                : "#ff1744",
                                }}
                            >
                                {data.status as string}
                            </span>
                        </div>
                    ))}
            </div>

            {/* Scan line effect */}
            <div className="absolute inset-0 pointer-events-none z-10 scan-line-overlay" />

            {/* Three.js Canvas */}
            <Canvas
                camera={{ position: [0, 0.5, 4.5], fov: 40 }}
                shadows
                gl={{ antialias: true, alpha: true }}
            >
                <SceneSetup />
                <ambientLight intensity={0.3} />
                <pointLight position={[3, 5, 3]} intensity={1.5} color="#00e5ff" />
                <pointLight position={[-3, 2, -3]} intensity={0.8} color="#7c3aed" />
                <pointLight position={[0, -2, 2]} intensity={0.5} color="#00e676" />

                <Suspense fallback={<LoadingFallback />}>
                    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
                        <HumanBody avatarState={avatarState} />
                    </Float>
                    <Environment preset="night" />
                </Suspense>

                <OrbitControls
                    enablePan={false}
                    maxDistance={7}
                    minDistance={2}
                    autoRotate={false}
                    enableDamping
                    dampingFactor={0.05}
                />
            </Canvas>

            {/* Bottom instruction */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
                <p className="text-[10px] text-white/30 font-mono">
                    Drag to rotate · Scroll to zoom
                </p>
            </div>
        </div>
    );
}

useGLTF.preload("/models/anatomy_lowquality_lowpoly.glb");
