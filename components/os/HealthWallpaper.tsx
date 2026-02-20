"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useOSStore } from "@/lib/store";

export default function HealthWallpaper() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { healthScore } = useOSStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x040810, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 4);

        // --- DNA Helix / Particle Network ---
        const particleCount = 2000;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        // Health color based on score
        const getHealthColor = (score: number) => {
            if (score >= 80) return new THREE.Color(0x00e5ff); // cyan - excellent
            if (score >= 60) return new THREE.Color(0x00e676); // green - good
            if (score >= 40) return new THREE.Color(0xffab40); // amber - warning
            return new THREE.Color(0xff1744); // red - critical
        };

        const primaryColor = getHealthColor(healthScore);

        for (let i = 0; i < particleCount; i++) {
            const t = (i / particleCount) * Math.PI * 20;
            const radius = 1.5 + Math.random() * 0.8;

            // Two intertwined helices
            if (i % 2 === 0) {
                positions[i * 3] = Math.cos(t) * 1.2;
                positions[i * 3 + 1] = t * 0.1 - 10;
                positions[i * 3 + 2] = Math.sin(t) * 1.2;
            } else {
                positions[i * 3] = Math.cos(t + Math.PI) * 1.2;
                positions[i * 3 + 1] = t * 0.1 - 10;
                positions[i * 3 + 2] = Math.sin(t + Math.PI) * 1.2;
            }

            // Color variation
            const mixRatio = Math.random();
            const color = primaryColor.clone().lerp(new THREE.Color(0x7c3aed), mixRatio * 0.4);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 3 + 1;
        }

        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        particleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

        const particleMat = new THREE.PointsMaterial({
            size: 0.025,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false,
        });

        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // --- Connection Lines between helix strands ---
        const lineGeo = new THREE.BufferGeometry();
        const linePositions: number[] = [];
        const lineColors: number[] = [];
        for (let i = 0; i < particleCount - 2; i += 40) {
            linePositions.push(
                positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                positions[(i + 1) * 3], positions[(i + 1) * 3 + 1], positions[(i + 1) * 3 + 2]
            );
            lineColors.push(primaryColor.r * 0.5, primaryColor.g * 0.5, primaryColor.b * 0.5);
            lineColors.push(0.4, 0.1, 0.8);
        }
        lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
        lineGeo.setAttribute("color", new THREE.Float32BufferAttribute(lineColors, 3));
        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.25,
            blending: THREE.AdditiveBlending,
        });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lines);

        // --- Background starfield ---
        const starCount = 3000;
        const starPositions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            starPositions[i * 3] = (Math.random() - 0.5) * 30;
            starPositions[i * 3 + 1] = (Math.random() - 0.5) * 30;
            starPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
        }
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
        const starMat = new THREE.PointsMaterial({
            size: 0.01,
            color: 0xffffff,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
        });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- Ambient nebula plane ---
        const planeGeo = new THREE.PlaneGeometry(20, 20);
        const planeMat = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                primaryColor: { value: new THREE.Vector3(primaryColor.r, primaryColor.g, primaryColor.b) },
            },
            vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `
        uniform float time;
        uniform vec3 primaryColor;
        varying vec2 vUv;
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        void main() {
          vec2 uv = vUv;
          float n = noise(uv * 5.0 + time * 0.05);
          float n2 = noise(uv * 10.0 - time * 0.03);
          float intensity = n * n2 * 0.08;
          vec3 color = primaryColor * intensity + vec3(0.12, 0.0, 0.25) * n2 * 0.05;
          gl_FragColor = vec4(color, intensity * 0.6);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });
        const plane = new THREE.Mesh(planeGeo, planeMat);
        plane.position.z = -3;
        scene.add(plane);

        // Animation
        let animId: number;
        const clock = new THREE.Clock();

        const animate = () => {
            animId = requestAnimationFrame(animate);
            const elapsed = clock.getElapsedTime();

            // Slowly rotate the DNA helix
            particles.rotation.y = elapsed * 0.08;
            lines.rotation.y = elapsed * 0.08;
            particles.rotation.x = Math.sin(elapsed * 0.05) * 0.2;
            lines.rotation.x = Math.sin(elapsed * 0.05) * 0.2;

            // Scroll the helix
            particles.position.y = (elapsed * 0.15) % 2 - 1;
            lines.position.y = (elapsed * 0.15) % 2 - 1;

            // Stars slow twinkle
            stars.rotation.y = elapsed * 0.005;

            // Shader time
            planeMat.uniforms.time.value = elapsed;

            renderer.render(scene, camera);
        };

        animate();

        const onResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", onResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", onResize);
            renderer.dispose();
        };
    }, [healthScore]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ zIndex: 0 }}
        />
    );
}
