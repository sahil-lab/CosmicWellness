import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple star field using pure Three.js
const StarField: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(1500 * 3);
        const colors = new Float32Array(1500 * 3);

        for (let i = 0; i < 1500; i++) {
            // Random distribution in a sphere
            const radius = Math.random() * 80 + 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // White stars with slight color variation
            const brightness = 0.8 + Math.random() * 0.2;
            colors[i * 3] = brightness;
            colors[i * 3 + 1] = brightness;
            colors[i * 3 + 2] = brightness;
        }

        return [positions, colors];
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.0001;
        }
    });

    const geometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        return geometry;
    }, [positions, colors]);

    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            size: 2,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
    }, []);

    return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Floating cosmic dust
const CosmicDust: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const positions = new Float32Array(800 * 3);

        for (let i = 0; i < 800; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.x = state.clock.elapsedTime * 0.0001;
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.0002;
        }
    });

    const geometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, [positions]);

    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            size: 1,
            transparent: true,
            color: new THREE.Color('#8b5cf6'),
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
    }, []);

    return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Nebula clouds
const NebulaCloud: React.FC<{ position: [number, number, number]; color: string; scale: number }> = ({
    position,
    color,
    scale
}) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.elapsedTime * 0.0001;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.0002;

            const pulse = Math.sin(state.clock.elapsedTime * 0.3) * 0.1 + 1;
            meshRef.current.scale.setScalar(scale * pulse);
        }
    });

    const geometry = useMemo(() => new THREE.SphereGeometry(8, 16, 16), []);
    const material = useMemo(() => {
        return new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
        });
    }, [color]);

    return (
        <mesh ref={meshRef} position={position} geometry={geometry} material={material} />
    );
};

// Sparkle effect using custom geometry
const SparkleEffect: React.FC = () => {
    const pointsRef = useRef<THREE.Points>(null);

    const positions = useMemo(() => {
        const positions = new Float32Array(100 * 3);

        for (let i = 0; i < 100; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 60;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.z = state.clock.elapsedTime * 0.0001;

            // Animate individual sparkles
            const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < 100; i++) {
                positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
            }
            pointsRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    const geometry = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, [positions]);

    const material = useMemo(() => {
        return new THREE.PointsMaterial({
            size: 4,
            transparent: true,
            color: new THREE.Color('#fbbf24'),
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });
    }, []);

    return <points ref={pointsRef} geometry={geometry} material={material} />;
};

// Main scene
const Scene: React.FC = () => {
    return (
        <>
            <ambientLight intensity={0.4} />
            <StarField />
            <CosmicDust />
            <NebulaCloud position={[-25, 12, -20]} color="#8b5cf6" scale={1.2} />
            <NebulaCloud position={[20, -15, -25]} color="#ec4899" scale={1.0} />
            <NebulaCloud position={[5, 18, -30]} color="#06b6d4" scale={0.8} />
            <NebulaCloud position={[-15, -8, -15]} color="#10b981" scale={0.9} />
            <SparkleEffect />
        </>
    );
};

// Loading fallback
const LoadingFallback: React.FC = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg animate-pulse">Loading cosmic experience...</div>
        </div>
    </div>
);

// Main component
const ThreeCosmicBackground: React.FC<{ onFallback?: () => void }> = ({ onFallback }) => {
    return (
        <div className="absolute inset-0 overflow-hidden">
            <Suspense fallback={<LoadingFallback />}>
                <Canvas
                    camera={{ position: [0, 0, 35], fov: 75 }}
                    dpr={[1, 1.5]}
                    gl={{
                        antialias: false,
                        alpha: true,
                        powerPreference: "high-performance"
                    }}
                >
                    <Scene />
                </Canvas>
            </Suspense>

            {/* CSS gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-purple-950/15 to-pink-950/30 pointer-events-none" />
        </div>
    );
};

export default ThreeCosmicBackground; 