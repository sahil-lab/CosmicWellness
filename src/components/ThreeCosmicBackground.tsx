import React, { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { PerformanceWarning, PerformanceStats } from './PerformanceMonitor';

// Optimized particle count based on device performance
const getParticleCount = () => {
    const isMobile = window.innerWidth < 768;
    const isLowEnd = navigator.hardwareConcurrency < 4;

    if (isMobile || isLowEnd) {
        return { stars: 2000, dust: 500, nebula: 200 };
    }
    return { stars: 5000, dust: 1500, nebula: 800 };
};

// Star Field Component with instanced rendering for performance
const StarField: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const { stars } = getParticleCount();

    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(stars * 3);
        const colors = new Float32Array(stars * 3);

        for (let i = 0; i < stars; i++) {
            // Create spherical distribution
            const radius = Math.random() * 100 + 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Random star colors (white, blue, yellow, red)
            const colorChoice = Math.random();
            if (colorChoice < 0.7) {
                colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = 1; // White
            } else if (colorChoice < 0.85) {
                colors[i * 3] = 0.7; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1; // Blue
            } else if (colorChoice < 0.95) {
                colors[i * 3] = 1; colors[i * 3 + 1] = 1; colors[i * 3 + 2] = 0.7; // Yellow
            } else {
                colors[i * 3] = 1; colors[i * 3 + 1] = 0.7; colors[i * 3 + 2] = 0.7; // Red
            }
        }

        return [positions, colors];
    }, [stars]);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.x = state.clock.elapsedTime * 0.0001;
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.0002;
        }
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={true}>
            <PointMaterial
                transparent
                vertexColors
                size={0.8}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
};

// Cosmic Dust Particles
const CosmicDust: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const { dust } = getParticleCount();

    const positions = useMemo(() => {
        const positions = new Float32Array(dust * 3);

        for (let i = 0; i < dust; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }

        return positions;
    }, [dust]);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.0005;

            // Add floating motion
            const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < dust; i++) {
                positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.001;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={true}>
            <PointMaterial
                transparent
                color="#8b5cf6"
                size={0.3}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
        </Points>
    );
};

// Animated Nebula Cloud
const NebulaCloud: React.FC<{ position: [number, number, number]; color: string; scale: number }> = ({
    position,
    color,
    scale
}) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.0002;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.0003;
            meshRef.current.rotation.z = state.clock.elapsedTime * 0.0001;

            // Pulsing effect
            const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 + 1;
            meshRef.current.scale.setScalar(scale * pulse);
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[10, 32, 32]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.1}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

// Galaxy Spiral Effect
const GalaxySpiral: React.FC = () => {
    const groupRef = useRef<THREE.Group>(null);
    const { nebula } = getParticleCount();

    const spiralPositions = useMemo(() => {
        const positions = new Float32Array(nebula * 3);
        const colors = new Float32Array(nebula * 3);

        for (let i = 0; i < nebula; i++) {
            const angle = i * 0.1;
            const radius = i * 0.2;

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = Math.sin(angle) * radius * 0.1;
            positions[i * 3 + 2] = Math.sin(angle) * radius;

            // Purple to pink gradient
            const t = i / nebula;
            colors[i * 3] = 0.5 + t * 0.5; // R
            colors[i * 3 + 1] = 0.2 + t * 0.3; // G
            colors[i * 3 + 2] = 0.8 + t * 0.2; // B
        }

        return [positions, colors];
    }, [nebula]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.0001;
        }
    });

    return (
        <group ref={groupRef}>
            <Points positions={spiralPositions[0]} stride={3} frustumCulled={true}>
                <PointMaterial
                    transparent
                    vertexColors
                    size={1.5}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    opacity={0.8}
                />
            </Points>
        </group>
    );
};

// Main 3D Scene Component
const Scene: React.FC = () => {
    const { camera } = useThree();

    useEffect(() => {
        // Set camera position for better view
        camera.position.set(0, 0, 30);
    }, [camera]);

    return (
        <>
            {/* Ambient lighting for subtle illumination */}
            <ambientLight intensity={0.2} />

            {/* Star field */}
            <StarField />

            {/* Cosmic dust */}
            <CosmicDust />

            {/* Galaxy spiral */}
            <GalaxySpiral />

            {/* Nebula clouds */}
            <NebulaCloud position={[-30, 10, -20]} color="#8b5cf6" scale={1.5} />
            <NebulaCloud position={[25, -15, -30]} color="#ec4899" scale={1.2} />
            <NebulaCloud position={[15, 20, -25]} color="#06b6d4" scale={1.0} />
            <NebulaCloud position={[-20, -10, -15]} color="#10b981" scale={0.8} />

            {/* Enhanced sparkles for extra magic */}
            <Sparkles
                count={50}
                scale={100}
                size={2}
                speed={0.3}
                color="#fbbf24"
                opacity={0.6}
            />
        </>
    );
};

// Loading fallback component
const LoadingFallback: React.FC = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg">Loading cosmic experience...</div>
        </div>
    </div>
);

// Performance Monitoring Component within Canvas
const PerformanceMonitor: React.FC<{ onFallback: () => void }> = ({ onFallback }) => {
    const [stats, setStats] = useState({ fps: 60, isOptimal: true });
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fpsHistory = useRef<number[]>([]);
    const [warningCount, setWarningCount] = useState(0);

    useFrame(() => {
        frameCount.current++;
        const now = performance.now();
        const frameTime = now - lastTime.current;

        if (frameCount.current % 60 === 0) {
            const fps = 1000 / frameTime;
            fpsHistory.current.push(fps);
            if (fpsHistory.current.length > 10) {
                fpsHistory.current.shift();
            }

            const avgFPS = fpsHistory.current.reduce((a, b) => a + b, 0) / fpsHistory.current.length;
            const isOptimal = avgFPS >= 25;

            setStats({ fps: Math.round(avgFPS), isOptimal });

            if (!isOptimal) {
                setWarningCount(prev => {
                    const newCount = prev + 1;
                    if (newCount >= 5) { // After 5 consecutive poor performance readings
                        onFallback();
                    }
                    return newCount;
                });
            } else {
                setWarningCount(0);
            }
        }

        lastTime.current = now;
    });

    return null; // This component doesn't render anything visual
};

// Main Three.js Cosmic Background Component
const ThreeCosmicBackground: React.FC<{ onFallback?: () => void }> = ({ onFallback }) => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
                <Canvas
                    camera={{ position: [0, 0, 30], fov: 60 }}
                    dpr={[1, 2]} // Adaptive pixel ratio for performance
                    performance={{ min: 0.5 }} // Adaptive performance
                    gl={{
                        antialias: false, // Disable for better performance
                        powerPreference: "high-performance",
                        alpha: true,
                        premultipliedAlpha: false
                    }}
                >
                    <Scene />
                    {onFallback && <PerformanceMonitor onFallback={onFallback} />}
                </Canvas>
            </Suspense>

            {/* CSS Gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-purple-950/30 to-pink-950/50 pointer-events-none" />
        </div>
    );
};

export default ThreeCosmicBackground; 